function FeatureList({ features }) {
  return (
    <div className="features-card">
      <div className="section-heading">
        <h3>Why was this URL flagged?</h3>
        <p>Detected indicators contributing to the security assessment.</p>
      </div>

      <div className="feature-list">
        {features.map((feature, index) => (
          <div className={`feature ${feature.status}`} key={index}>
            <div className="feature-icon">
              {feature.status === "danger" && "⚠️"}
              {feature.status === "warning" && "!"}
              {feature.status === "safe" && "✓"}
              {feature.status === "info" && "i"}
            </div>

            <div>
              <strong>{feature.name}</strong>
              <p>{feature.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureList;
