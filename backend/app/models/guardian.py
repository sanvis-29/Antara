from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.guardian import (
    GuardianBackupRequest,
    GuardianBackupResponse,
    GuardianRecoverRequest,
)
from app.services.guardian_service import create_backup, recover_backup

router = APIRouter(prefix="/api/guardian", tags=["guardian"])


@router.post("/backup", response_model=GuardianBackupResponse)
def backup(
    payload: GuardianBackupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    guardian, recovery_code = create_backup(
        db, current_user.id, payload.guardian_name, payload.guardian_contact
    )
    return GuardianBackupResponse(
        guardian_id=guardian.guardian_id,
        recovery_code=recovery_code,
        backed_up_at=guardian.last_backup_at,
    )


@router.post("/recover")
def recover(payload: GuardianRecoverRequest, db: Session = Depends(get_db)):
    """
    Intentionally NOT behind get_current_user: recovery is the path used
    precisely when a survivor has lost access to their original account/device.
    Protection instead comes from the guardian_id + recovery_code pair, which
    is never stored in plaintext.
    """
    try:
        snapshot = recover_backup(db, payload.guardian_id, payload.recovery_code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return snapshot
