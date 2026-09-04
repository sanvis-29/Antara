from typing import Optional
from pydantic import BaseModel, Field, field_validator

from app.utils.helpers import is_valid_date_str, is_valid_time_str


class PersonInvolved(BaseModel):
    role: str
    name: Optional[str] = None


class Categories(BaseModel):
    physical: bool = False
    economic: bool = False
    digital: bool = False


class EconomicDetails(BaseModel):
    money_controlled: Optional[bool] = None
    card_withheld: Optional[bool] = None
    amount: Optional[str] = None


class DigitalDetails(BaseModel):
    platform: Optional[str] = None
    private_content_threat: Optional[bool] = None


class EvidenceRef(BaseModel):
    evidence_id: str
    type: str


class IncidentCreate(BaseModel):
    """
    Exactly matches the payload Person 1 sends per shared/api-contract.md.
    user_id is intentionally NOT required here -- it's derived from the
    authenticated session so one user can never create incidents for another.
    """
    description: str = Field(..., min_length=1)
    date: str
    time: Optional[str] = None
    location: Optional[str] = None
    people_involved: list[PersonInvolved] = Field(default_factory=list)
    categories: Categories = Field(default_factory=Categories)
    economic_details: Optional[EconomicDetails] = None
    digital_details: Optional[DigitalDetails] = None

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        if not is_valid_date_str(v):
            raise ValueError("date must be in YYYY-MM-DD format")
        return v

    @field_validator("time")
    @classmethod
    def validate_time(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not is_valid_time_str(v):
            raise ValueError("time must be in HH:MM format")
        return v


class IncidentOut(BaseModel):
    incident_id: str
    user_id: str
    description: str
    date: str
    time: Optional[str] = None
    location: Optional[str] = None
    people_involved: list[dict] = Field(default_factory=list)
    categories: Categories
    evidence: list[EvidenceRef] = Field(default_factory=list)
    economic_details: EconomicDetails
    digital_details: DigitalDetails
    ai_classification: Optional[dict] = None
    created_at: Optional[str] = None


class IncidentStructureRequest(BaseModel):
    """Used by POST /api/case/structure to (re)run AI classification on an incident."""
    incident_id: str

