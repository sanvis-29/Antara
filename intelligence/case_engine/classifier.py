"""
classifier.py — physical / economic / digital tagging for an incident.

Two layers of signal, combined:
  1. Explicit structured fields the survivor already ticked
     (`categories.physical`, `economic_details`, `digital_details`).
  2. Keyword evidence pulled from the free-text `description`, which catches
     cases where the survivor's narrative mentions something they didn't
     separately tick (or contradicts what they ticked, which is itself
     useful signal for a human reviewer).

This is deliberately a transparent, rule-based baseline — see the "method"
field in the output and `docs/future-scope.md` for the planned upgrade path
to an LLM-based classifier. The output shape is frozen so swapping the
implementation later doesn't require touching the backend route that calls
this (`app/routes/case.py`).
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

CategoryTag = str  # one of "physical", "economic", "digital"

# Keyword banks per category. Kept lowercase; matching is case-insensitive
# and uses simple substring/word-boundary checks, not full NLP -- fast,
# explainable, and easy for a non-ML teammate to extend.
KEYWORDS: dict[CategoryTag, list[str]] = {
    "physical": [
        "hit", "slap", "punch", "kick", "beat", "choke", "strangle", "push",
        "shove", "grab", "hurt", "injur", "bruise", "assault", "attack",
        "weapon", "knife", "threat to kill", "threatened to kill",
        "locked me in", "locked me out", "restrain",
    ],
    "economic": [
        "money", "salary", "bank", "card", "debit card", "credit card",
        "atm", "withdraw", "account", "cash", "allowance", "job", "fired me",
        "stopped me from working", "controlled my money", "took my card",
        "financial", "property", "dowry", "loan", "debt",
    ],
    "digital": [
        "whatsapp", "instagram", "facebook", "snapchat", "telegram", "sms",
        "text message", "video", "photo", "picture", "post online", "upload",
        "leak", "share our", "private video", "private photo", "screenshot",
        "hack", "tracked my phone", "location tracking", "spyware", "cyber",
    ],
}

# A very small set of intensifiers that bump confidence when present near a
# category keyword -- kept separate so it's easy to tune independently.
INTENSIFIERS = ["threaten", "always", "every day", "repeatedly", "again"]


@dataclass
class ClassificationResult:
    tags: list[CategoryTag] = field(default_factory=list)
    confidence: float = 0.0
    method: str = "rule_based_v1"
    matched_keywords: dict[CategoryTag, list[str]] = field(default_factory=dict)
    disagreements: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "tags": self.tags,
            "confidence": round(self.confidence, 2),
            "method": self.method,
            "matched_keywords": self.matched_keywords,
            "disagreements": self.disagreements,
        }


def _find_keyword_matches(text: str) -> dict[CategoryTag, list[str]]:
    text_lower = text.lower()
    matches: dict[CategoryTag, list[str]] = {}
    for category, keywords in KEYWORDS.items():
        found = [kw for kw in keywords if kw in text_lower]
        if found:
            matches[category] = found
    return matches


def classify_text(description: str) -> ClassificationResult:
    """Classify a raw incident description with no other context."""
    if not description or not description.strip():
        return ClassificationResult(tags=[], confidence=0.0)

    matches = _find_keyword_matches(description)
    tags = sorted(matches.keys())

    if not tags:
        return ClassificationResult(tags=[], confidence=0.1, matched_keywords={})

    text_lower = description.lower()
    intensifier_hits = sum(1 for word in INTENSIFIERS if word in text_lower)

    # Base confidence scales with how many distinct keywords matched across
    # all matched categories, plus a small bump per intensifier found.
    total_keyword_hits = sum(len(v) for v in matches.values())
    confidence = min(0.95, 0.4 + 0.1 * total_keyword_hits + 0.05 * intensifier_hits)

    return ClassificationResult(tags=tags, confidence=confidence, matched_keywords=matches)


def classify_incident(incident: dict) -> dict:
    """
    Classify a full incident dict (matching the frozen schema). Combines the
    survivor's explicit `categories` ticks with keyword evidence from
    `description`, and flags any disagreement between the two for a human
    reviewer to double check (e.g. survivor didn't tick "digital" but the
    description mentions a threat to share a private video).
    """
    description = incident.get("description", "") or ""
    text_result = classify_text(description)

    explicit_categories = incident.get("categories") or {}
    explicit_tags = sorted(
        cat for cat in ("physical", "economic", "digital") if explicit_categories.get(cat)
    )

    combined_tags = sorted(set(text_result.tags) | set(explicit_tags))

    disagreements = []
    for cat in ("physical", "economic", "digital"):
        in_text = cat in text_result.tags
        in_explicit = cat in explicit_tags
        if in_text != in_explicit:
            direction = "mentioned in description but not ticked" if in_text else "ticked but not mentioned in description"
            disagreements.append(f"{cat}: {direction}")

    # Confidence: if explicit and text-based tagging agree completely, we're
    # more confident than either signal alone.
    agreement_bonus = 0.15 if not disagreements and combined_tags else 0.0
    confidence = min(0.98, max(text_result.confidence, 0.5 if explicit_tags else 0.0) + agreement_bonus)

    result = ClassificationResult(
        tags=combined_tags,
        confidence=confidence,
        matched_keywords=text_result.matched_keywords,
        disagreements=disagreements,
    )
    return result.to_dict()


if __name__ == "__main__":
    sample = {
        "description": "My husband hit me, took my card and threatened to share our private video.",
        "categories": {"physical": True, "economic": True, "digital": True},
    }
    import json
    print(json.dumps(classify_incident(sample), indent=2))
