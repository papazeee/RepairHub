import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url: str) -> str:
    # Railway/Postgres providers sometimes expose postgres:// which SQLAlchemy won't parse.
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def _parse_origins(raw_origins: str) -> list[str]:
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

class Settings:
    APP_NAME: str = "RepairHub API"
    VERSION: str = "1.0.0"

    # Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-insecure-secret-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24"))

    # Database — set DATABASE_URL in .env for PostgreSQL, leave blank for SQLite fallback
    DATABASE_URL: str = _normalize_database_url(
        os.getenv(
            "DATABASE_URL",
            "sqlite:///./repairhub.db"           # local dev fallback
        )
    )

    # CORS
    ALLOWED_ORIGINS: list[str] = _parse_origins(
        os.getenv(
            "ALLOWED_ORIGINS",
            "http://127.0.0.1:5500,http://localhost:5500,http://localhost:3000"
        )
    )

settings = Settings()
