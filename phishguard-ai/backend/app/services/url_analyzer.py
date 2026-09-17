import re
import ipaddress
from urllib.parse import urlparse

import tldextract

SUSPICIOUS_TLDS = {
    "xyz",
    "top",
    "click",
    "zip",
    "review",
    "country",
    "kim",
    "work",
    "party",
    "gq",
    "tk",
    "ml",
    "ga",
    "cf"
}

SUSPICIOUS_KEYWORDS = {
    "login",
    "signin",
    "verify",
    "verification",
    "account",
    "secure",
    "update",
    "confirm",
    "password",
    "credential",
    "wallet",
    "payment",
    "bank",
    "refund",
    "unlock",
    "suspend"
}

BRAND_NAMES = {
    "google",
    "microsoft",
    "apple",
    "amazon",
    "paypal",
    "facebook",
    "instagram",
    "netflix",
    "linkedin",
    "github",
    "sbi",
    "hdfc",
    "icici"
}


def normalize_url(url: str) -> str:
    url = url.strip()

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    return url


def is_ip_address(hostname: str) -> bool:
    if not hostname:
        return False

    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False


def extract_url_from_qr(qr_content: str) -> str:
    cleaned = (qr_content or "").strip()

    if not cleaned:
        raise ValueError("QR content is empty.")

    if cleaned.startswith(("http://", "https://")):
        return normalize_url(cleaned)

    match = re.search(r"https?://[^\s\"'<>]+", cleaned)
    if match:
        return normalize_url(match.group(0).rstrip(".,;:)]}"))

    if "." in cleaned and any(part.isalpha() for part in cleaned.split(".")):
        return normalize_url(cleaned)

    raise ValueError("No valid URL was found in the QR content.")


def analyze_qr_data(qr_content: str) -> dict:
    url = extract_url_from_qr(qr_content)
    analysis = analyze_url(url)
    analysis["source"] = "qr_scan"
    analysis["features"].insert(
        0,
        {
            "name": "QR Payload",
            "status": "info",
            "message": "A QR code was decoded and its embedded URL was analyzed."
        }
    )
    return analysis


def analyze_url(url: str) -> dict:
    normalized_url = normalize_url(url)

    parsed = urlparse(normalized_url)
    hostname = parsed.hostname or ""
    path = parsed.path or ""

    extracted = tldextract.extract(hostname)

    domain = extracted.domain.lower()
    suffix = extracted.suffix.lower()
    subdomain = extracted.subdomain.lower()

    full_url_lower = normalized_url.lower()

    features = []
    score = 0

    if parsed.scheme != "https":
        score += 10

        features.append({
            "name": "HTTPS",
            "status": "warning",
            "message": "The URL does not use HTTPS."
        })
    else:
        features.append({
            "name": "HTTPS",
            "status": "safe",
            "message": "HTTPS is enabled."
        })

    url_length = len(normalized_url)

    if url_length > 100:
        score += 10

        features.append({
            "name": "URL Length",
            "status": "warning",
            "message": f"URL is unusually long ({url_length} characters)."
        })
    else:
        features.append({
            "name": "URL Length",
            "status": "safe",
            "message": f"URL length is {url_length} characters."
        })

    if is_ip_address(hostname):
        score += 25

        features.append({
            "name": "IP Address",
            "status": "danger",
            "message": "The website uses an IP address instead of a normal domain."
        })

    if suffix in SUSPICIOUS_TLDS:
        score += 15

        features.append({
            "name": "Domain Extension",
            "status": "warning",
            "message": f".{suffix} is treated as a higher-risk TLD by this MVP."
        })

    subdomain_count = len(
        [part for part in subdomain.split(".") if part]
    )

    if subdomain_count >= 3:
        score += 15

        features.append({
            "name": "Subdomains",
            "status": "warning",
            "message": f"URL contains {subdomain_count} subdomain levels."
        })

    special_character_count = len(
        re.findall(r"[@_%=\-]", normalized_url)
    )

    if special_character_count >= 8:
        score += 10

        features.append({
            "name": "Special Characters",
            "status": "warning",
            "message": "URL contains many potentially suspicious characters."
        })

    found_keywords = [
        keyword
        for keyword in SUSPICIOUS_KEYWORDS
        if keyword in full_url_lower
    ]

    if len(found_keywords) >= 2:
        score += 15

        features.append({
            "name": "Security Keywords",
            "status": "warning",
            "message": "Multiple security/account-related keywords detected."
        })
    elif len(found_keywords) == 1:
        score += 5

        features.append({
            "name": "Security Keyword",
            "status": "info",
            "message": f"Keyword detected: {found_keywords[0]}"
        })

    found_brands = []

    for brand in BRAND_NAMES:
        if brand in domain and domain != brand:
            found_brands.append(brand)

    suspicious_brand_patterns = {
        "paypa1": "paypal",
        "micros0ft": "microsoft",
        "g00gle": "google",
        "amaz0n": "amazon",
        "faceb00k": "facebook",
        "app1e": "apple"
    }

    for fake_name, real_brand in suspicious_brand_patterns.items():
        if fake_name in full_url_lower:
            found_brands.append(real_brand)

    if found_brands:
        score += 30

        features.append({
            "name": "Brand Impersonation",
            "status": "danger",
            "message": (
                "Possible brand impersonation detected: "
                + ", ".join(sorted(set(found_brands)))
            )
        })

    suspicious_path_words = [
        "login",
        "signin",
        "verify",
        "password",
        "credential",
        "payment",
        "wallet"
    ]

    found_path_words = [
        word for word in suspicious_path_words
        if word in path.lower()
    ]

    if found_path_words:
        score += 5

        features.append({
            "name": "Sensitive Path",
            "status": "warning",
            "message": "Sensitive authentication/payment path detected."
        })

    score = min(score, 100)

    if score >= 70:
        classification = "HIGH RISK"
    elif score >= 40:
        classification = "SUSPICIOUS"
    else:
        classification = "LOW RISK"

    return {
        "url": normalized_url,
        "domain": hostname,
        "risk_score": score,
        "classification": classification,
        "features": features,
        "technical": {
            "scheme": parsed.scheme,
            "hostname": hostname,
            "domain": domain,
            "suffix": suffix,
            "subdomain": subdomain,
            "url_length": url_length,
            "subdomain_count": subdomain_count,
            "found_keywords": found_keywords
        }
    }
