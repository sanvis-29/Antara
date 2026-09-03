from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.user import gen_id


class Guardian(Base):
    """
    A trusted contact who can hold an encrypted backup of a survivor's case
    data for recovery if the survivor's device is lost, seized, or wiped.
    The Guardian never sees plaintext -- backup_blob_encrypted is opaque to
    everyone except someone holding the survivor's recovery key/PIN.
    """
    __tablename__ = "guardians"

    guardian_id = Column(String, primary_key=True, default=lambda: gen_id("GRD"))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    contact = Column(String, nullable=True)  # phone/email, optional by design

    backup_blob_encrypted = Column(Text, nullable=True)
    recovery_code_hash = Column(String, nullable=True)

    # Added timezone=True to handle UTC awareness cleanly
    created_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    last_backup_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="guardians")