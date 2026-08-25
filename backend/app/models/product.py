from pydantic import BaseModel, Field
from typing import Optional


class ProductAnalysisResponse(BaseModel):
    status: str = Field(..., example="success")
    filename: str = Field(..., example="craft_item.jpg")
    content_type: str = Field(..., example="image/jpeg")
    message: Optional[str] = Field(
        default="Image uploaded successfully. Ready for AI processing.",
        example="Image uploaded successfully. Ready for AI processing.",
    )
