import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    PROJECT_NAME: str = "KarigarAI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Image Upload Validation Rules
    ALLOWED_IMAGE_EXTENSIONS: set[str] = {".jpg", ".jpeg", ".png"}
    ALLOWED_CONTENT_TYPES: set[str] = {"image/jpeg", "image/jpg", "image/png"}
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit

    # Vision AI API Keys and Config
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Database & Authentication Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./karigarai.db").strip()
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-karigarai-jwt-key-2026").strip()
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256").strip()
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Cloudinary Cloud Object Storage Configuration
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "").strip()
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "").strip()

    # Resend API Key Configuration
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "").strip()

    # SMTP Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "").strip()
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "").strip()
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "").strip()
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", os.getenv("SMTP_USER", "noreply@karigarai.app")).strip()
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "KarigarAI Support").strip()


settings = Settings()
