"""
Run this once to create the default admin account.
Usage: python seed_admin.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, init_db
from app.models.user import User
from app.core.security import hash_password

EMAIL = os.getenv("ADMIN_EMAIL", "admin@repairhub.com")
PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@1234")
NAME = "Admin"

def seed():
    init_db()
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == EMAIL).first()
        if existing:
            print(f"Admin already exists: {EMAIL}")
            return
        admin = User(
            name=NAME,
            email=EMAIL,
            phone="000-000-0000",
            address="Admin Office",
            password_hash=hash_password(PASSWORD),
            is_admin=True,
        )
        db.add(admin)
        db.commit()
        print(f"✅ Admin created: {EMAIL} / {PASSWORD}")
        print("   Change this password")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
