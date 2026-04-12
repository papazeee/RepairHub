from pydantic import BaseModel, field_validator
from typing import Optional


class RepairRequestIn(BaseModel):
    device_type: str
    brand: str
    model: str
    problem_description: str

    @field_validator("device_type")
    @classmethod
    def valid_device(cls, v):
        allowed = ["phone", "laptop", "tablet", "desktop", "other"]
        if v.lower() not in allowed:
            raise ValueError(f"device_type must be one of: {', '.join(allowed)}")
        return v.lower()

    @field_validator("problem_description")
    @classmethod
    def desc_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Problem description cannot be blank")
        return v.strip()


class StatusUpdateIn(BaseModel):
    status: str
    admin_notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def valid_status(cls, v):
        allowed = ["pending", "in_progress", "completed", "cancelled"]
        if v not in allowed:
            raise ValueError(f"status must be one of: {', '.join(allowed)}")
        return v


class RepairRequestOut(BaseModel):
    id: int
    user_id: int
    device_type: str
    brand: str
    model: str
    problem_description: str
    status: str
    admin_notes: Optional[str]
    created_at: str
    updated_at: str
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None

    class Config:
        from_attributes = True
