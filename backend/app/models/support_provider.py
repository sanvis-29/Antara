from sqlalchemy import Column, String, Boolean, Float

from app.database import Base
from app.models.user import gen_id


class SupportProvider(Base):
    """
    A verified support service (legal aid, counseling, shelter, police
    helpline, cyber-crime cell, etc). Seeded from
    data/verified_services/delhi_services.json at startup.
    """
    __tablename__ = "support_providers"

    id = Column(String, primary_key=True, default=lambda: gen_id("SVC"))
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)   # legal | counseling | shelter | police | cyber | medical | financial
    phone = Column(String, nullable=True)
    area = Column(String, nullable=True)
    city = Column(String, nullable=True)
    is_24x7 = Column(Boolean, default=False)
    verified = Column(Boolean, default=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    notes = Column(String, nullable=True)