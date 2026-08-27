import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("karigar_ai.storage")


class StorageService:
    def __init__(self):
        self.is_configured = bool(
            settings.CLOUDINARY_CLOUD_NAME
            and settings.CLOUDINARY_API_KEY
            and settings.CLOUDINARY_API_SECRET
        )
        if self.is_configured:
            try:
                import cloudinary
                import cloudinary.uploader

                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                    api_key=settings.CLOUDINARY_API_KEY,
                    api_secret=settings.CLOUDINARY_API_SECRET,
                    secure=True,
                )
                logger.info("Cloudinary Object Storage initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Cloudinary: {e}")
                self.is_configured = False

    async def upload_image(self, file_bytes: bytes, filename: str) -> Optional[str]:
        """
        Uploads image file bytes to Cloudinary and returns secure HTTPS CDN URL.
        """
        if not self.is_configured:
            return None

        try:
            import cloudinary.uploader

            result = cloudinary.uploader.upload(
                file_bytes,
                folder="karigarai_products",
                resource_type="image",
            )
            secure_url = result.get("secure_url") or result.get("url")
            logger.info(f"Image uploaded to Cloudinary CDN: {secure_url}")
            return secure_url
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}")
            return None


storage_service = StorageService()
