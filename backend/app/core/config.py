import os

class Settings:
    PROJECT_NAME: str = "KarigarAI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Image Upload Validation Rules
    ALLOWED_IMAGE_EXTENSIONS: set[str] = {".jpg", ".jpeg", ".png"}
    ALLOWED_CONTENT_TYPES: set[str] = {"image/jpeg", "image/jpg", "image/png"}
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit

settings = Settings()
