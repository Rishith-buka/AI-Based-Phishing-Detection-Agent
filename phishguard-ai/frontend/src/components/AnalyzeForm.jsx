import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/analyze-url";

function AnalyzeForm({ onResult }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeURL(event) {
    event.preventDefault();

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: url.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to analyze URL.");
      }

      onResult(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function useDemoURL() {
    setUrl("https://secure-paypa1-login.xyz/verify");
  }

  return (
    <section className="analyzer-card">
      <div className="input-header">
        <div>
          <h3>Analyze a URL</h3>
          <p>Enter a website URL to perform phishing analysis.</p>
        </div>

        <button type="button" className="demo-button" onClick={useDemoURL}>
          Try Demo
        </button>
      </div>

      <form onSubmit={analyzeURL}>
        <div className="input-wrapper">
          <span>🔗</span>
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>

        <button className="analyze-button" type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze URL →"}
        </button>
      </form>

      {error && <div className="error">⚠️ {error}</div>}
    </section>
  );
}

export default AnalyzeForm;
