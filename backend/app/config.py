from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017/evobin_db"
    DB_NAME: str = "evobin_db"
    JWT_SECRET: str = "evobin_secret_jwt_key_super_secure_production_2026"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

