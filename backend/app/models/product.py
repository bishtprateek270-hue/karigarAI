from pydantic import BaseModel, Field


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


class ProductAnalysisResponse(BaseModel):
    status: str = Field(..., example="success")
    filename: str = Field(..., example="craft_item.jpg")
    content_type: str = Field(..., example="image/jpeg")
    analysis: ProductVisionDetails
