from __future__ import annotations

import re
from collections import Counter
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse
from uuid import uuid4

from server.utils.openai_analysis import get_ai_capabilities, request_openai_analysis
from server.utils.store import add_scan

EMAIL_PATTERN = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"(?:(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})")
NAME_PATTERN = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b")
SHORTENER_DOMAINS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "rebrand.ly",
}
TRUSTED_DOMAINS = {
    "school.edu",
    "irs.gov",
    "usa.gov",
    "cdc.gov",
    "khanacademy.org",
    "wikipedia.org",
    "google.com",
    "apple.com",
    "microsoft.com",
    "bankofamerica.com",
    "chase.com",
}
BRAND_KEYWORDS = {
    "bank": "financial institution language without a clearly trusted domain",
    "paypal": "payment-service branding language without a clearly trusted domain",
    "microsoft": "well-known account branding that is often impersonated",
    "apple": "well-known account branding that is often impersonated",
    "amazon": "shopping-account branding that is often impersonated",
    "netflix": "subscription-account branding that is often impersonated",
    "school": "institutional language that should still be verified through official channels",
    "payroll": "employment-related language that can be used in impersonation scams",
}


def redact_sensitive_content(content: str) -> str:
    redacted = EMAIL_PATTERN.sub("[redacted email]", content)
    redacted = PHONE_PATTERN.sub("[redacted phone]", redacted)

    def replace_name(match: re.Match[str]) -> str:
        token = match.group(0)
        if token.lower() in {"safe", "suspicious", "high risk"}:
            return token
        return "[redacted name]"

    return NAME_PATTERN.sub(replace_name, redacted)


def extract_text_indicators(content: str) -> list[dict[str, Any]]:
    lowered = content.lower()
    indicators: list[dict[str, Any]] = []

    # Explainable scoring rules: each rule adds or subtracts score and a plain-language reason.
    rulebook = [
        (
            "credential request",
            4,
            "The message asks for a password, code, or account details, which is a strong phishing signal.",
            [r"password", r"passcode", r"verification code", r"log in", r"login", r"account details"],
        ),
        (
            "payment request",
            4,
            "The message asks for money or payment, which can signal a scam.",
            [r"wire transfer", r"send money", r"payment", r"invoice", r"zelle", r"venmo"],
        ),
        (
            "gift card request",
            5,
            "Gift card requests are a very common scam tactic.",
            [r"gift card", r"apple card", r"steam card"],
        ),
        (
            "urgency",
            3,
            "The message creates pressure to act quickly instead of giving you time to verify.",
            [r"urgent", r"immediately", r"right away", r"within 24 hours", r"final warning", r"act now"],
        ),
        (
            "threat",
            4,
            "The message uses threats or account warnings to push a reaction.",
            [r"suspend", r"locked", r"penalty", r"legal action", r"deactivated", r"security alert"],
        ),
        (
            "impersonation cue",
            3,
            "The wording looks like it may be impersonating a trusted organization or authority.",
            [r"dear customer", r"it support", r"help desk", r"bank team", r"admin office"],
        ),
        (
            "attachment or link push",
            2,
            "The message pushes you toward clicking a link or opening an attachment.",
            [r"click here", r"open attachment", r"download", r"review document", r"confirm here"],
        ),
        (
            "mild uncertainty",
            1,
            "Some details are vague, which can make the message harder to trust.",
            [r"need a favor", r"quick task", r"are you available", r"kindly"],
        ),
    ]

    for label, score, reason, patterns in rulebook:
        if any(re.search(pattern, lowered) for pattern in patterns):
            indicators.append({"label": label, "score": score, "reason": reason})

    for keyword, explanation in BRAND_KEYWORDS.items():
        if keyword in lowered:
            indicators.append(
                {
                    "label": f"{keyword} branding",
                    "score": 1,
                    "reason": f"The message mentions {keyword}, so it is worth checking whether it really came from an official source.",
                }
            )

    if EMAIL_PATTERN.search(content):
        indicators.append(
            {
                "label": "contains email address",
                "score": 1,
                "reason": "The message includes contact details, so confirm they match an official source before replying.",
            }
        )

    if re.search(r"https?://|www\.", lowered):
        indicators.append(
            {
                "label": "contains link",
                "score": 2,
                "reason": "Any message with a link should be verified carefully before you click.",
            }
        )

    if not indicators:
        indicators.append(
            {
                "label": "low-risk structure",
                "score": -2,
                "reason": "The message does not show common scam patterns such as pressure, credential requests, or payment demands.",
            }
        )

    if any(word in lowered for word in ["hello", "reminder", "schedule", "meeting", "library", "thanks"]) and not any(
        item["score"] >= 3 for item in indicators
    ):
        indicators.append(
            {
                "label": "normal tone",
                "score": -1,
                "reason": "The tone is calm and informational rather than pressuring or manipulative.",
            }
        )

    return indicators


