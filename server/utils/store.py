from __future__ import annotations

from collections import Counter
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4


_SCAN_HISTORY: list[dict[str, Any]] = []


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def add_scan(record: dict[str, Any]) -> dict[str, Any]:
    entry = {
        "scan_id": record.get("scan_id") or str(uuid4()),
        "input_type": record["input_type"],
        "redacted_input": record["redacted_input"],
        "risk_label": record["risk_label"],
        "reasons": record["reasons"],
        "recommended_actions": record["recommended_actions"],
        "confidence_note": record["confidence_note"],
        "analysis_mode": record.get("analysis_mode", "heuristic"),
        "analysis_engine": record.get("analysis_engine", "Explainable heuristics"),
        "model_used": record.get("model_used"),
        "created_at": record.get("created_at") or _utc_now_iso(),
    }
    _SCAN_HISTORY.insert(0, entry)
    del _SCAN_HISTORY[20:]
    return deepcopy(entry)


def get_history() -> list[dict[str, Any]]:
    return deepcopy(_SCAN_HISTORY)


def get_stats() -> dict[str, Any]:
    counts = Counter(item["risk_label"] for item in _SCAN_HISTORY)
    return {
        "counts": {
            "Safe": counts.get("Safe", 0),
            "Suspicious": counts.get("Suspicious", 0),
            "High Risk": counts.get("High Risk", 0),
        },
        "total_scans": len(_SCAN_HISTORY),
    }


def seed_sample_history() -> None:
    if _SCAN_HISTORY:
        return

    base_time = datetime.now(timezone.utc)
    samples = [
        {
            "input_type": "text",
            "redacted_input": "Reminder: The school library closes at 4:30 PM today. Please return any borrowed calculators by Friday.",
            "risk_label": "Safe",
            "reasons": [
                "The message shares routine information without asking for passwords or payment.",
                "There is no pressure to click a link, send money, or respond urgently.",
                "The wording is specific and consistent with a normal school update.",
            ],
            "recommended_actions": [
                "No immediate safety concern detected.",
                "If you were not expecting this message, you can still confirm with the school website.",
                "Keep using your normal caution before clicking any future links.",
            ],
            "confidence_note": "This looks low risk based on the message structure and lack of scam signals.",
            "analysis_mode": "heuristic",
            "analysis_engine": "Explainable heuristics",
        },
        {
            "input_type": "url",
            "redacted_input": "http://payroll-verify-login-secure.co/update",
            "risk_label": "High Risk",
            "reasons": [
                "The domain uses misleading words that imitate an account or payroll portal.",
                "The URL is not a trusted official domain and could be trying to collect sign-in details.",
                "The language pattern suggests impersonation of a service rather than a direct brand-owned site.",
            ],
            "recommended_actions": [
                "Do not open the link.",
                "Go to the official website by typing it yourself into your browser.",
                "Report the message to your workplace, school, or platform if it came through a message.",
            ],
            "confidence_note": "I am fairly confident this link is risky, but verify through the official site if you need to check the account.",
            "analysis_mode": "heuristic",
            "analysis_engine": "Explainable heuristics",
        },
        {
            "input_type": "text",
            "redacted_input": "Can you grab two gift cards for the event prizes today? Please text me the codes right away so I can reimburse you later.",
            "risk_label": "High Risk",
            "reasons": [
                "Gift card requests are a very common scam pattern.",
                "The sender is pushing for quick action before you can verify the request.",
                "Asking for codes by message is unsafe because the codes can be used immediately.",
            ],
            "recommended_actions": [
                "Do not buy or send gift card codes.",
                "Contact the person through a trusted separate channel before taking action.",
                "Block or report the sender if you cannot verify the request.",
            ],
            "confidence_note": "This strongly matches a common scam tactic, so treat it as high risk.",
            "analysis_mode": "heuristic",
            "analysis_engine": "Explainable heuristics",
        },
    ]

    for index, sample in enumerate(samples):
        stamped = {
            **sample,
            "created_at": (base_time - timedelta(hours=index + 1)).isoformat(),
        }
        add_scan(stamped)
