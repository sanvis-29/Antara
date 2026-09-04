"""
cyber_pack.py — assembles the "Cyber pack": every incident tagged
`digital`, plus the platforms involved and whether any private-content
threats were made, suitable for a cyber crime cell report.
"""
from __future__ import annotations

from datetime import datetime, timezone


def _matches(incident: dict) -> bool:
    return bool((incident.get("categories") or {}).get("digital"))


def _compute_details(incidents: list[dict]) -> dict:
    platforms = set()
    threat_count = 0

    for incident in incidents:
        digital = incident.get("digital_details") or {}
        if digital.get("platform"):
            platforms.add(digital["platform"])
        if digital.get("private_content_threat"):
            threat_count += 1

    return {
        "platforms_involved": sorted(platforms),
        "incidents_with_private_content_threat": threat_count,
    }


def _summarize(incidents: list[dict], details: dict) -> str:
    if not incidents:
        return "No digital-abuse incidents have been logged yet."

    count = len(incidents)
    parts = [f"{count} incident{'s' if count != 1 else ''} involving digital threats "
             f"{'were' if count != 1 else 'was'} logged."]

    if details["platforms_involved"]:
        parts.append(f"Platform(s) involved: {', '.join(details['platforms_involved'])}.")
    if details["incidents_with_private_content_threat"]:
        parts.append(
            f"{details['incidents_with_private_content_threat']} incident(s) involved a threat "
            f"to share private images/video without consent."
        )

    return " ".join(parts)


def generate(incidents: list[dict]) -> dict:
    """
    Returns:
    {
      "pack_type": "cyber_pack",
      "generated_at": "...",
      "incident_count": N,
      "incidents": [...],
      "platforms_involved": [...],
      "incidents_with_private_content_threat": N,
      "summary": "plain-language paragraph"
    }
    """
    relevant = [i for i in incidents if _matches(i)]
    details = _compute_details(relevant)

    return {
        "pack_type": "cyber_pack",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "incident_count": len(relevant),
        "incidents": relevant,
        "platforms_involved": details["platforms_involved"],
        "incidents_with_private_content_threat": details["incidents_with_private_content_threat"],
        "summary": _summarize(relevant, details),
    }


if __name__ == "__main__":
    import json

    sample = [
        {
            "incident_id": "INC002",
            "date": "2026-08-25",
            "categories": {"physical": False, "economic": False, "digital": True},
            "digital_details": {"platform": "WhatsApp", "private_content_threat": True},
        }
    ]
    print(json.dumps(generate(sample), indent=2))
