from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Union


class ProductCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, example="Handcrafted Terracotta Pot")
    description: Optional[str] = Field(None, example="Authentic clay pot with red polish.")
    category: Optional[str] = Field(None, example="Home Decor > Pottery")
    material: Optional[str] = Field(None, example="Clay")
    craft_type: Optional[str] = Field(None, example="Pottery")
    tags: Optional[Union[List[str], str]] = Field(None, example=["terracotta", "pottery", "clay"])

    # Hindi Multilingual Fields
    title_hi: Optional[str] = Field(None, example="हस्तनिर्मित मिट्टी का बर्तन")
    description_hi: Optional[str] = Field(None, example="लाल पॉलिश के साथ प्रामाणिक मिट्टी का बर्तन।")
    category_hi: Optional[str] = Field(None, example="होम सजावट > मिट्टी के बर्तन")
    tags_hi: Optional[Union[List[str], str]] = Field(None, example=["मिट्टी", "हस्तशिल्प"])

    suggested_price: Optional[float] = Field(None, ge=0, example=1050.0)
    image_url: Optional[str] = Field(None, example="https://example.com/images/pot.jpg")
    status: Optional[str] = Field("active", example="active")


class ProductUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    material: Optional[str] = None
    craft_type: Optional[str] = None
    tags: Optional[Union[List[str], str]] = None

    title_hi: Optional[str] = None
    description_hi: Optional[str] = None
    category_hi: Optional[str] = None
    tags_hi: Optional[Union[List[str], str]] = None

    suggested_price: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = None
    status: Optional[str] = None


class ProductDBResponse(BaseModel):
    id: int
    user_id: int
    image_url: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    material: Optional[str] = None
    craft_type: Optional[str] = None
    tags: Optional[List[str]] = None

    title_hi: Optional[str] = None
    description_hi: Optional[str] = None
    category_hi: Optional[str] = None
    tags_hi: Optional[List[str]] = None

    suggested_price: Optional[float] = None
    status: str
    created_at: datetime
    owner_phone: Optional[str] = None

    class Config:
        from_attributes = True
