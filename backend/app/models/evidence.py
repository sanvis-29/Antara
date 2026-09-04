from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.user import gen_id


class Evidence(Base):
    """
    A single piece of evidence attached to an incident: image, bank_sms,
    chat_screenshot, audio, document, etc. The raw file is written to disk
    (or object storage in prod) via storage_service; only metadata + a
    SHA-256 integrity hash live in the DB.
    """
    __tablename__ = "evidence"

    evidence_id = Column(String, primary_key=True, default=lambda: gen_id("EVD"))
    incident_id = Column(String, ForeignKey("incidents.incident_id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    type = Column(String, nullable=False)          # image | bank_sms | chat_screenshot | audio | document
    original_filename = Column(String, nullable=True)
    stored_path = Column(String, nullable=True)     # server-side path/key
    sha256_hash = Column(String, nullable=False)     # integrity/chain-of-custody hash
    notes = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="evidence")
    user = relationship("User", back_populates="evidence")

