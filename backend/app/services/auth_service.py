from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.repositories import user_repository
from app.schemas.auth import RegisterIn, LoginIn, UserOut, TokenOut, ProfileUpdateIn
from app.core.security import hash_password, verify_password, create_access_token


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        address=user.address,
        is_admin=user.is_admin,
        created_at=user.created_at.isoformat(),
    )


def register_user(payload: RegisterIn, db: Session) -> TokenOut:
    if user_repository.get_by_email(payload.email, db):
        raise HTTPException(status_code=400, detail="Email already registered.")
    user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        phone=payload.phone.strip(),
        address=payload.address.strip(),
        password_hash=hash_password(payload.password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"user_id": user.id, "email": user.email})
    return TokenOut(access_token=token, user=_user_out(user))


def login_user(payload: LoginIn, db: Session) -> TokenOut:
    user = user_repository.get_by_email(payload.email.lower().strip(), db)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token({"user_id": user.id, "email": user.email})
    print("this is the token", token)
    return TokenOut(access_token=token, user=_user_out(user))


def update_profile(user: User, payload: ProfileUpdateIn, db: Session) -> UserOut:
    if payload.name is None and payload.new_password is None:
        raise HTTPException(status_code=400, detail="Nothing to update.")

    if payload.name is not None:
        user.name = payload.name

    if payload.new_password is not None:
        if not payload.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to change password.")
        if not verify_password(payload.current_password, user.password_hash):
            raise HTTPException(status_code=401, detail="Current password is incorrect.")
        user.password_hash = hash_password(payload.new_password)

    db.commit()
    db.refresh(user)
    return _user_out(user)
