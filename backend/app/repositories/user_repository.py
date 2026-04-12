from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.user import User


def get_by_email(email: str, db: Session) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_by_id(user_id: int, db: Session) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_all_ordered_by_created(db: Session) -> List[User]:
    return db.query(User).order_by(User.created_at.desc()).all()


def get_admins(db: Session) -> List[User]:
    return db.query(User).filter(User.is_admin == True).all()  # noqa: E712


def count_customers(db: Session) -> int:
    return db.query(User).filter(User.is_admin == False).count()  # noqa: E712