def analyze_url(content: str) -> list[dict[str, Any]]:
    indicators: list[dict[str, Any]] = []
    candidate = content.strip()
    normalized = candidate if re.match(r"^https?://", candidate, re.IGNORECASE) else f"https://{candidate}"
    parsed = urlparse(normalized)
    host = (parsed.netloc or parsed.path).lower().strip("/")
    path = parsed.path.lower()

    if not host or "." not in host:
        return [
            {
                "label": "invalid url",
                "score": 3,
                "reason": "This does not look like a complete or valid web address, so verify it before visiting.",
            }
        ]

    if any(host == domain or host.endswith(f".{domain}") for domain in TRUSTED_DOMAINS):
        indicators.append(
            {
                "label": "trusted-looking domain",
                "score": -3,
                "reason": "The domain matches a commonly trusted official site format.",
            }
        )

    if host in SHORTENER_DOMAINS:
        indicators.append(
            {
                "label": "shortened link",
                "score": 4,
                "reason": "Shortened links can hide where they really lead.",
            }
        )

    suspicious_words = ["verify", "secure", "update", "login", "account", "gift", "claim", "free", "bonus", "payroll"]
    matched_words = [word for word in suspicious_words if word in host or word in path]
    if matched_words:
        indicators.append(
            {
                "label": "account-action language",
                "score": 3,
                "reason": "The URL uses account or reward language that is often seen in phishing links.",
            }
        )

    if host.count("-") >= 2:
        indicators.append(
            {
                "label": "complex domain",
                "score": 2,
                "reason": "Multiple hyphens can be a sign that a domain is trying to imitate a familiar service.",
            }
        )

    domain_parts = host.split(".")
    if len(domain_parts) >= 3 and any(part in BRAND_KEYWORDS for part in domain_parts[:-2]):
        indicators.append(
            {
                "label": "brand mismatch",
                "score": 4,
                "reason": "The address includes a familiar brand name, but the full domain does not look like the official site.",
            }
        )

    if normalized.startswith("http://"):
        indicators.append(
            {
                "label": "no secure protocol",
                "score": 2,
                "reason": "The link uses http instead of https, so it deserves extra caution.",
            }
        )

    if not indicators:
        indicators.append(
            {
                "label": "no obvious url red flags",
                "score": -2,
                "reason": "This link does not show the most common phishing URL warning signs.",
            }
        )

    return indicators


def select_risk_label(score: int, indicator_labels: Counter[str]) -> str:
    if score >= 7 or indicator_labels["gift card request"] or indicator_labels["credential request"]:
        return "High Risk"
    if score >= 3:
        return "Suspicious"
    return "Safe"


def build_confidence_note(risk_label: str, score: int) -> str:
    if risk_label == "High Risk":
        return "I am fairly confident this looks risky based on multiple warning signs. Avoid interacting and verify through an official source."
    if risk_label == "Suspicious":
        return "I’m not fully sure; there are some warning signs here. Verify through an official website or trusted contact before taking action."
    if score <= -2:
        return "This appears low risk from the signals available, but it is still smart to verify anything unexpected through an official source."
    return "This does not show strong scam signals, but if the context feels unusual, double-check through a trusted channel."


