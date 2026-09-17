from pydantic import BaseModel, Field


class URLRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)


class QRRequest(BaseModel):
    qr_data: str = Field(..., min_length=3, max_length=4096)


class URLResponse(BaseModel):
    url: str
    domain: str
    risk_score: int
    classification: str
    features: list
    technical: dict
    risk_level: str
    recommended_action: str
