function RiskCard({ result }) {
  const score = result.risk_score;

  let riskClass = "low";

  if (score >= 70) {
    riskClass = "high";
  } else if (score >= 40) {
    riskClass = "medium";
  }

  return (
    <div className={`risk-card ${riskClass}`}>
      <div className="risk-header">
        <div>
          <span className="small-label">SECURITY ASSESSMENT</span>
          <h2>{result.classification}</h2>
        </div>

        <div className="score">
          <strong>{score}</strong>
          <span>/100</span>
        </div>
      </div>

      <div className="risk-bar">
        <div className="risk-fill" style={{ width: `${score}%` }}></div>
      </div>

      <div className="risk-details">
        <div>
          <span>Risk Level</span>
          <strong>{result.risk_level}</strong>
        </div>

        <div>
          <span>Recommended Action</span>
          <strong>{result.recommended_action}</strong>
        </div>

        <div>
          <span>Analyzed Domain</span>
          <strong>{result.domain}</strong>
        </div>
      </div>
    </div>
  );
}

export default RiskCard;
