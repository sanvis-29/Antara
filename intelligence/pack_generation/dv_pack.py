"""
dv_pack.py — assembles the "DV pack": every incident tagged `physical`,
with a plain-language summary suitable for handing to police or a
counselor. Structurally mirrors economic_pack.py and cyber_pack.py so the
three are easy to maintain in parallel; only the category filter and
narrative wording differ.
"""
from __future__ import annotations

from datetime import datetime, timezone


def _matches(incident: dict) -> bool:
    return bool((incident.get("categories") or {}).get("physical"))


def _summarize(incidents: list[dict]) -> str:
    if not incidents:
        return "No physical-abuse incidents have been logged yet."

    count = len(incidents)
    dates = sorted(i.get("date") for i in incidents if i.get("date"))
    evidence_count = sum(len(i.get("evidence") or []) for i in incidents)

    date_range = f"between {dates[0]} and {dates[-1]}" if len(dates) > 1 else f"on {dates[0]}" if dates else ""

    return (
        f"{count} incident{'s' if count != 1 else ''} involving physical harm "
        f"{'were' if count != 1 else 'was'} logged {date_range}, supported by "
        f"{evidence_count} piece{'s' if evidence_count != 1 else ''} of evidence."
    )


def generate(incidents: list[dict]) -> dict:
    """
    Returns:
    {
      "pack_type": "dv_pack",
      "generated_at": "...",
      "incident_count": N,
      "incidents": [...matching incidents...],
      "summary": "plain-language paragraph",
      "people_involved": [unique role/name pairs across matching incidents]
    }
    """
    relevant = [i for i in incidents if _matches(i)]

    people = []
    seen = set()
    for incident in relevant:
        for person in incident.get("people_involved") or []:
            key = (person.get("role"), person.get("name"))
            if key not in seen:
                seen.add(key)
                people.append(person)

    return {
        "pack_type": "dv_pack",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "incident_count": len(relevant),
        "incidents": relevant,
        "summary": _summarize(relevant),
        "people_involved": people,
    }


if __name__ == "__main__":
    import json

    sample = [
        {
            "incident_id": "INC001",
            "date": "2026-08-18",
            "categories": {"physical": True, "economic": True, "digital": False},
            "evidence": [{"evidence_id": "E001", "type": "image"}],
            "people_involved": [{"role": "husband", "name": None}],
        }
    ]
    print(json.dumps(generate(sample), indent=2))
