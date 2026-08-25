import os
from fastapi import HTTPException, status, UploadFile
from app.core.config import settings


async def validate_image_file(file: UploadFile) -> bytes:
    """
    Validates uploaded product image:
    1. Checks filename extension (.jpg, .jpeg, .png)
    2. Checks Content-Type (image/jpeg, image/jpg, image/png)
    3. Enforces file size limit (10 MB max)
    """
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    if not ext or ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Only .jpg, .jpeg, and .png images are allowed.",
        )

    content_type = file.content_type or ""
    if content_type.lower() not in settings.ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type '{content_type}'. Only .jpg, .jpeg, and .png images are allowed.",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        max_mb = int(settings.MAX_FILE_SIZE_BYTES / (1024 * 1024))
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {max_mb}MB.",
        )


    return content
