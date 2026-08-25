from fastapi import APIRouter, status
from app.models.price import PriceRequest, PriceResponse
from app.services.price_service import price_service

router = APIRouter()


@router.post(
    "/suggest-price",
    response_model=PriceResponse,
    status_code=status.HTTP_200_OK,
    summary="Suggest Product Price",
    description="Calculates rule-based, explainable price recommendations (minimum, recommended, maximum) for artisan crafts.",
)
async def suggest_price_endpoint(request: PriceRequest):
    return price_service.calculate_price(request)
