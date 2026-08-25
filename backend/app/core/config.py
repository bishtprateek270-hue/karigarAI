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


settings = Settings()
