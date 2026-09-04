"""
readiness.py — computes how "case ready" a survivor's documented history is:
how much evidence backs up how many incidents, across how many corroborating
categories, with how much of a documented pattern over time.

The backend has its own lightweight fallback heuristic in
`backend/app/routes/case.py::_recompute_readiness` so the API keeps working
standalone. This module is the richer version Person 2 owns, meant to be
called from that same spot once ready — same 0-100 scale, richer breakdown.

Score is intentionally explainable: every point added is traceable to a
named factor in `breakdown`, so a survivor or advocate can see *why* the
score is what it is, not just trust a black box number.
"""
from __future__ import annotations

from datetime import datetime

MAX_SCORE = 100.0

# Weight tuning -- kept as named constants so they're easy for the team to
# discuss/adjust rather than buried as magic numbers.
POINTS_PER_INCIDENT = 12.0
POINTS_PER_EVIDENCE_ITEM = 8.0
POINTS_PER_CATEGORY_PRESENT = 6.0
POINTS_PER_EVIDENCE_TYPE_DIVERSITY = 4.0
POINTS_FOR_REPEATED_PATTERN = 10.0  # same person involved in 2+ incidents
POINTS_FOR_RECENT_ACTIVITY = 5.0    # at least one incident in the last 30 days

# Caps so no single factor can dominate the score alone.
CAP_FROM_INCIDENT_COUNT = 36.0
CAP_FROM_EVIDENCE_COUNT = 32.0
CAP_FROM_EVIDENCE_DIVERSITY = 12.0


def _days_since(date_str: str) -> float | None:
    try:
        incident_date = datetime.strptime(date_str, "%Y-%m-%d")
    except (TypeError, ValueError):
        return None
    return (datetime.now() - incident_date).days


def _person_key(person: dict) -> str:
    role = (person.get("role") or "").strip().lower()
    name = (person.get("name") or "").strip().lower()
    return f"{role}:{name}" if name else role


def compute_readiness(incidents: list[dict]) -> dict:
    """
    Takes a list of incident dicts (frozen schema, `evidence` populated with
    at least `{"evidence_id", "type"}` per item) and returns:
    {
      "score": 0-100,
      "breakdown": { "incidents": pts, "evidence": pts, "categories": pts,
                     "evidence_diversity": pts, "repeated_pattern": pts,
                     "recent_activity": pts },
      "categories_present": [...],
      "evidence_type_diversity": int,
      "incident_count": int,
      "evidence_count": int
    }
    """
    if not incidents:
        return {
            "score": 0.0,
            "breakdown": {},
            "categories_present": [],
            "evidence_type_diversity": 0,
            "incident_count": 0,
            "evidence_count": 0,
        }

    incident_count = len(incidents)
    evidence_count = 0
    evidence_types_seen: set[str] = set()
    categories_present: set[str] = set()
    person_incident_map: dict[str, set[str]] = {}
    most_recent_days: float | None = None

    for incident in incidents:
        evidence_items = incident.get("evidence") or []
        evidence_count += len(evidence_items)
        for item in evidence_items:
            ev_type = item.get("type")
            if ev_type:
                evidence_types_seen.add(ev_type)

        categories = incident.get("categories") or {}
        for cat in ("physical", "economic", "digital"):
            if categories.get(cat):
                categories_present.add(cat)

        for person in incident.get("people_involved") or []:
            key = _person_key(person)
            if not key:
                continue
            person_incident_map.setdefault(key, set()).add(incident.get("incident_id", ""))

        days = _days_since(incident.get("date"))
        if days is not None and (most_recent_days is None or days < most_recent_days):
            most_recent_days = days

    repeated_pattern = any(len(ids) >= 2 for ids in person_incident_map.values())
    recent_activity = most_recent_days is not None and most_recent_days <= 30

    incidents_pts = min(CAP_FROM_INCIDENT_COUNT, incident_count * POINTS_PER_INCIDENT)
    evidence_pts = min(CAP_FROM_EVIDENCE_COUNT, evidence_count * POINTS_PER_EVIDENCE_ITEM)
    categories_pts = len(categories_present) * POINTS_PER_CATEGORY_PRESENT
    diversity_pts = min(
        CAP_FROM_EVIDENCE_DIVERSITY, len(evidence_types_seen) * POINTS_PER_EVIDENCE_TYPE_DIVERSITY
    )
    pattern_pts = POINTS_FOR_REPEATED_PATTERN if repeated_pattern else 0.0
    recent_pts = POINTS_FOR_RECENT_ACTIVITY if recent_activity else 0.0

    total = min(
        MAX_SCORE,
        incidents_pts + evidence_pts + categories_pts + diversity_pts + pattern_pts + recent_pts,
    )

    return {
        "score": round(total, 1),
        "breakdown": {
            "incidents": round(incidents_pts, 1),
            "evidence": round(evidence_pts, 1),
            "categories": round(categories_pts, 1),
            "evidence_diversity": round(diversity_pts, 1),
            "repeated_pattern": round(pattern_pts, 1),
            "recent_activity": round(recent_pts, 1),
        },
        "categories_present": sorted(categories_present),
        "evidence_type_diversity": len(evidence_types_seen),
        "incident_count": incident_count,
        "evidence_count": evidence_count,
    }


if __name__ == "__main__":
    import json

    sample_incidents = [
        {
            "incident_id": "INC001",
            "date": "2026-08-18",
            "categories": {"physical": True, "economic": True, "digital": False},
            "evidence": [{"evidence_id": "E001", "type": "image"}, {"evidence_id": "E002", "type": "bank_sms"}],
            "people_involved": [{"role": "husband", "name": None}],
        },
        {
            "incident_id": "INC002",
            "date": "2026-08-25",
            "categories": {"physical": False, "economic": False, "digital": True},
            "evidence": [{"evidence_id": "E003", "type": "chat_screenshot"}],
            "people_involved": [{"role": "husband", "name": None}],
        },
    ]
    print(json.dumps(compute_readiness(sample_incidents), indent=2))
