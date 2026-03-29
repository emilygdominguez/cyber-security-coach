import RiskBadge from "./RiskBadge";

const tips = {
  Safe: "Unexpected messages can still be verified through the official website if you want extra peace of mind.",
  Suspicious: "Urgency is a common scam tactic. Real organizations usually give you time to verify.",
  "High Risk": "Requests for passwords, gift cards, or rushed payments are common scam patterns. Pause and verify separately.",
};

function ResultsPanel({ result }) {
  if (!result) {
    return (
      <section className="card empty-state">
        <p className="eyebrow">Results</p>
        <h2>Run a scan to get a calm, plain-language safety check.</h2>
        <p>
          You will see a risk label, top reasons, safe next steps, and a short learning tip here.
        </p>
      </section>
    );
  }

  return (
    <section className="results-layout">
      <article className="card results-hero">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Assessment</p>
            <h2>Your safety readout</h2>
            <p className="engine-inline">
              {result.analysis_mode === "ai"
                ? `AI-assisted analysis${result.model_used ? ` via ${result.model_used}` : ""}`
                : "Explainable rules fallback"}
            </p>
          </div>
          <RiskBadge label={result.risk_label} />
        </div>

        <p className="confidence-note">{result.confidence_note}</p>

        <div className="results-grid">
          <div className="result-block">
            <h3>Top reasons</h3>
            <ul className="clean-list">
              {result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="result-block">
            <h3>Recommended next steps</h3>
            <ul className="check-list">
              {result.recommended_actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <article className="card preview-card">
        <p className="eyebrow">Privacy-aware preview</p>
        <h3>Stored version of the scan</h3>
        <p className="preview-text">{result.redacted_input}</p>
      </article>

      <aside className="card learn-card">
        <p className="eyebrow">Teach-back tip</p>
        <h3>One thing to remember</h3>
        <p>{tips[result.risk_label] || tips.Safe}</p>
      </aside>
    </section>
  );
}

export default ResultsPanel;
