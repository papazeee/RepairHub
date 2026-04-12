from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class RepairRequest(Base):
    __tablename__ = "repair_requests"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_type         = Column(String(50), nullable=False)
    brand               = Column(String(80), nullable=False)
    model               = Column(String(120), nullable=False)
    problem_description = Column(Text, nullable=False)
    status              = Column(String(40), default="pending", nullable=False)
    admin_notes         = Column(Text, nullable=True)
    created_at          = Column(DateTime, default=datetime.utcnow)
    updated_at          = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="repair_requests")

    # Allowed statuses
    STATUSES = ["pending", "in_progress", "completed", "cancelled"]
