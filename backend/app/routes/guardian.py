from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.guardian import (
    GuardianBackupRequest,
    GuardianBackupResponse,
    GuardianRecoverRequest,
)
from app.services.guardian_service import (
    create_backup,
    recover_backup,
)


router = APIRouter(
    prefix="/api/guardian",
    tags=["guardian"],
)


@router.post(
    "/backup",
    response_model=GuardianBackupResponse,
)
def backup(
    payload: GuardianBackupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        guardian = create_backup(
            db=db,
            user_id=current_user.id,
            guardian_name=payload.guardian_name,
            guardian_contact=payload.guardian_contact,
            unlock_pin=payload.unlock_pin,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    return GuardianBackupResponse(
        guardian_id=guardian.guardian_id,
        backed_up_at=guardian.last_backup_at,
    )


@router.post("/recover")
def recover(
    payload: GuardianRecoverRequest,
    db: Session = Depends(get_db),
):
    """
    Recovery deliberately does not require the original authenticated session.

    The Guardian ID identifies the encrypted backup and the survivor's
    private PIN authorises recovery.
    """

    try:
        return recover_backup(
            db=db,
            guardian_id=payload.guardian_id,
            unlock_pin=payload.unlock_pin,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )