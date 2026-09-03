from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.models.support_provider import SupportProvider
from app.schemas.support import SupportProviderOut, HandoffGenerateRequest
from app.services.encryption_service import decrypt_text

router = APIRouter(prefix="/api", tags=["support"])


@router.get("/support/recommendations", response_model=list[SupportProviderOut])
def get_recommendations(
    city: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Recommends verified support services based on the categories present
    across the user's incidents (physical -> police/shelter/medical,
    economic -> legal/financial, digital -> cyber crime cell), matching
    the category -> provider mapping used by the Navigator.
    """
    incidents = db.query(Incident).filter(Incident.user_id == current_user.id).all()

    wanted_categories = set()
    if any(i.category_physical for i in incidents):
        wanted_categories.update(["police", "shelter", "medical", "counseling"])
    if any(i.category_economic for i in incidents):
        wanted_categories.update(["legal", "financial"])
    if any(i.category_digital for i in incidents):
        wanted_categories.update(["cyber", "legal"])

    if not wanted_categories:
        # No incidents logged yet -- show a safe, broadly useful default set.
        wanted_categories = {"police", "counseling", "legal"}

    query = db.query(SupportProvider).filter(
        SupportProvider.verified.is_(True),
        SupportProvider.category.in_(wanted_categories),
    )
    if city:
        query = query.filter(SupportProvider.city == city)

    return [SupportProviderOut.model_validate(p) for p in query.all()]


@router.post("/handoff/generate")
def generate_handoff(
    payload: HandoffGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Builds the exact, consent-scoped bundle a survivor agrees to share with a
    counselor/legal aid worker -- only the categories they explicitly ticked
    on the consent screen, nothing more.
    """
    incidents = db.query(Incident).filter(Incident.user_id == current_user.id).all()

    def matches_consent(incident: Incident) -> bool:
        if not payload.consented_categories:
            return False
        cats = payload.consented_categories
        return (
            ("physical" in cats and incident.category_physical)
            or ("economic" in cats and incident.category_economic)
            or ("digital" in cats and incident.category_digital)
        )

    handoff_incidents = []
    for inc in incidents:
        if not matches_consent(inc):
            continue
        description = decrypt_text(inc.description_encrypted)
        entry = inc.to_contract_dict(description)
        if not payload.include_evidence:
            entry["evidence"] = []
        handoff_incidents.append(entry)

    return {
        "user_id": current_user.id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "consented_categories": payload.consented_categories,
        "recipient_note": payload.recipient_note,
        "incidents": handoff_incidents,
    }
