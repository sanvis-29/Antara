"""
Generates structured "packs" (DV / Economic / Cyber) that bundle a user's
incidents + evidence + AI summary into a single document-ready payload.
Person 2's intelligence layer owns the actual narrative generation logic;
this service is the backend-side assembly + persistence step that Person 1's
/packs screen calls into.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.case_record import CaseRecord
from app.services.encryption_service import decrypt_text

VALID_PACK_TYPES = {"dv_pack", "economic_pack", "cyber_pack"}

CATEGORY_FOR_PACK = {
    "dv_pack": "physical",
    "economic_pack": "economic",
    "cyber_pack": "digital",
}


def _incident_matches_pack(incident: Incident, pack_type: str) -> bool:
    category = CATEGORY_FOR_PACK[pack_type]
    return bool(getattr(incident, f"category_{category}"))


def generate_pack(db: Session, user_id: str, pack_type: str) -> dict:
    if pack_type not in VALID_PACK_TYPES:
        raise ValueError(f"Unknown pack_type '{pack_type}'. Must be one of {sorted(VALID_PACK_TYPES)}.")

    incidents = db.query(Incident).filter(Incident.user_id == user_id).all()
    relevant = [i for i in incidents if _incident_matches_pack(i, pack_type)]

    pack_entries = []
    for inc in relevant:
        description = decrypt_text(inc.description_encrypted)
        entry = inc.to_contract_dict(description)
        pack_entries.append(entry)

    pack = {
        "pack_type": pack_type,
        "user_id": user_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "incident_count": len(pack_entries),
        "incidents": pack_entries,
    }

    if pack_type == "economic_pack":
        pack["totals"] = {
            "incidents_with_card_withheld": sum(1 for i in relevant if i.economic_card_withheld),
            "incidents_with_money_controlled": sum(1 for i in relevant if i.economic_money_controlled),
        }
    elif pack_type == "cyber_pack":
        pack["platforms_involved"] = sorted({i.digital_platform for i in relevant if i.digital_platform})

    # Record generation on the CaseRecord so /case shows history of exported packs.
    case = db.query(CaseRecord).filter(CaseRecord.user_id == user_id).first()
    if case:
        packs_list = list(case.generated_packs or [])
        packs_list.append({"pack_type": pack_type, "generated_at": pack["generated_at"]})
        case.generated_packs = packs_list
        db.commit()

    return pack