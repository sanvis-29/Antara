from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.case_record import PackGenerateRequest
from app.services.pack_service import generate_pack, VALID_PACK_TYPES

router = APIRouter(prefix="/api/packs", tags=["packs"])


@router.post("/generate")
def generate(
    payload: PackGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.pack_type not in VALID_PACK_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"pack_type must be one of {sorted(VALID_PACK_TYPES)}",
        )

    return generate_pack(db, current_user.id, payload.pack_type)


