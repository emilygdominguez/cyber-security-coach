from __future__ import annotations

import json
import os
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
DEFAULT_TIMEOUT = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "20"))
RESPONSES_API_URL = "https://api.openai.com/v1/responses"

CYBER_SAFETY_RESPONSE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["risk_label", "reasons", "recommended_actions", "confidence_note"],
    "properties": {
        "risk_label": {
            "type": "string",
            "enum": ["Safe", "Suspicious", "High Risk"],
        },
        "reasons": {
            "type": "array",
            "minItems": 3,
            "maxItems": 4,
            "items": {"type": "string"},
        },
        "recommended_actions": {
            "type": "array",
            "minItems": 3,
            "maxItems": 5,
            "items": {"type": "string"},
        },
        "confidence_note": {
            "type": "string",
        },
    },
}


def is_openai_configured() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def get_openai_model() -> str:
    return os.getenv("OPENAI_MODEL", DEFAULT_MODEL)


def get_ai_capabilities() -> dict[str, Any]:
    return {
        "ai_available": is_openai_configured(),
        "default_analysis_mode": "auto",
        "openai_model": get_openai_model() if is_openai_configured() else None,
    }


def _build_prompt(input_type: str, analyzable_content: str) -> str:
    return (
        "You are an AI cyber safety coach for everyday users. "
        "Assess whether the provided message or URL looks Safe, Suspicious, or High Risk. "
        "Use calm, plain language. Do not provide attack instructions, evasion advice, or phishing tips. "
        "Focus on defensive risk assessment and safe next steps only.\n\n"
        f"Input type: {input_type}\n"
        "Analyze this content:\n"
        f"{analyzable_content}"
    )


def _extract_output_text(payload: dict[str, Any]) -> str:
    if isinstance(payload.get("output_text"), str) and payload["output_text"].strip():
        return payload["output_text"]

    fragments: list[str] = []
    for item in payload.get("output", []):
        for content in item.get("content", []):
            text_value = content.get("text") or content.get("value")
            if isinstance(text_value, str) and text_value.strip():
                fragments.append(text_value)

    return "\n".join(fragments).strip()


def request_openai_analysis(input_type: str, analyzable_content: str) -> dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    body = {
        "model": get_openai_model(),
        "input": _build_prompt(input_type, analyzable_content),
        "text": {
            "format": {
                "type": "json_schema",
                "name": "cyber_safety_assessment",
                "strict": True,
                "schema": CYBER_SAFETY_RESPONSE_SCHEMA,
            }
        },
    }

    request = Request(
        RESPONSES_API_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=DEFAULT_TIMEOUT) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        details = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"OpenAI request failed ({error.code}): {details or error.reason}") from error
    except URLError as error:
        raise RuntimeError(f"Unable to reach OpenAI: {error.reason}") from error

    output_text = _extract_output_text(response_payload)
    if not output_text:
        raise RuntimeError("OpenAI returned an empty response.")

    try:
        parsed_output = json.loads(output_text)
    except json.JSONDecodeError as error:
        raise RuntimeError("OpenAI returned a response that was not valid JSON.") from error

    return {
        "risk_label": parsed_output["risk_label"],
        "reasons": parsed_output["reasons"],
        "recommended_actions": parsed_output["recommended_actions"],
        "confidence_note": parsed_output["confidence_note"],
        "model_used": get_openai_model(),
    }
