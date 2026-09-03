from datetime import datetime
from typing import Optional
from pydantic import BaseModel


VALID_EVIDENCE_TYPES = {"image", "bank_sms", "chat_screenshot", "audio", "document", "video", "other"}


class EvidenceOut(BaseModel):
    evidence_id: str
    incident_id: str
    type: str
    original_filename: Optional[str] = None
    sha256_hash: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
