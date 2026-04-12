from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.auth import RegisterIn, LoginIn, ProfileUpdateIn
from app.services.auth_service import register_user, login_user, update_profile, _user_out

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    return register_user(payload, db)


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    return login_user(payload, db)


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return _user_out(current_user)


@router.patch("/me")
def update_me(
    payload: ProfileUpdateIn,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"user": update_profile(current_user, payload, db)}
