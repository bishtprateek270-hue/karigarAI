from fastapi import APIRouter
from app.api.v1.product import router as product_analysis_router
from app.api.v1.price import router as price_router
from app.api.v1.auth import router as auth_router
from app.api.v1.products_crud import router as products_crud_router
from app.api.v1.language import router as language_router

api_v1_router = APIRouter()

api_v1_router.include_router(product_analysis_router, tags=["Product Analysis"])
api_v1_router.include_router(price_router, tags=["Pricing Engine"])
api_v1_router.include_router(auth_router, tags=["Authentication"])
api_v1_router.include_router(products_crud_router, tags=["Product CRUD"])
api_v1_router.include_router(language_router, tags=["Multilingual Translation"])
