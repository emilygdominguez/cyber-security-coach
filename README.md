# AI Cyber Safety Coach

AI Cyber Safety Coach is a hackathon-ready MVP web app that helps everyday users decide whether a message or link looks `Safe`, `Suspicious`, or `High Risk` without needing cybersecurity expertise. It now supports an optional OpenAI-backed analysis path with a safe explainable fallback, plus privacy-aware redaction by default.

## What it does

- Analyze pasted email, text, or social messages
- Analyze pasted URLs
- Use live AI analysis when `OPENAI_API_KEY` is configured
- Fall back to explainable local rules when AI is unavailable
- Redact emails, phone numbers, and names when privacy mode is on
- Explain the top three reasons behind a risk label
- Recommend safe next steps in non-technical language
- Show recent redacted scans and a simple dashboard chart
- Avoid storing raw personal data by default

## Tech stack

- Frontend: React + Vite
- Backend: Python + Flask
- AI option: OpenAI Responses API
- Storage: lightweight in-memory backend history

## Project structure

```text
client/
  src/
    components/
    pages/
    services/
server/
  app.py
  routes/
  utils/
README.md
```

## Exact run commands

Open two terminals from the project root.

### 1. Run the Flask backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
cp server/.env.example server/.env  # optional template for AI mode
export OPENAI_API_KEY=your_openai_api_key_here  # optional
python3 -m server.app
```

The backend runs on `http://127.0.0.1:5000`.

### 2. Run the React frontend

```bash
cd client
cp .env.example .env  # optional
npm install
npm run dev
```

The frontend runs on `http://127.0.0.1:5173`.

If the Analyze page says `Unable to reach the safety coach API`, the backend is not running yet or is running on a different port. Start Flask first with `python3 -m server.app`.

## API endpoints

### `POST /api/analyze`

Request body:

```json
{
  "input_type": "text",
  "content": "Paste content here",
  "privacy_mode": true,
  "analysis_mode": "auto"
}
```

Response shape:

```json
{
  "scan_id": "uuid",
  "input_type": "text",
  "redacted_input": "Redacted preview",
  "risk_label": "Suspicious",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "recommended_actions": ["action 1", "action 2"],
  "confidence_note": "I’m not fully sure; verify through an official source.",
  "analysis_mode": "ai",
  "analysis_engine": "OpenAI Responses API",
  "model_used": "gpt-4.1-mini",
  "timestamp": "2026-03-29T12:00:00+00:00"
}
```

### `GET /api/history`

Returns recent redacted scans kept in memory.

### `GET /api/stats`

Returns totals for `Safe`, `Suspicious`, and `High Risk`.

### `GET /api/config`

Returns whether AI analysis is configured and which model will be used.

## Analysis modes

- `auto`: use OpenAI when `OPENAI_API_KEY` is configured, otherwise use local rules
- `heuristic`: force the explainable local rules engine
- `ai`: backend-only option exposed by the API for callers that want to request AI first

The local scoring logic lives in [server/utils/analysis.py](/Users/emilydominguez/Documents/CodexProjects/ai-cyber-safety-coach/New%20project/server/utils/analysis.py).

The OpenAI integration lives in [server/utils/openai_analysis.py](/Users/emilydominguez/Documents/CodexProjects/ai-cyber-safety-coach/New%20project/server/utils/openai_analysis.py).

Key signals include:

- High-risk indicators: credential asks, payment requests, gift card requests, threats, impersonation cues, shortened links, misleading domains
- Suspicious indicators: mild urgency, vague asks, unclear branding, link pressure
- Safer indicators: calm informational tone, no pressure, no credential or payment ask, trusted-looking domains

The scoring logic includes inline comments where the rules are defined so it is easy to demo and explain.

## Clickable sample test cases in the UI

The Analyze page includes these five built-in sample cases:

1. Safe school announcement
2. Suspicious bank-style email asking to verify account
3. High-risk gift card scam message
4. Safe URL from a trusted domain
5. Suspicious shortened URL

They are defined in [client/src/components/SampleCases.jsx](/Users/emilydominguez/Documents/CodexProjects/ai-cyber-safety-coach/New%20project/client/src/components/SampleCases.jsx).

## Demo notes

- Privacy mode is on by default
- Only redacted input is stored in backend history
- The history page starts with seeded synthetic examples so the dashboard looks populated during a demo
- Uncertain cases use careful language such as: `I’m not fully sure; verify through an official source`
- The app is intentionally supportive and does not provide instructions for creating scams or phishing content

## Notes

- The app never requires a live model to function; if AI is unavailable, it falls back to the explainable local engine.
- With privacy mode on, redacted content is what gets analyzed and stored.
- Frontend build verification requires Node.js and npm on the host machine.
