import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base


class DocumentType(str, enum.Enum):
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


class Document(Base):
    __tablename__ = "essential_documents"

    document_id = Column(String, primary_key=True, default=lambda: f"DOC{uuid.uuid4().hex[:8].upper()}")
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    document_type = Column(Enum(DocumentType), nullable=False)
    label = Column(String, nullable=False)

    original_filename = Column(String, nullable=False)
    # Path/key to the encrypted blob in storage (see services/storage_service.py).
    # The plaintext file itself is never stored unencrypted and never
    # returned directly by the API.
    encrypted_storage_key = Column(String, nullable=False)

    sha256_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="documents")

