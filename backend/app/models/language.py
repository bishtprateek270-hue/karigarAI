from pydantic import BaseModel, Field
from typing import Optional, List


class TranslationRequest(BaseModel):
    title: Optional[str] = Field(None, example="Handcrafted Terracotta Pot")
    description: Optional[str] = Field(None, example="Authentic natural clay pot with rich red polish.")
    category: Optional[str] = Field(None, example="Home & Living > Pottery")
    tags: Optional[List[str]] = Field(None, example=["terracotta", "pottery", "handcrafted"])
    target_language: str = Field("hi", example="hi", description="Target language code ('hi' for Hindi, 'en' for English)")


class TranslationResponse(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    target_language: str = "hi"
