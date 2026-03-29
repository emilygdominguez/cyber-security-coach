import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import ResultsPanel from "../components/ResultsPanel";
import SampleCases, { sampleCases } from "../components/SampleCases";
import { analyzeContent, fetchConfig } from "../services/api";

const placeholderByType = {
  text: "Paste an email, text message, or DM here...",
  url: "Paste a full URL here...",
};

function AnalyzePage() {
  const location = useLocation();
  const [inputType, setInputType] = useState("text");
  const [content, setContent] = useState(sampleCases[0].content);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [analysisMode, setAnalysisMode] = useState("auto");
  const [config, setConfig] = useState({
    ai_available: false,
    default_analysis_mode: "auto",
    openai_model: null,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (inputType === "url" && content === sampleCases[0].content) {
      setContent(sampleCases[3].content);
    }
  }, [inputType, content]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetchConfig();
        setConfig(response);
        setAnalysisMode(response.default_analysis_mode || "auto");
      } catch (_error) {
        setConfig({
          ai_available: false,
          default_analysis_mode: "auto",
          openai_model: null,
        });
      }
    }

    loadConfig();
  }, []);

  useEffect(() => {
    const sample = location.state?.sample;
    if (!sample) {
      return;
    }

    setInputType(sample.inputType);
    setContent(sample.content);
    setPrivacyMode(sample.privacyMode);
  }, [location.state]);

  async function handleAnalyze(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        input_type: inputType,
        content,
        privacy_mode: privacyMode,
        analysis_mode: analysisMode,
      };
      const response = await analyzeContent(payload);
      setResult(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleUseSample(sample) {
    setInputType(sample.inputType);
    setContent(sample.content);
    setPrivacyMode(sample.privacyMode);
    setError("");
  }

  return (
    <div className="page-content">
      <section className="analysis-layout">
        <form className="card analysis-form" onSubmit={handleAnalyze}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Analyze</p>
              <h2>Check a message or link</h2>
            </div>
            <p className="supporting-copy">
              This coach uses explainable rules, not hidden scoring. If something feels off, trust
              that instinct and verify separately.
            </p>
          </div>

          <div className="mode-toggle" role="tablist" aria-label="Input type">
            <button
              type="button"
              className={inputType === "text" ? "toggle-chip active" : "toggle-chip"}
              onClick={() => setInputType("text")}
            >
              Paste Email / Text
            </button>
            <button
              type="button"
              className={inputType === "url" ? "toggle-chip active" : "toggle-chip"}
              onClick={() => setInputType("url")}
            >
              Paste URL
            </button>
          </div>

          <label className="input-label" htmlFor="content">
            {inputType === "url" ? "URL to review" : "Message to review"}
          </label>
          <textarea
            id="content"
            className="content-input"
            rows={inputType === "url" ? 5 : 10}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={placeholderByType[inputType]}
          />

          <label className="privacy-toggle">
            <input
              type="checkbox"
              checked={privacyMode}
              onChange={(event) => setPrivacyMode(event.target.checked)}
            />
            <span>
              Privacy mode: redact emails, phone numbers, and names before analysis and local
              history storage.
            </span>
          </label>

          <div className="engine-panel">
            <div>
              <p className="eyebrow">Analysis engine</p>
              <h3>{config.ai_available ? "AI-enhanced coach available" : "Explainable local fallback only"}</h3>
              <p className="engine-copy">
                {config.ai_available
                  ? `Auto mode will use OpenAI (${config.openai_model}) and fall back to local rules if the API is unavailable.`
                  : "Add OPENAI_API_KEY on the backend to enable live AI analysis. Until then, the explainable rules engine stays active."}
              </p>
            </div>

            <div className="mode-toggle" role="tablist" aria-label="Analysis mode">
              <button
                type="button"
                className={analysisMode === "auto" ? "toggle-chip active" : "toggle-chip"}
                onClick={() => setAnalysisMode("auto")}
              >
                Auto
              </button>
              <button
                type="button"
                className={analysisMode === "heuristic" ? "toggle-chip active" : "toggle-chip"}
                onClick={() => setAnalysisMode("heuristic")}
              >
                Rules only
              </button>
            </div>
          </div>

          {error ? <p className="error-banner">{error}</p> : null}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={loading || !content.trim()}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
            <p className="help-copy">
              The tool is designed to explain risk, not to help create phishing or scam content.
            </p>
          </div>
        </form>

        <ResultsPanel result={result} />
      </section>

      <SampleCases onUseSample={handleUseSample} />
    </div>
  );
}

export default AnalyzePage;
