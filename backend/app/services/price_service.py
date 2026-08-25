import logging
from typing import Dict, Any
from fastapi import HTTPException, status
from app.models.price import PriceRequest, PriceResponse

logger = logging.getLogger("karigar_ai.price_service")


class PriceService:
    # Size Multipliers reflecting handling, storage, and material scale overhead
    SIZE_MULTIPLIERS: Dict[str, float] = {
        "small": 1.00,
        "medium": 1.10,
        "large": 1.25,
        "extra_large": 1.40,
        "xl": 1.40,
    }

    # Craft Complexity Multipliers reflecting specialized skill overhead
    CRAFT_MULTIPLIERS: Dict[str, float] = {
        "pottery": 1.05,
        "textiles": 1.10,
        "handloom": 1.10,
        "woodwork": 1.15,
        "wood": 1.15,
        "metalwork": 1.20,
        "brass": 1.20,
        "jewelry": 1.25,
        "general": 1.00,
    }

    def calculate_price(self, req: PriceRequest) -> PriceResponse:
        """
        Rule-based, explainable price recommendation engine.
        Validates inputs, applies labor/overhead multipliers, and outputs price tiers.
        """
        # 1. Input Validation Safeguards
        if req.material_cost < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Material cost cannot be negative.",
            )
        if req.making_time_hours < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Making time cannot be negative.",
            )
        if req.hourly_rate < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hourly rate cannot be negative.",
            )

        # 2. Direct Production & Labor Cost Calculation
        labor_cost = req.making_time_hours * req.hourly_rate
        direct_cost = req.material_cost + labor_cost

        # 3. Multiplier Lookup
        size_key = req.product_size.lower().strip()
        size_mult = self.SIZE_MULTIPLIERS.get(size_key, 1.00)

        craft_key = req.craft_category.lower().strip()
        craft_mult = 1.00
        for key, mult in self.CRAFT_MULTIPLIERS.items():
            if key in craft_key:
                craft_mult = mult
                break

        # 4. Adjusted Production Base Cost
        adjusted_production_cost = round(direct_cost * size_mult * craft_mult, 2)

        # 5. Profit Margin Calculation
        target_margin_pct = req.profit_margin if req.profit_margin is not None else 25.0
        target_margin_frac = target_margin_pct / 100.0

        min_margin_frac = max(0.15, target_margin_frac * 0.70)
        rec_margin_frac = target_margin_frac
        max_margin_frac = target_margin_frac * 1.40 + 0.10

        min_price = round(adjusted_production_cost * (1.0 + min_margin_frac), 2)
        rec_price = round(adjusted_production_cost * (1.0 + rec_margin_frac), 2)
        max_price = round(adjusted_production_cost * (1.0 + max_margin_frac), 2)

        # 6. Structured Explainable Response
        breakdown = {
            "material_cost": round(req.material_cost, 2),
            "labor_cost": round(labor_cost, 2),
            "direct_production_cost": round(direct_cost, 2),
            "size_multiplier": size_mult,
            "craft_complexity_multiplier": craft_mult,
            "adjusted_production_cost": adjusted_production_cost,
            "applied_profit_margin_percent": round(target_margin_pct, 2),
        }

        return PriceResponse(
            production_cost=adjusted_production_cost,
            minimum_price=min_price,
            recommended_price=rec_price,
            maximum_price=max_price,
            currency="INR",
            breakdown=breakdown,
        )


price_service = PriceService()
