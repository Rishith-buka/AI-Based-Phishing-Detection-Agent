from app.services.url_analyzer import analyze_qr_data


def test_phishing_qr_url_scores_as_high_risk():
    result = analyze_qr_data("https://secure-paypa1-login.xyz/verify")

    assert result["risk_score"] >= 40
    assert result["classification"] in {"SUSPICIOUS", "HIGH RISK"}


def test_safe_qr_url_scores_as_low_risk():
    result = analyze_qr_data("https://example.com")

    assert result["risk_score"] < 40
