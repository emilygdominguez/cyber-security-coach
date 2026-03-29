from flask import Blueprint, jsonify, request

from server.utils.analysis import analyze_submission
from server.utils.openai_analysis import get_ai_capabilities
from server.utils.store import get_history, get_stats, seed_sample_history

api_bp = Blueprint("api", __name__)
seed_sample_history()


@api_bp.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    input_type = payload.get("input_type", "").strip()
    content = payload.get("content", "").strip()
    privacy_mode = bool(payload.get("privacy_mode", True))
    analysis_mode = payload.get("analysis_mode", "auto").strip()

    if input_type not in {"text", "url"}:
        return jsonify({"error": "input_type must be 'text' or 'url'"}), 400

    if analysis_mode not in {"auto", "ai", "heuristic"}:
        return jsonify({"error": "analysis_mode must be 'auto', 'ai', or 'heuristic'"}), 400

    if not content:
        return jsonify({"error": "content is required"}), 400

    result = analyze_submission(
        input_type=input_type,
        content=content,
        privacy_mode=privacy_mode,
        analysis_mode=analysis_mode,
    )
    return jsonify(result)


@api_bp.get("/history")
def history():
    return jsonify({"items": get_history()})


@api_bp.get("/stats")
def stats():
    return jsonify(get_stats())


@api_bp.get("/config")
def config():
    return jsonify(get_ai_capabilities())
