from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Employee Self-Service Portal API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = Field(default="dev-only-change-me-please-at-least-32-characters")
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    cookie_secure: bool = False
    cors_origins: str = "http://localhost:3000"
    frontend_url: str = "http://localhost:3000"
    database_url: str = "postgresql+asyncpg://ess:ess_local_password@localhost:5432/ess"
    redis_url: str = "redis://localhost:6379/0"
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=("../../.env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [part.strip() for part in self.cors_origins.split(",") if part.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
