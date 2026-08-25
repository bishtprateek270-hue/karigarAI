"""
AI Service module for KarigarAI.
Orchestrates image analysis (VisionService) and catalog generation (CatalogService).
"""
from typing import Dict, Any
from app.services.vision_service import vision_service
from app.services.catalog_service import catalog_service


class AIService:
    async def analyze_product_image(
        self, file_bytes: bytes, filename: str, content_type: str
    ) -> Dict[str, Any]:
        """
        1. Analyzes product image using Vision AI (VisionService).
        2. Automatically generates marketplace catalog entry (CatalogService) using Vision AI output.
        """
        vision_analysis = await vision_service.analyze_image(
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
        )

        catalog_details = await catalog_service.generate_catalog(vision_analysis)

        return {
            "status": "success",
            "filename": filename,
            "content_type": content_type,
            "analysis": vision_analysis,
            "catalog": catalog_details,
        }


ai_service = AIService()
