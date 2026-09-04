import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


def gen_id(prefix: str) -> str:
    return f"{prefix}{uuid.uuid4().hex[:10].upper()}"


class User(Base):
    """
    A survivor's account. Deliberately minimal PII: a pseudonymous username
    is enough to use the app -- no real name or phone number is required.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: gen_id("USR"))
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Optional secondary PIN used to unlock the disguised app / Guardian Vault.
    hashed_unlock_pin = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incidents = relationship("Incident", back_populates="user", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="user", cascade="all, delete-orphan")
    guardians = relationship("Guardian", back_populates="user", cascade="all, delete-orphan")
    case_record = relationship("CaseRecord", back_populates="user", uselist=False, cascade="all, delete-orphan")

