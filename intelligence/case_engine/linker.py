"""
linker.py — connects the dots across a survivor's case:

  1. `link_evidence` confirms/normalizes which evidence items belong to which
     incident (the backend already enforces this via foreign keys; this is
     the intelligence-layer pass that also flags evidence whose `type`
     doesn't match what the incident's description implies, e.g. an
     incident that only mentions physical assault but has a "bank_sms"
     piece of evidence attached -- not wrong, just worth a human glance).

  2. `build_timeline` orders incidents chronologically for the Case Record /
     Timeline screen.

  3. `find_related_incidents` groups incidents that likely involve the same
     person (matched by role + optional name) so the Navigator and pack
     generators can show "this is part of a pattern" rather than treating
     every incident as isolated.

All functions take/return plain dicts matching the frozen incident schema.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime


def link_evidence(incident: dict, evidence_items: list[dict]) -> dict:
    """
    Attaches `evidence_items` to `incident['evidence']` and flags any
    evidence types that don't obviously match the incident's ticked
    categories, as a `linking_notes` list for human review. Does not drop
    or reject anything -- evidence stays attached regardless.
    """
    categories = incident.get("categories") or {}
    expected_types_by_category = {
        "physical": {"image", "video", "document", "audio"},
        "economic": {"bank_sms", "document", "image"},
        "digital": {"chat_screenshot", "image", "video"},
    }

    expected_types: set[str] = set()
    for cat, is_present in categories.items():
        if is_present and cat in expected_types_by_category:
            expected_types |= expected_types_by_category[cat]

    notes = []
    for item in evidence_items:
        ev_type = item.get("type")
        if expected_types and ev_type not in expected_types and ev_type != "other":
            notes.append(
                f"evidence {item.get('evidence_id', '?')} is type '{ev_type}', "
                f"which doesn't typically match this incident's ticked categories"
            )

    linked = dict(incident)
    linked["evidence"] = [
        {"evidence_id": item.get("evidence_id"), "type": item.get("type")}
        for item in evidence_items
    ]
    linked["linking_notes"] = notes
    return linked


def _parse_incident_datetime(incident: dict) -> datetime:
    date_str = incident.get("date") or "1970-01-01"
    time_str = incident.get("time") or "00:00"
    try:
        return datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except ValueError:
        # Fall back to date only if time is malformed/missing.
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return datetime.min


def build_timeline(incidents: list[dict]) -> list[dict]:
    """Returns incidents sorted chronologically (oldest first), each tagged
    with a zero-indexed `sequence_number` for rendering on a Timeline UI."""
    sorted_incidents = sorted(incidents, key=_parse_incident_datetime)
    timeline = []
    for i, incident in enumerate(sorted_incidents):
        entry = dict(incident)
        entry["sequence_number"] = i
        timeline.append(entry)
    return timeline


def _person_key(person: dict) -> str:
    role = (person.get("role") or "").strip().lower()
    name = (person.get("name") or "").strip().lower()
    return f"{role}:{name}" if name else role


def find_related_incidents(incidents: list[dict]) -> list[dict]:
    """
    Groups incidents by the people involved. Returns a list of clusters:
    [
      { "person_key": "husband:", "incident_ids": [...], "incident_count": N },
      ...
    ]
    Incidents with no `people_involved` are grouped under "unspecified".
    """
    groups: dict[str, list[str]] = defaultdict(list)

    for incident in incidents:
        people = incident.get("people_involved") or []
        incident_id = incident.get("incident_id")
        if not people:
            groups["unspecified"].append(incident_id)
            continue
        for person in people:
            key = _person_key(person) or "unspecified"
            groups[key].append(incident_id)

    return [
        {"person_key": key, "incident_ids": ids, "incident_count": len(ids)}
        for key, ids in sorted(groups.items(), key=lambda kv: -len(kv[1]))
    ]


if __name__ == "__main__":
    import json

    incidents = [
        {
            "incident_id": "INC001",
            "date": "2026-08-18",
            "time": "21:30",
            "people_involved": [{"role": "husband", "name": None}],
        },
        {
            "incident_id": "INC002",
            "date": "2026-08-25",
            "time": "10:15",
            "people_involved": [{"role": "husband", "name": None}],
        },
    ]
    print(json.dumps(build_timeline(incidents), indent=2))
    print(json.dumps(find_related_incidents(incidents), indent=2))
