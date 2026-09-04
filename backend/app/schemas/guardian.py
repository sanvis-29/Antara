from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class GuardianBackupRequest(BaseModel):
    guardian_name: str = Field(..., min_length=1, max_length=100)
    guardian_contact: Optional[str] = None


class GuardianBackupResponse(BaseModel):
    guardian_id: str
    recovery_code: str
    backed_up_at: datetime
    message: str = "Save this recovery code somewhere safe. It will not be shown again."


class GuardianRecoverRequest(BaseModel):
    guardian_id: str
    recovery_code: str


class GuardianOut(BaseModel):
    guardian_id: str
    name: str
    contact: Optional[str] = None
    last_backup_at: Optional[datetime] = None

    class Config:
        from_attributes = True

