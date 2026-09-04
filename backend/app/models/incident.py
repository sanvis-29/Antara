from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.user import gen_id


class Incident(Base):
    """
    Mirrors the frozen incident structure in shared/api-contract.md exactly:
    incident_id, user_id, description, date, time, location, people_involved,
    categories, evidence (relationship), economic_details, digital_details.

    `description` is stored encrypted at rest (see encryption_service) since it
    is the most sensitive free-text field a survivor will write.
    """
    __tablename__ = "incidents"

    incident_id = Column(String, primary_key=True, default=lambda: gen_id("INC"))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    description_encrypted = Column(Text, nullable=False)

    date = Column(String, nullable=False)   # "YYYY-MM-DD" - kept as string to match contract exactly
    time = Column(String, nullable=True)    # "HH:MM"
    location = Column(String, nullable=True)

    people_involved = Column(JSON, default=list)   # [{"role": "...", "name": "optional"}]

    # categories: {"physical": bool, "economic": bool, "digital": bool}
    category_physical = Column(Boolean, default=False)
    category_economic = Column(Boolean, default=False)
    category_digital = Column(Boolean, default=False)

    # economic_details: {"money_controlled", "card_withheld", "amount"}
    economic_money_controlled = Column(Boolean, nullable=True)
    economic_card_withheld = Column(Boolean, nullable=True)
    economic_amount = Column(String, nullable=True)

    # digital_details: {"platform", "private_content_threat"}
    digital_platform = Column(String, nullable=True)
    digital_private_content_threat = Column(Boolean, nullable=True)

    # Populated by Person 2's classifier after AI structuring runs.
    ai_classification = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="incidents")
    evidence = relationship("Evidence", back_populates="incident", cascade="all, delete-orphan")

    def to_contract_dict(self, description_plain: str) -> dict:
        """Serialize back into the exact shape frozen in api-contract.md."""
        return {
            "incident_id": self.incident_id,
            "user_id": self.user_id,
            "description": description_plain,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "people_involved": self.people_involved or [],
            "categories": {
                "physical": self.category_physical,
                "economic": self.category_economic,
                "digital": self.category_digital,
            },
            "evidence": [{"evidence_id": e.evidence_id, "type": e.type} for e in self.evidence],
            "economic_details": {
                "money_controlled": self.economic_money_controlled,
                "card_withheld": self.economic_card_withheld,
                "amount": self.economic_amount,
            },
            "digital_details": {
                "platform": self.digital_platform,
                "private_content_threat": self.digital_private_content_threat,
            },
            "ai_classification": self.ai_classification,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

