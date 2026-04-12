import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = "RepairHub API"
    VERSION: str = "1.0.0"

    # Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-insecure-secret-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24"))

    # Database — set DATABASE_URL in .env for PostgreSQL, leave blank for SQLite fallback
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./repair_shop.db"           # local dev fallback
    )

    # CORS
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS",
        "http://127.0.0.1:5500,http://localhost:5500,http://localhost:3000"
    ).split(",")

settings = Settings()
