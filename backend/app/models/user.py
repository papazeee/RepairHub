from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(120), nullable=False)
    email         = Column(String(180), unique=True, index=True, nullable=False)
    phone         = Column(String(40), nullable=False)
    address       = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin      = Column(Boolean, default=False, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)

    repair_requests = relationship("RepairRequest", back_populates="user", cascade="all,delete")
    notifications   = relationship("Notification", back_populates="admin", cascade="all,delete")
