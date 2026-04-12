from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    password: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be blank")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v):
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?\d{7,15}$", cleaned):
            raise ValueError("Enter a valid phone number")
        return v.strip()


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdateIn(BaseModel):
    name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_trimmed(cls, v):
        if v is None:
            return v
        v = v.strip()
        if not v:
          raise ValueError("Name cannot be blank")
        return v

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if v is None:
            return v
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("current_password")
    @classmethod
    def current_password_trimmed(cls, v):
        if v is None:
            return v
        return v.strip()


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: str
    is_admin: bool
    created_at: str

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
