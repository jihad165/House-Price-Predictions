"""
Application settings loaded from environment variables / .env file.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "House Price Prediction API"
    env: str = "development"
    debug: bool = True

    # Comma separated string in .env, parsed into a list below
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_path: str = "models/house_price.pkl"
    locations_path: str = "models/locations.json"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", protected_namespaces=("settings_",)
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance (read once per process)."""
    return Settings()
