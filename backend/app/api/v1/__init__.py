from fastapi import APIRouter
from app.api.v1.product import router as product_router
from app.api.v1.price import router as price_router

api_v1_router = APIRouter()
api_v1_router.include_router(product_router, tags=["Product Analysis"])
api_v1_router.include_router(price_router, tags=["Pricing Engine"])
