from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentOut
from app.services.encryption_service import encrypt_text, decrypt_text

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def _incident_to_out(incident: Incident) -> IncidentOut:
    description = decrypt_text(incident.description_encrypted)
    return IncidentOut(**incident.to_contract_dict(description))


@router.post("", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    econ = payload.economic_details
    digital = payload.digital_details

    incident = Incident(
        user_id=current_user.id,
        description_encrypted=encrypt_text(payload.description),
        date=payload.date,
        time=payload.time,
        location=payload.location,
        people_involved=[p.model_dump() for p in payload.people_involved],
        category_physical=payload.categories.physical,
        category_economic=payload.categories.economic,
        category_digital=payload.categories.digital,
        economic_money_controlled=econ.money_controlled if econ else None,
        economic_card_withheld=econ.card_withheld if econ else None,
        economic_amount=econ.amount if econ else None,
        digital_platform=digital.platform if digital else None,
        digital_private_content_threat=digital.private_content_threat if digital else None,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    return _incident_to_out(incident)


@router.get("", response_model=list[IncidentOut])
def list_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incidents = (
        db.query(Incident)
        .filter(Incident.user_id == current_user.id)
        .order_by(Incident.created_at.desc())
        .all()
    )
    return [_incident_to_out(i) for i in incidents]


@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .filter(Incident.incident_id == incident_id, Incident.user_id == current_user.id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    return _incident_to_out(incident)
