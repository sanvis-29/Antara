from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class GuardianBackupRequest(BaseModel):
    guardian_name: str = Field(..., min_length=1, max_length=100)
    guardian_contact: Optional[str] = None
    unlock_pin: str = Field(..., min_length=4, max_length=8)


class GuardianBackupResponse(BaseModel):
    guardian_id: str
    backed_up_at: datetime
    message: str = (
        "Encrypted Guardian copy created. "
        "The Guardian preserves the backup but cannot read its contents."
    )


class GuardianRecoverRequest(BaseModel):
    guardian_id: str
    unlock_pin: str = Field(..., min_length=4, max_length=8)


class GuardianOut(BaseModel):
    guardian_id: str
    name: str
    contact: Optional[str] = None
    last_backup_at: Optional[datetime] = None

    class Config:
        from_attributes = True