function StatsChart({ counts, total }) {
  const entries = [
    { label: "Safe", value: counts.Safe || 0, className: "bar-safe" },
    { label: "Suspicious", value: counts.Suspicious || 0, className: "bar-suspicious" },
    { label: "High Risk", value: counts["High Risk"] || 0, className: "bar-high-risk" },
  ];
  const maxValue = Math.max(...entries.map((entry) => entry.value), 1);

  return (
    <section className="card chart-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Summary dashboard</p>
          <h2>Recent scan mix</h2>
        </div>
        <p className="supporting-copy">{total} total scans in local demo memory</p>
      </div>

      <div className="chart-stack" aria-label="Bar chart showing scan counts by risk label">
        {entries.map((entry) => (
          <div key={entry.label} className="chart-row">
            <div className="chart-meta">
              <span>{entry.label}</span>
              <strong>{entry.value}</strong>
            </div>
            <div className="chart-track">
              <div
                className={`chart-bar ${entry.className}`}
                style={{ width: `${(entry.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsChart;
