from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from app.models.repair_request import RepairRequest


def get_by_id(request_id: int, db: Session) -> Optional[RepairRequest]:
    return db.query(RepairRequest).filter(RepairRequest.id == request_id).first()


def get_by_user_id(user_id: int, db: Session) -> List[RepairRequest]:
    return (
        db.query(RepairRequest)
        .filter(RepairRequest.user_id == user_id)
        .order_by(RepairRequest.created_at.desc())
        .all()
    )


def get_all_with_user(db: Session) -> List[RepairRequest]:
    return (
        db.query(RepairRequest)
        .options(joinedload(RepairRequest.user))
        .order_by(RepairRequest.created_at.desc())
        .all()
    )


def count_all(db: Session) -> int:
    return db.query(RepairRequest).count()


def count_by_status(status: str, db: Session) -> int:
    return db.query(RepairRequest).filter(RepairRequest.status == status).count()
