"""
extractor.py — pulls structured entities out of a raw incident description:
people/roles mentioned, monetary amounts, digital platforms, and threat
phrases. This is what turns "my husband hit me, took my card and threatened
to share our private video" into something the readiness engine and pack
generators can reason about without re-reading free text every time.

Everything here is regex/keyword based on purpose -- fast, deterministic,
explainable, and doesn't require a model or network call. It's meant to be
a drop-in first pass; a real NLP/NER model can replace `extract_entities`
later without changing its output shape.
"""
from __future__ import annotations

import re

# Common relationship/role words survivors use to refer to the person
# involved. Ordered roughly by specificity so more specific matches win.
ROLE_KEYWORDS = [
    "husband", "wife", "ex-husband", "ex-wife", "boyfriend", "girlfriend",
    "partner", "fiance", "fiancé", "fiancée",
    "father-in-law", "mother-in-law", "brother-in-law", "sister-in-law",
    "father", "mother", "brother", "sister", "son", "daughter",
    "employer", "boss", "landlord", "colleague", "stranger",
]

PLATFORM_KEYWORDS = [
    "whatsapp", "instagram", "facebook", "snapchat", "telegram", "twitter",
    "x.com", "sms", "text message", "email", "tiktok",
]

# Matches amounts like "Rs. 5000", "₹5,000", "5000 rupees", "$200"
AMOUNT_PATTERN = re.compile(
    r"(?:rs\.?|inr|₹|\$)\s?([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s?(?:rupees|rs\.?|inr)",
    re.IGNORECASE,
)

THREAT_PHRASES = [
    "threatened to", "will kill", "won't let me", "said he would",
    "said she would", "if i tell", "if you tell anyone",
]


def extract_roles(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for role in ROLE_KEYWORDS:
        if re.search(rf"\b{re.escape(role)}\b", text_lower):
            found.append(role)
    return found


def extract_platforms(text: str) -> list[str]:
    text_lower = text.lower()
    return [p for p in PLATFORM_KEYWORDS if p in text_lower]


def extract_amounts(text: str) -> list[str]:
    matches = AMOUNT_PATTERN.findall(text)
    amounts = []
    for m in matches:
        value = m[0] or m[1]
        if value:
            amounts.append(value.replace(",", ""))
    return amounts


def extract_threat_phrases(text: str) -> list[str]:
    text_lower = text.lower()
    return [phrase for phrase in THREAT_PHRASES if phrase in text_lower]


def extract_entities(description: str) -> dict:
    """
    Returns a structured summary of a free-text incident description:
    {
      "roles_mentioned": [...],
      "platforms_mentioned": [...],
      "amounts_mentioned": [...],
      "threat_phrases": [...],
      "has_threat_language": bool
    }
    """
    if not description or not description.strip():
        return {
            "roles_mentioned": [],
            "platforms_mentioned": [],
            "amounts_mentioned": [],
            "threat_phrases": [],
            "has_threat_language": False,
        }

    threats = extract_threat_phrases(description)

    return {
        "roles_mentioned": extract_roles(description),
        "platforms_mentioned": extract_platforms(description),
        "amounts_mentioned": extract_amounts(description),
        "threat_phrases": threats,
        "has_threat_language": len(threats) > 0,
    }


def enrich_incident(incident: dict) -> dict:
    """
    Returns a copy of the incident dict with an added `extracted_entities`
    field. Does not mutate structured fields the survivor already filled in
    (e.g. `people_involved`, `digital_details.platform`) -- this is
    supplementary signal, not a replacement.
    """
    enriched = dict(incident)
    enriched["extracted_entities"] = extract_entities(incident.get("description", ""))
    return enriched


if __name__ == "__main__":
    import json

    sample_text = (
        "My husband hit me, took my card and threatened to share our "
        "private video on WhatsApp if I told anyone. He also took Rs. 5000 "
        "from my account."
    )
    print(json.dumps(extract_entities(sample_text), indent=2))
