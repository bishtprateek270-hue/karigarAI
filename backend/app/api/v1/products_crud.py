import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Product
from app.api.deps import get_current_user
from app.models.product_db import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductDBResponse,
)

router = APIRouter()


def _format_tags_input(tags_val) -> str | None:
    if tags_val is None:
        return None
    if isinstance(tags_val, list):
        return json.dumps([str(t).strip() for t in tags_val])
    return json.dumps([t.strip() for t in str(tags_val).split(",") if t.strip()])


def _parse_tags_output(tags_str: str | None) -> List[str]:
    if not tags_str:
        return []
    try:
        parsed = json.loads(tags_str)
        if isinstance(parsed, list):
            return [str(t) for t in parsed]
        return [str(tags_str)]
    except Exception:
        return [t.strip() for t in tags_str.split(",") if t.strip()]


def _to_product_response(product: Product) -> ProductDBResponse:
    return ProductDBResponse(
        id=product.id,
        user_id=product.user_id,
        image_url=product.image_url,
        title=product.title,
        description=product.description,
        category=product.category,
        material=product.material,
        craft_type=product.craft_type,
        tags=_parse_tags_output(product.tags),
        suggested_price=product.suggested_price,
        status=product.status,
        created_at=product.created_at,
    )


@router.post(
    "/products",
    response_model=ProductDBResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create product",
    description="Creates a new product catalog entry for the authenticated user.",
)
def create_product(
    req: ProductCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_product = Product(
        user_id=current_user.id,
        title=req.title.strip(),
        description=req.description,
        category=req.category,
        material=req.material,
        craft_type=req.craft_type,
        tags=_format_tags_input(req.tags),
        suggested_price=req.suggested_price,
        image_url=req.image_url,
        status=req.status or "active",
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return _to_product_response(db_product)


@router.get(
    "/products",
    response_model=List[ProductDBResponse],
    status_code=status.HTTP_200_OK,
    summary="List user products",
    description="Returns all products created by and belonging to the authenticated user.",
)
def list_user_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    products = (
        db.query(Product)
        .filter(Product.user_id == current_user.id)
        .order_by(Product.created_at.desc())
        .all()
    )
    return [_to_product_response(p) for p in products]


@router.get(
    "/products/{product_id}",
    response_model=ProductDBResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user product by ID",
    description="Retrieves a specific product belonging to the authenticated user.",
)
def get_user_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.user_id == current_user.id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )

    return _to_product_response(product)


@router.put(
    "/products/{product_id}",
    response_model=ProductDBResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user product",
    description="Updates product details for a product belonging to the authenticated user.",
)
def update_user_product(
    product_id: int,
    req: ProductUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.user_id == current_user.id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )

    update_data = req.model_dump(exclude_unset=True)
    if "tags" in update_data:
        update_data["tags"] = _format_tags_input(update_data["tags"])

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return _to_product_response(product)


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete user product",
    description="Deletes a product belonging to the authenticated user.",
)
def delete_user_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.user_id == current_user.id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )

    db.delete(product)
    db.commit()

    return {"status": "success", "message": f"Product {product_id} deleted successfully."}
