from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, File, UploadFile, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import init_db, get_db
from app.db.models import User
from app.api.v1 import api_v1_router
from app.api.deps import get_current_user

# Models
from app.models.product import ProductAnalysisResponse
from app.models.price import PriceRequest, PriceResponse
from app.models.auth import UserRegisterRequest, UserLoginRequest, TokenResponse
from app.models.product_db import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductDBResponse,
)
from app.models.language import TranslationRequest, TranslationResponse

# Services & Router Functions
from app.utils.file_validation import validate_image_file
from app.services.ai_service import ai_service
from app.services.price_service import price_service
from app.services.language_service import language_service
from app.api.v1.auth import register_user, login_user
from app.api.v1.products_crud import (
    create_product,
    list_user_products,
    get_user_product,
    update_user_product,
    delete_user_product,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KarigarAI Backend API Service",
    lifespan=lifespan,
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Explicit CORS Exception Handlers to prevent browser CORS fetch blocks on 401/422/500 errors
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    headers = getattr(exc, "headers", None) or {}
    headers["Access-Control-Allow-Origin"] = "*"
    headers["Access-Control-Allow-Credentials"] = "true"
    headers["Access-Control-Allow-Methods"] = "*"
    headers["Access-Control-Allow-Headers"] = "*"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# Include API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


# --- Core & Legacy Endpoints ---


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "running"}


@app.post(
    "/analyze-product",
    response_model=ProductAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Product Analysis"],
    summary="Analyze Product Image & Generate Catalog",
)
async def analyze_product_root(file: UploadFile = File(...)):
    file_bytes = await validate_image_file(file)
    result = await ai_service.analyze_product_image(
        file_bytes=file_bytes,
        filename=file.filename or "",
        content_type=file.content_type or "",
    )
    return ProductAnalysisResponse(
        status=result["status"],
        filename=result["filename"],
        content_type=result["content_type"],
        analysis=result["analysis"],
        catalog=result["catalog"],
        image_url=result.get("image_url"),
    )


@app.post(
    "/generate-catalog",
    status_code=status.HTTP_200_OK,
    tags=["Catalog Generation"],
    summary="Generate Catalog from Artisan Confirmed Attributes",
)
async def generate_catalog_root(confirmed_attributes: dict):
    from app.services.catalog_service import catalog_service
    catalog = await catalog_service.generate_catalog(confirmed_attributes)
    return {"status": "success", "catalog": catalog}



@app.post(
    "/suggest-price",
    response_model=PriceResponse,
    status_code=status.HTTP_200_OK,
    tags=["Pricing Engine"],
    summary="Suggest Product Price",
)
async def suggest_price_root(request: PriceRequest):
    return price_service.calculate_price(request)


# --- Phase 8 Multilingual Translation Endpoint ---


@app.post(
    "/translate",
    response_model=TranslationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Multilingual Translation"],
    summary="Translate Catalog Content",
)
async def translate_root(req: TranslationRequest):
    translated = await language_service.translate_catalog(
        title=req.title,
        description=req.description,
        category=req.category,
        tags=req.tags,
        product_name=req.product_name,
        material=req.material,
        craft_type=req.craft_type,
        target_language=req.target_language,
    )
    return TranslationResponse(
        title=translated.get("title"),
        description=translated.get("description"),
        category=translated.get("category"),
        tags=translated.get("tags"),
        product_name=translated.get("product_name"),
        material=translated.get("material"),
        craft_type=translated.get("craft_type"),
        target_language=req.target_language,
    )


# --- Phase 6 Authentication & Product CRUD Endpoints ---


@app.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
def register_root(req: UserRegisterRequest, db: Session = Depends(get_db)):
    return register_user(req, db)


@app.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"],
)
def login_root(req: UserLoginRequest, db: Session = Depends(get_db)):
    return login_user(req, db)


@app.post(
    "/products",
    response_model=ProductDBResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Product CRUD"],
)
def create_product_root(
    req: ProductCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_product(req, current_user, db)


@app.get(
    "/products",
    response_model=List[ProductDBResponse],
    status_code=status.HTTP_200_OK,
    tags=["Product CRUD"],
)
def list_products_root(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_user_products(current_user, db)


@app.get(
    "/products/{product_id}",
    response_model=ProductDBResponse,
    status_code=status.HTTP_200_OK,
    tags=["Product CRUD"],
)
def get_product_root(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_product(product_id, current_user, db)


@app.put(
    "/products/{product_id}",
    response_model=ProductDBResponse,
    status_code=status.HTTP_200_OK,
    tags=["Product CRUD"],
)
def update_product_root(
    product_id: int,
    req: ProductUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_user_product(product_id, req, current_user, db)


@app.delete(
    "/products/{product_id}",
    status_code=status.HTTP_200_OK,
    tags=["Product CRUD"],
)
def delete_product_root(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return delete_user_product(product_id, current_user, db)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
