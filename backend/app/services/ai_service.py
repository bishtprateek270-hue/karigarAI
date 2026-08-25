"""
AI Service module for KarigarAI.
Delegates image analysis to VisionService.
"""
from typing import Dict, Any
from app.services.vision_service import vision_service


class AIService:
    async def analyze_product_image(
        self, file_bytes: bytes, filename: str, content_type: str
    ) -> Dict[str, Any]:
        """
        Analyzes the uploaded craft/artisan product image using Vision AI.
        """
        analysis_data = await vision_service.analyze_image(
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
        )

        return {
            "status": "success",
            "filename": filename,
            "content_type": content_type,
            "analysis": analysis_data,
        }


ai_service = AIService()
