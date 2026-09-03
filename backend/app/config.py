from functools import lru_cache
from cryptography.fernet import Fernet
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Security
    SECRET_KEY: str = "dev-only-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Fernet key used to encrypt sensitive fields at rest (incident descriptions,
    # guardian backups, etc). If not provided, one is generated at startup so the
    # app still runs locally -- but for real deployments this MUST be set and
    # persisted, or previously encrypted data becomes unreadable on restart.
    ENCRYPTION_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite:///./antara.db"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Storage
    UPLOAD_DIR: str = "./uploads"

    APP_NAME: str = "ANTARA API"
    APP_VERSION: str = "1.0.0"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def encryption_key(self) -> bytes:
        if self.ENCRYPTION_KEY:
            return self.ENCRYPTION_KEY.encode()
        # Fallback for local/dev only -- generated once per process.
        return _DEV_FALLBACK_KEY


_DEV_FALLBACK_KEY = Fernet.generate_key()


@lru_cache
def get_settings() -> Settings:
    return Settings()