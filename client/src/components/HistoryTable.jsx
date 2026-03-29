import RiskBadge from "./RiskBadge";

function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function HistoryTable({ items }) {
  if (!items.length) {
    return (
      <section className="card empty-state">
        <p className="eyebrow">History</p>
        <h2>No scans yet</h2>
        <p>Recent privacy-aware scans will appear here after you analyze a message or link.</p>
      </section>
    );
  }

  return (
    <section className="card history-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recent scans</p>
          <h2>Review redacted scan history</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Type</th>
              <th>Engine</th>
              <th>Preview</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.scan_id}>
                <td className="history-when">{formatTimestamp(item.created_at)}</td>
                <td className="history-type">{item.input_type === "url" ? "URL" : "Email / Text"}</td>
                <td className="history-engine">{item.analysis_mode === "ai" ? "AI" : "Rules"}</td>
                <td className="preview-cell">{item.redacted_input}</td>
                <td className="history-risk">
                  <RiskBadge label={item.risk_label} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default HistoryTable;
