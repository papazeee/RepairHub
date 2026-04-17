from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from app.models.repair_request import RepairRequest
from app.models.user import User
from app.models.notification import Notification
from app.repositories import repair_repository, user_repository
from app.schemas.repair import RepairRequestIn, StatusUpdateIn, RepairRequestOut
from app.core.security import hash_password


GUEST_EMAIL = "guest@repairhub.local"


def _get_guest_user(db: Session) -> User:
    guest = user_repository.get_by_email(GUEST_EMAIL, db)
    if guest:
        return guest

    guest = User(
        name="Guest",
        email=GUEST_EMAIL,
        phone="0000000000",
        address="Online booking request",
        password_hash=hash_password("guest-account"),
        is_admin=False,
    )
    db.add(guest)
    db.flush()
    return guest


def _format(r: RepairRequest, include_customer: bool = False) -> dict:
    out = {
        "id": r.id,
        "user_id": r.user_id,
        "device_type": r.device_type,
        "brand": r.brand,
        "model": r.model,
        "problem_description": r.problem_description,
        "status": r.status,
        "admin_notes": r.admin_notes,
        "created_at": r.created_at.isoformat(),
        "updated_at": r.updated_at.isoformat() if r.updated_at else r.created_at.isoformat(),
    }
    if include_customer and r.user:
        out["customer_name"] = r.user.name
        out["customer_email"] = r.user.email
    return out


def create_repair_request(payload: RepairRequestIn, user: User | None, db: Session) -> dict:
    request_user = user or _get_guest_user(db)
    rr = RepairRequest(
        user_id=request_user.id,
        device_type=payload.device_type,
        brand=payload.brand,
        model=payload.model,
        problem_description=payload.problem_description,
        status="pending",
    )
    db.add(rr)
    db.flush()  # get rr.id before commit

    # Notify all admins
    admins = user_repository.get_admins(db)
    for admin in admins:
        notif = Notification(
            admin_id=admin.id,
            title="New Repair Request",
            message=f"{request_user.name} submitted a repair for {payload.brand} {payload.model} ({payload.device_type}). Request #{rr.id}.",
        )
        db.add(notif)

    db.commit()
    db.refresh(rr)
    return _format(rr)


def get_user_requests(user: User, db: Session) -> list:
    reqs = repair_repository.get_by_user_id(user.id, db)
    return [_format(r) for r in reqs]


def get_all_requests(db: Session) -> list:
    reqs = repair_repository.get_all_with_user(db)
    return [_format(r, include_customer=True) for r in reqs]


def update_request_status(request_id: int, payload: StatusUpdateIn, db: Session) -> dict:
    rr = repair_repository.get_by_id(request_id, db)
    if not rr:
        raise HTTPException(status_code=404, detail="Repair request not found.")
    rr.status = payload.status
    rr.updated_at = datetime.utcnow()
    if payload.admin_notes is not None:
        rr.admin_notes = payload.admin_notes
    db.commit()
    db.refresh(rr)
    return _format(rr)


def get_dashboard_stats(db: Session) -> dict:
    total_users = user_repository.count_customers(db)
    total_requests = repair_repository.count_all(db)
    pending = repair_repository.count_by_status("pending", db)
    in_progress = repair_repository.count_by_status("in_progress", db)
    completed = repair_repository.count_by_status("completed", db)
    cancelled = repair_repository.count_by_status("cancelled", db)
    return {
        "total_users": total_users,
        "total_requests": total_requests,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "cancelled": cancelled,
    }
