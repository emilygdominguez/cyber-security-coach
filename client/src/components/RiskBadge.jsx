function RiskBadge({ label }) {
  const className =
    label === "High Risk"
      ? "risk-badge high-risk"
      : label === "Suspicious"
        ? "risk-badge suspicious"
        : "risk-badge safe";

  return <span className={className}>{label}</span>;
}

export default RiskBadge;