def build_recommended_actions(risk_label: str, input_type: str) -> list[str]:
    if risk_label == "High Risk":
        actions = [
            "Do not click links or download attachments.",
            "Verify through an official website or phone number you find yourself.",
            "Contact the sender through a trusted separate channel before taking action.",
            "Report the message to your school, workplace, email provider, or platform.",
        ]
        if input_type == "text":
            actions.append("Delete or block the sender if the message is clearly a scam.")
        actions.append("Enable or review MFA if you already interacted with the message.")
        return actions

    if risk_label == "Suspicious":
        return [
            "Pause before clicking or replying.",
            "Verify the request through an official website or trusted contact method.",
            "Do not share passwords, codes, or payment details in response to the message.",
            "Report it if the message claims to be from your school, workplace, bank, or platform.",
        ]

    return [
        "No immediate high-risk signal was found.",
        "If the message or link was unexpected, confirm it through the official source for extra peace of mind.",
        "Keep using normal caution with links, attachments, and requests for personal information.",
    ]


def build_heuristic_result(input_type: str, analyzable_content: str) -> dict[str, Any]:
    indicators = extract_text_indicators(analyzable_content) if input_type == "text" else analyze_url(analyzable_content)
    score = sum(item["score"] for item in indicators)
    label_counts = Counter(item["label"] for item in indicators)
    risk_label = select_risk_label(score, label_counts)

    ranked_reasons = sorted(indicators, key=lambda item: item["score"], reverse=True)
    top_reasons = [item["reason"] for item in ranked_reasons[:3]]
    recommended_actions = build_recommended_actions(risk_label, input_type)
    confidence_note = build_confidence_note(risk_label, score)

    return {
        "risk_label": risk_label,
        "reasons": top_reasons,
        "recommended_actions": recommended_actions,
        "confidence_note": confidence_note,
        "analysis_mode": "heuristic",
        "analysis_engine": "Explainable heuristics",
        "model_used": None,
    }


def analyze_submission(input_type: str, content: str, privacy_mode: bool, analysis_mode: str = "auto") -> dict[str, Any]:
    redacted_input = redact_sensitive_content(content) if privacy_mode else content
    analyzable_content = redacted_input if privacy_mode else content

    result = None
    ai_capabilities = get_ai_capabilities()
    should_try_ai = analysis_mode in {"auto", "ai"} and ai_capabilities["ai_available"]

    if should_try_ai:
        try:
            ai_result = request_openai_analysis(input_type=input_type, analyzable_content=analyzable_content)
            result = {
                **ai_result,
                "analysis_mode": "ai",
                "analysis_engine": "OpenAI Responses API",
            }
        except RuntimeError:
            if analysis_mode == "ai":
                result = build_heuristic_result(input_type, analyzable_content)
                result["confidence_note"] = (
                    "Live AI analysis was unavailable, so this result used the local explainable safety rules instead. "
                    f"{result['confidence_note']}"
                )

    if result is None:
        result = build_heuristic_result(input_type, analyzable_content)
        if analysis_mode == "ai" and not ai_capabilities["ai_available"]:
            result["confidence_note"] = (
                "Live AI analysis is not configured on this backend, so this result used the local explainable safety rules instead. "
                f"{result['confidence_note']}"
            )

    timestamp = datetime.now(timezone.utc).isoformat()
    response = {
        "scan_id": str(uuid4()),
        "input_type": input_type,
        "redacted_input": redacted_input,
        "risk_label": result["risk_label"],
        "reasons": result["reasons"],
        "recommended_actions": result["recommended_actions"],
        "confidence_note": result["confidence_note"],
        "analysis_mode": result["analysis_mode"],
        "analysis_engine": result["analysis_engine"],
        "model_used": result["model_used"],
        "timestamp": timestamp,
    }

    add_scan(
        {
            "scan_id": response["scan_id"],
            "input_type": input_type,
            "redacted_input": redacted_input,
            "risk_label": response["risk_label"],
            "reasons": response["reasons"],
            "recommended_actions": response["recommended_actions"],
            "confidence_note": response["confidence_note"],
            "analysis_mode": response["analysis_mode"],
            "analysis_engine": response["analysis_engine"],
            "model_used": response["model_used"],
            "created_at": timestamp,
        }
    )

    return response
