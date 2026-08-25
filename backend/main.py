from fastapi import FastAPI, File, UploadFile, status
from app.core.config import settings
from app.api.v1 import api_v1_router
from app.models.product import ProductAnalysisResponse
from app.utils.file_validation import validate_image_file
from app.services.ai_service import ai_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KarigarAI Backend API Service",
)

# Include API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "running"}


@app.post(
    "/analyze-product",
    response_model=ProductAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Product Analysis"],
    summary="Analyze Product Image",
    description="Upload a product image (.jpg, .jpeg, .png) up to 10MB.",
)
async def analyze_product_root(file: UploadFile = File(...)):
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
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
