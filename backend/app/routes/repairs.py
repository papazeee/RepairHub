from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.schemas.repair import RepairRequestIn, StatusUpdateIn
from app.services import repair_service

router = APIRouter(prefix="/api", tags=["Repairs"])


# ── Customer ──────────────────────────────────────────
@router.post("/repair-requests")
def create_request(
    payload: RepairRequestIn,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return repair_service.create_repair_request(payload, current_user, db)


@router.get("/repair-requests/my")
def my_requests(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return repair_service.get_user_requests(current_user, db)


# ── Admin ──────────────────────────────────────────────
@router.get("/admin/requests")
def all_requests(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    requests = repair_service.get_all_requests(db)
    return {"total": len(requests), "requests": requests}


@router.patch("/admin/requests/{request_id}/status")
def update_status(
    request_id: int,
    payload: StatusUpdateIn,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return repair_service.update_request_status(request_id, payload, db)


@router.get("/admin/stats")
def dashboard_stats(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return repair_service.get_dashboard_stats(db)


@router.get("/admin/users")
def all_users(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from app.repositories import user_repository
    from app.services.auth_service import _user_out
    users = user_repository.get_all_ordered_by_created(db)
    return {"total": len(users), "users": [_user_out(u) for u in users]}
