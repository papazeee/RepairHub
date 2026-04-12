from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories import notification_repository


def get_admin_notifications(admin: User, db: Session) -> dict:
    notifs = notification_repository.get_for_admin(admin.id, db, limit=50)
    unread_count = notification_repository.count_unread_for_admin(admin.id, db)
    return {
        "unread_count": unread_count,
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifs
        ],
    }


def mark_all_read(admin: User, db: Session) -> dict:
    notification_repository.mark_all_read_for_admin(admin.id, db)
    db.commit()
    return {"message": "All notifications marked as read."}


def mark_one_read(notification_id: int, admin: User, db: Session) -> dict:
    notif = notification_repository.get_by_id_for_admin(notification_id, admin.id, db)
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read."}
