from fastapi import APIRouter, status
from app.models.language import TranslationRequest, TranslationResponse
from app.services.language_service import language_service

router = APIRouter()


@router.post(
    "/translate",
    response_model=TranslationResponse,
    status_code=status.HTTP_200_OK,
    summary="Translate Catalog Content",
    description="Translates catalog title, description, category, and tags into Hindi or English.",
)
async def translate_catalog_endpoint(req: TranslationRequest):
    translated = await language_service.translate_catalog(
        title=req.title,
        description=req.description,
        category=req.category,
        tags=req.tags,
        target_language=req.target_language,
    )

    return TranslationResponse(
        title=translated.get("title"),
        description=translated.get("description"),
        category=translated.get("category"),
        tags=translated.get("tags"),
        target_language=req.target_language,
    )
