from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    products = relationship("Product", back_populates="owner", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_url = Column(Text, nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    material = Column(String(100), nullable=True)
    craft_type = Column(String(100), nullable=True)
    tags = Column(Text, nullable=True)

    # Multilingual (Hindi) Content Storage
    title_hi = Column(String(255), nullable=True)
    description_hi = Column(Text, nullable=True)
    category_hi = Column(String(100), nullable=True)
    tags_hi = Column(Text, nullable=True)

    suggested_price = Column(Float, nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    owner = relationship("User", back_populates="products")
