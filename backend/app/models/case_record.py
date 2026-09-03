from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.user import gen_id


class CaseRecord(Base):
    """
    The single object every subsystem meets at: aggregated readiness state
    for one user across all their incidents. Person 2's classifier/readiness
    engine updates this; Person 1 renders it; Person 3 stores and protects it.
    """
    __tablename__ = "case_records"

    case_id = Column(String, primary_key=True, default=lambda: gen_id("CASE"))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    readiness_score = Column(Float, default=0.0)   # 0-100, how "case ready" the evidence set is
    tags = Column(JSON, default=list)               # e.g. ["physical", "economic", "digital"]
    summary = Column(JSON, nullable=True)           # structured summary produced by intelligence layer
    generated_packs = Column(JSON, default=list)     # list of {"pack_type", "generated_at", "path"}

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="case_record")