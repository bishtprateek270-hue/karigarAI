from fastapi import APIRouter, File, UploadFile, status
from app.models.product import ProductAnalysisResponse
from app.utils.file_validation import validate_image_file
from app.services.ai_service import ai_service

router = APIRouter()


@router.post(
    "/analyze-product",
    response_model=ProductAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Product Image",
    description="Upload a product image (.jpg, .jpeg, .png) up to 10MB for Vision AI analysis.",
)
async def analyze_product_endpoint(file: UploadFile = File(...)):
    file_bytes = await validate_image_file(file)

    result = await ai_service.analyze_product_image(
        file_bytes=file_bytes,
        filename=file.filename or "",
        content_type=file.content_type or "",
    )

    return ProductAnalysisResponse(
        status=result["status"],
        filename=result["filename"],
        content_type=result["content_type"],
        analysis=result["analysis"],
    )
