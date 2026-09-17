from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import QRRequest, URLRequest, URLResponse
from .services.url_analyzer import analyze_qr_data, analyze_url
from .services.risk_engine import calculate_risk

app = FastAPI(
    title="PhishGuard AI",
    description="AI-powered phishing detection MVP",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "PhishGuard AI API is running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/analyze-url", response_model=URLResponse)
def analyze_url_endpoint(request: URLRequest):
    try:
        result = analyze_url(request.url)

        risk = calculate_risk(result)

        result.update(risk)

        return result

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to analyze URL: {str(error)}"
        )


@app.post("/api/analyze-qr", response_model=URLResponse)
def analyze_qr_endpoint(request: QRRequest):
    try:
        result = analyze_qr_data(request.qr_data)

        risk = calculate_risk(result)

        result.update(risk)

        return result

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to analyze QR payload: {str(error)}"
        )
