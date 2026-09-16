def calculate_risk(url_analysis: dict) -> dict:
    score = url_analysis["risk_score"]

    if score >= 70:
        level = "HIGH"
        action = "BLOCK / WARN USER"

    elif score >= 40:
        level = "MEDIUM"
        action = "WARN USER"

    else:
        level = "LOW"
        action = "ALLOW WITH CAUTION"

    return {
        "risk_score": score,
        "risk_level": level,
        "recommended_action": action
    }
