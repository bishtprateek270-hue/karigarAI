from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any


class PriceRequest(BaseModel):
    material_cost: float = Field(
        ...,
        ge=0,
        description="Cost of raw materials in local currency (e.g., INR)",
        example=300.0,
    )
    making_time_hours: float = Field(
        ...,
        ge=0,
        description="Time spent creating the product in hours",
        example=5.0,
    )
    hourly_rate: float = Field(
        ...,
        ge=0,
        description="Hourly labor rate of the artisan",
        example=100.0,
    )
    product_size: str = Field(
        ...,
        description="Size of the product (small, medium, large, extra_large)",
        example="medium",
    )
    craft_category: str = Field(
        ...,
        description="Craft category (e.g., pottery, woodwork, textiles, metalwork, jewelry, general)",
        example="pottery",
    )
    profit_margin: Optional[float] = Field(
        default=None,
        ge=0,
        le=200,
        description="Optional desired profit margin percentage (e.g. 25.0 for 25%)",
        example=25.0,
    )

    @field_validator("product_size")
    @classmethod
    def validate_product_size(cls, v: str) -> str:
        valid_sizes = {"small", "medium", "large", "extra_large", "xl"}
        clean_v = v.lower().strip()
        if clean_v not in valid_sizes:
            raise ValueError(f"Invalid product_size '{v}'. Must be one of: {', '.join(sorted(valid_sizes))}")
        return clean_v


class PriceResponse(BaseModel):
    production_cost: float = Field(..., description="Calculated direct production cost", example=800.0)
    minimum_price: float = Field(..., description="Minimum viable selling price", example=950.0)
    recommended_price: float = Field(..., description="Recommended selling price", example=1050.0)
    maximum_price: float = Field(..., description="Maximum premium selling price", example=1200.0)
    currency: str = Field(default="INR", example="INR")
    breakdown: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Explainable breakdown of costs, multipliers, and profit margins",
    )
