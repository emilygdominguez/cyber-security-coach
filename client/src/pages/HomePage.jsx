import { Link, useNavigate } from "react-router-dom";

import SampleCases from "../components/SampleCases";

function HomePage() {
  const navigate = useNavigate();

  function handleUseSample(sample) {
    navigate("/analyze", {
      state: {
        sample,
      },
    });
  }

  return (
    <div className="page-content">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Confidence without jargon</p>
          <h2>AI Cyber Safety Coach helps everyday people pause, check, and decide safely.</h2>
          <p>
            Paste a message or URL to get a plain-language readout: Safe, Suspicious, or High
            Risk, plus the reasons behind that label and calm next steps. When an OpenAI API key is
            configured, the coach can add a live AI opinion and still fall back to explainable local
            rules if needed.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/analyze">
              Start an analysis
            </Link>
            <Link className="secondary-button" to="/history">
              View recent scans
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="mini-panel">
            <div className="mini-panel-header">
              <span className="mini-label">What it does</span>
              <strong>Explains risk in plain language</strong>
            </div>
            <p>No cybersecurity background needed.</p>
          </div>
          <div className="mini-panel">
            <div className="mini-panel-header">
              <span className="mini-label">AI-backed option</span>
              <strong>Live model when available, stable fallback when not</strong>
            </div>
            <p>The demo stays usable even if the API key is missing or the network call fails.</p>
          </div>
          <div className="mini-panel">
            <div className="mini-panel-header">
              <span className="mini-label">Privacy mode</span>
              <strong>Redacts emails, phone numbers, and names</strong>
            </div>
            <p>Only the redacted version is stored in local demo history.</p>
          </div>
          <div className="mini-panel">
            <div className="mini-panel-header">
              <span className="mini-label">Safety posture</span>
              <strong>Supportive, not scary</strong>
            </div>
            <p>Uncertain cases get careful advice instead of alarmist language.</p>
          </div>
        </div>
      </section>

      <section className="card info-grid">
        <div>
          <p className="eyebrow">How it works</p>
          <h2>Four-step MVP flow</h2>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <span>1</span>
            <h3>Choose input mode</h3>
            <p>Switch between Email / Text and URL analysis based on what you received.</p>
          </article>
          <article className="step-card">
            <span>2</span>
            <h3>Protect privacy</h3>
            <p>Keep privacy mode on to redact personal details before analysis and storage.</p>
          </article>
          <article className="step-card">
            <span>3</span>
            <h3>See the reasons</h3>
            <p>Review the top signals behind the label instead of trusting a black box.</p>
          </article>
          <article className="step-card">
            <span>4</span>
            <h3>Take the safe next step</h3>
            <p>Use the checklist to verify safely without clicking or replying too soon.</p>
          </article>
        </div>
      </section>

      <SampleCases onUseSample={handleUseSample} />
    </div>
  );
}

export default HomePage;
