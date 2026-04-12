from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.services import notification_service

router = APIRouter(prefix="/api/admin/notifications", tags=["Notifications"])


@router.get("")
def get_notifications(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    return notification_service.get_admin_notifications(admin, db)


@router.patch("/read-all")
def mark_all_read(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    return notification_service.mark_all_read(admin, db)


@router.patch("/{notification_id}/read")
def mark_one_read(notification_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    return notification_service.mark_one_read(notification_id, admin, db)
