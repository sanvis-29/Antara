from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.models.case_record import CaseRecord
from app.schemas.incident import IncidentStructureRequest, IncidentOut
from app.schemas.case_record import CaseRecordOut
from app.services.encryption_service import decrypt_text

router = APIRouter(prefix="/api/case", tags=["case"])


def _fallback_classify(incident: Incident) -> dict:
    """
    Rule-based fallback classifier used until Person 2's real model
    (intelligence/case_engine/classifier.py) is wired in. Keeps the exact same
    output shape so swapping it later is a drop-in change.
    """
    tags = []
    if incident.category_physical:
        tags.append("physical")
    if incident.category_economic:
        tags.append("economic")
    if incident.category_digital:
        tags.append("digital")

    confidence = 0.6 if tags else 0.2
    return {
        "tags": tags,
        "confidence": confidence,
        "method": "rule_based_fallback",
    }


def _recompute_readiness(db: Session, user_id: str) -> CaseRecord:
    incidents = db.query(Incident).filter(Incident.user_id == user_id).all()
    case = db.query(CaseRecord).filter(CaseRecord.user_id == user_id).first()
    if not case:
        case = CaseRecord(user_id=user_id)
        db.add(case)

    all_tags = set()
    evidence_count = 0
    for inc in incidents:
        if inc.category_physical:
            all_tags.add("physical")
        if inc.category_economic:
            all_tags.add("economic")
        if inc.category_digital:
            all_tags.add("digital")
        evidence_count += len(inc.evidence)

    # Simple, explainable readiness heuristic: more incidents + more evidence
    # + more corroborated categories = more "case ready". Capped at 100.
    score = min(100.0, (len(incidents) * 15) + (evidence_count * 10) + (len(all_tags) * 5))

    case.tags = sorted(all_tags)
    case.readiness_score = score
    case.summary = {
        "incident_count": len(incidents),
        "evidence_count": evidence_count,
        "categories_present": sorted(all_tags),
    }
    db.commit()
    db.refresh(case)
    return case


@router.get("/{user_id}", response_model=CaseRecordOut)
def get_case_record(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot view another user's case record")

    case = db.query(CaseRecord).filter(CaseRecord.user_id == user_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case record not found")

    incident_count = db.query(Incident).filter(Incident.user_id == user_id).count()

    return CaseRecordOut(
        case_id=case.case_id,
        user_id=case.user_id,
        readiness_score=case.readiness_score,
        tags=case.tags or [],
        summary=case.summary,
        generated_packs=case.generated_packs or [],
        incident_count=incident_count,
        updated_at=case.updated_at,
    )


@router.post("/structure", response_model=IncidentOut)
def structure_incident(
    payload: IncidentStructureRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .filter(Incident.incident_id == payload.incident_id, Incident.user_id == current_user.id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.ai_classification = _fallback_classify(incident)
    db.commit()
    db.refresh(incident)

    _recompute_readiness(db, current_user.id)

    description = decrypt_text(incident.description_encrypted)
    return IncidentOut(**incident.to_contract_dict(description))
