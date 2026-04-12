from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.notification import Notification


def get_for_admin(admin_id: int, db: Session, limit: int = 50) -> List[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.admin_id == admin_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def count_unread_for_admin(admin_id: int, db: Session) -> int:
    return db.query(Notification).filter(
        Notification.admin_id == admin_id,
        Notification.is_read == False,  # noqa: E712
    ).count()


def mark_all_read_for_admin(admin_id: int, db: Session) -> None:
    db.query(Notification).filter(
        Notification.admin_id == admin_id,
        Notification.is_read == False,  # noqa: E712
    ).update({"is_read": True})


def get_by_id_for_admin(notification_id: int, admin_id: int, db: Session) -> Optional[Notification]:
    return db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.admin_id == admin_id,
    ).first()
