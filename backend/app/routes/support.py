from typing import Optional
from pydantic import BaseModel


class SupportProviderOut(BaseModel):
    id: str
    name: str
    category: str
    phone: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    is_24x7: bool
    verified: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class HandoffGenerateRequest(BaseModel):
    """What gets shared when a survivor consents to hand off their case,
    e.g. to a counselor or legal aid worker."""
    consented_categories: list[str] = []   # subset of ["physical", "economic", "digital"]
    include_evidence: bool = True
    recipient_note: Optional[str] = None
