from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CaseRecordOut(BaseModel):
    case_id: str
    user_id: str
    readiness_score: float
    tags: list[str] = []
    summary: Optional[dict] = None
    generated_packs: list[dict] = []
    incident_count: int
    updated_at: datetime

    class Config:
        from_attributes = True


class PackGenerateRequest(BaseModel):
    pack_type: str  # dv_pack | economic_pack | cyber_pack


