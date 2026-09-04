from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class DocumentType(str, Enum):
    aadhaar = "aadhaar"
    pan = "pan"
    passport = "passport"
    driving_licence = "driving_licence"
    bank_passbook = "bank_passbook"
    debit_card_reference = "debit_card_reference"
    marriage_certificate = "marriage_certificate"
    child_document = "child_document"
    medical_record = "medical_record"
    other = "other"


class DocumentCreateResponse(BaseModel):
    document_id: str
    user_id: str
    document_type: DocumentType
    label: str
    original_filename: str
    sha256_hash: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentMetadata(BaseModel):
    """Metadata-only view, used in list endpoints and Guardian backup payloads."""
    document_id: str
    document_type: DocumentType
    label: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    user_id: str
    documents: list[DocumentMetadata]

