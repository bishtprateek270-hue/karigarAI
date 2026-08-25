from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="Ramesh Kumar")
    email: EmailStr = Field(..., example="ramesh@example.com")
    password: str = Field(..., min_length=6, max_length=100, example="securepassword123")


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., example="ramesh@example.com")
    password: str = Field(..., example="securepassword123")


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
