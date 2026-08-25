from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.models.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Registers a new artisan/user with hashed password and returns access token.",
)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    clean_email = req.email.lower().strip()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    hashed_pwd = hash_password(req.password)
    new_user = User(
        name=req.name.strip(),
        email=clean_email,
        password_hash=hashed_pwd,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login user",
    description="Authenticates user credentials and returns JWT access token.",
)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    clean_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )
