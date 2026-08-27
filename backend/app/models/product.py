from pydantic import BaseModel, Field
from typing import List, Optional


class ProductVisionDetails(BaseModel):

    product_type: str = Field(
        ...,
        description="Type of product (e.g. Terracotta Pot, Wooden Sculpture, Handwoven Shawl)",
        example="Terracotta Pot",
    )
    material: str = Field(
        ...,
        description="Primary material used (e.g. Clay, Silk, Brass, Teak Wood)",
        example="Clay",
    )
    primary_color: str = Field(
        ...,
        description="Dominant color or palette (e.g. Terracotta Red, Royal Blue, Natural Earth)",
        example="Terracotta Red",
    )
    craft_type: str = Field(
        ...,
        description="Artisan craft technique (e.g. Handmade Pottery, Handloom Weaving, Metal Carving)",
        example="Handmade Pottery",
    )
    style: str = Field(
        ...,
        description="Artistic or cultural style (e.g. Traditional Indian, Modern Minimalist, Folk Art)",
        example="Traditional Indian",
    )


class ProductCatalogDetails(BaseModel):
    title: str = Field(
        ...,
        description="Concise, marketplace-friendly product title",
        example="Handcrafted Terracotta Clay Pot - Traditional Indian Style",
    )
    description: str = Field(
        ...,
        description="Professional, grounded product description",
        example="Exquisite handcrafted terracotta pot made from natural clay. Features rich terracotta red tone with traditional Indian pottery design.",
    )
    category: str = Field(
        ...,
        description="E-commerce marketplace category path",
        example="Home & Living > Home Decor > Pottery & Vases",
    )
    tags: List[str] = Field(
        ...,
        description="5 to 10 relevant search tags",
        example=["terracotta", "pottery", "handcrafted", "clay pot", "home decor", "indian craft"],
    )
    seo_keywords: List[str] = Field(
        ...,
        description="High-intent SEO keywords and phrases",
        example=["handcrafted terracotta pot", "indian clay pottery", "artisan home decor"],
    )


class ProductAnalysisResponse(BaseModel):
    status: str = Field(..., example="success")
    filename: str = Field(..., example="craft_item.jpg")
    content_type: str = Field(..., example="image/jpeg")
    analysis: ProductVisionDetails
    catalog: ProductCatalogDetails
    image_url: Optional[str] = Field(None, example="https://res.cloudinary.com/demo/image/upload/sample.jpg")

