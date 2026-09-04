"""
economic_pack.py — assembles the "Economic pack": every incident tagged
`economic`, plus totals on money controlled/withheld, suitable for a legal
aid worker or financial fraud recovery service.
"""
from __future__ import annotations

from datetime import datetime, timezone


def _matches(incident: dict) -> bool:
    return bool((incident.get("categories") or {}).get("economic"))


def _compute_totals(incidents: list[dict]) -> dict:
    money_controlled = 0
    card_withheld = 0
    amounts: list[str] = []

    for incident in incidents:
        econ = incident.get("economic_details") or {}
        if econ.get("money_controlled"):
            money_controlled += 1
        if econ.get("card_withheld"):
            card_withheld += 1
        if econ.get("amount"):
            amounts.append(str(econ["amount"]))

    return {
        "incidents_with_money_controlled": money_controlled,
        "incidents_with_card_withheld": card_withheld,
        "amounts_mentioned": amounts,
    }


def _summarize(incidents: list[dict], totals: dict) -> str:
    if not incidents:
        return "No economic-abuse incidents have been logged yet."

    count = len(incidents)
    parts = [f"{count} incident{'s' if count != 1 else ''} involving economic control "
             f"{'were' if count != 1 else 'was'} logged."]

    if totals["incidents_with_card_withheld"]:
        parts.append(f"A card or financial access was withheld in {totals['incidents_with_card_withheld']} of them.")
    if totals["incidents_with_money_controlled"]:
        parts.append(f"Money was directly controlled in {totals['incidents_with_money_controlled']} of them.")
    if totals["amounts_mentioned"]:
        parts.append(f"Specific amounts mentioned: {', '.join(totals['amounts_mentioned'])}.")

    return " ".join(parts)


def generate(incidents: list[dict]) -> dict:
    """
    Returns:
    {
      "pack_type": "economic_pack",
      "generated_at": "...",
      "incident_count": N,
      "incidents": [...],
      "totals": { "incidents_with_money_controlled", "incidents_with_card_withheld", "amounts_mentioned" },
      "summary": "plain-language paragraph"
    }
    """
    relevant = [i for i in incidents if _matches(i)]
    totals = _compute_totals(relevant)

    return {
        "pack_type": "economic_pack",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "incident_count": len(relevant),
        "incidents": relevant,
        "totals": totals,
        "summary": _summarize(relevant, totals),
    }


if __name__ == "__main__":
    import json

    sample = [
        {
            "incident_id": "INC001",
            "date": "2026-08-18",
            "categories": {"physical": True, "economic": True, "digital": False},
            "economic_details": {"money_controlled": True, "card_withheld": True, "amount": "5000"},
        }
    ]
    print(json.dumps(generate(sample), indent=2))
