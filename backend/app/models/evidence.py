from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceOut, VALID_EVIDENCE_TYPES
from app.services.storage_service import save_file
from app.services.hashing_service import sha256_bytes

router = APIRouter(prefix="/api/evidence", tags=["evidence"])


@router.post("", response_model=EvidenceOut, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    incident_id: str = Form(...),
    type: str = Form(...),
    notes: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if type not in VALID_EVIDENCE_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"type must be one of {sorted(VALID_EVIDENCE_TYPES)}",
        )

    incident = (
        db.query(Incident)
        .filter(Incident.incident_id == incident_id, Incident.user_id == current_user.id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Uploaded file is empty")

    file_hash = sha256_bytes(content)
    stored_path = save_file(current_user.id, incident_id, file.filename, content)

    evidence = Evidence(
        incident_id=incident_id,
        user_id=current_user.id,
        type=type,
        original_filename=file.filename,
        stored_path=stored_path,
        sha256_hash=file_hash,
        notes=notes,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return EvidenceOut.model_validate(evidence)


@router.get("/{incident_id}", response_model=list[EvidenceOut])
def list_evidence_for_incident(
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

    return [EvidenceOut.model_validate(e) for e in incident.evidence]