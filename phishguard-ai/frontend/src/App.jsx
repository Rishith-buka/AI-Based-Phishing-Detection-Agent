import { useState } from "react";
import AnalyzeForm from "./components/AnalyzeForm";
import RiskCard from "./components/RiskCard";
import FeatureList from "./components/FeatureList";
import "./index.css";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">🛡️</div>

          <div>
            <h1>PhishGuard AI</h1>
            <p>Next-Generation Phishing Detection</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <span className="badge">AI SECURITY PLATFORM</span>

          <h2>
            Detect suspicious websites
            <br />
            before they compromise you.
          </h2>

          <p>
            Analyze URLs using multiple phishing indicators and receive an
            explainable security assessment.
          </p>
        </section>

        <AnalyzeForm onResult={setResult} />

        {result && (
          <section className="results">
            <RiskCard result={result} />

            <FeatureList features={result.features} />

            <div className="technical-card">
              <h3>Technical Analysis</h3>

              <div className="technical-grid">
                <div>
                  <span>Hostname</span>
                  <strong>{result.technical.hostname}</strong>
                </div>

                <div>
                  <span>Protocol</span>
                  <strong>{result.technical.scheme}</strong>
                </div>

                <div>
                  <span>Domain</span>
                  <strong>{result.technical.domain}</strong>
                </div>

                <div>
                  <span>TLD</span>
                  <strong>.{result.technical.suffix || "unknown"}</strong>
                </div>

                <div>
                  <span>URL Length</span>
                  <strong>{result.technical.url_length}</strong>
                </div>

                <div>
                  <span>Subdomains</span>
                  <strong>{result.technical.subdomain_count}</strong>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        <p>PhishGuard AI • Cybersecurity Research Prototype</p>
      </footer>
    </div>
  );
}

export default App;
