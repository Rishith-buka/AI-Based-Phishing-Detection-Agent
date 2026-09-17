import { useRef, useState } from "react";
import jsQR from "jsqr";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/analyze-url";
const QR_API_URL = import.meta.env.VITE_QR_API_URL || "http://127.0.0.1:8000/api/analyze-qr";

function AnalyzeForm({ onResult }) {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [qrText, setQrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  async function postAnalysis(payload, endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to analyze request.");
    }

    onResult(data);
  }

  async function analyzeURL(event) {
    event.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await postAnalysis({ url: trimmedUrl }, API_URL);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeQR(event) {
    event.preventDefault();

    const trimmedQr = qrText.trim();

    if (!trimmedQr) {
      setError("Please enter QR content or upload a QR image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await postAnalysis({ qr_data: trimmedQr }, QR_API_URL);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function useDemoURL() {
    setUrl("https://secure-paypa1-login.xyz/verify");
    setQrText("https://secure-paypa1-login.xyz/verify");
    setMode("url");
  }

  async function handleQrUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a QR image file.");
      return;
    }

    try {
      const imageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read image file."));
        reader.readAsDataURL(file);
      });

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (!code) {
          setError("No QR code detected in the uploaded image.");
          return;
        }

        setQrText(code.data);
        setUrl(code.data);
        setMode("qr");
        setError("");
      };

      image.src = imageUrl;
    } catch (fileError) {
      setError(fileError.message);
    } finally {
      event.target.value = "";
    }
  }

  return (
    <section className="analyzer-card">
      <div className="input-header">
        <div>
          <h3>{mode === "url" ? "Analyze a URL" : "Scan QR phishing link"}</h3>
          <p>
            {mode === "url"
              ? "Enter a website URL to perform phishing analysis."
              : "Paste or upload a QR code that contains a URL."}
          </p>
        </div>

        <div className="mode-actions">
          <button type="button" className={`mode-button ${mode === "url" ? "active" : ""}`} onClick={() => setMode("url")}>
            URL
          </button>
          <button type="button" className={`mode-button ${mode === "qr" ? "active" : ""}`} onClick={() => setMode("qr")}>
            QR
          </button>
          <button type="button" className="demo-button" onClick={useDemoURL}>
            Try Demo
          </button>
        </div>
      </div>

      <form onSubmit={mode === "url" ? analyzeURL : analyzeQR}>
        <div className="input-wrapper">
          <span>{mode === "url" ? "🔗" : "📷"}</span>
          <input
            type="text"
            placeholder={mode === "url" ? "https://example.com" : "Paste QR content or scanned link"}
            value={mode === "url" ? url : qrText}
            onChange={(event) => {
              if (mode === "url") {
                setUrl(event.target.value);
              } else {
                setQrText(event.target.value);
              }
            }}
          />
        </div>

        {mode === "qr" && (
          <button type="button" className="upload-button" onClick={() => fileInputRef.current?.click()}>
            Upload QR
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleQrUpload}
        />

        <button className="analyze-button" type="submit" disabled={loading}>
          {loading ? "Analyzing..." : mode === "url" ? "Analyze URL →" : "Scan QR →"}
        </button>
      </form>

      {error && <div className="error">⚠️ {error}</div>}
    </section>
  );
}

export default AnalyzeForm;
