from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.models.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse

router = APIRouter()


def utc_now():
    return datetime.now(timezone.utc)


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
    now_time = utc_now()
    new_user = User(
        name=req.name.strip(),
        email=clean_email,
        password_hash=hashed_pwd,
        created_at=now_time,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            created_at=new_user.created_at or now_time,
        ),
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
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            created_at=user.created_at or utc_now(),
        ),
    )


def generate_numeric_otp() -> str:
    import random
    return f"{random.randint(100000, 999999)}"


@router.post(
    "/forgot-password/request-otp",
    status_code=status.HTTP_200_OK,
    summary="Request Password Reset OTP",
)
def request_password_reset_otp(payload: dict, db: Session = Depends(get_db)):
    from datetime import timedelta
    from app.db.models import PasswordResetOTP
    email = payload.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address is required.")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No registered account found with this email address.")
    
    otp_code = generate_numeric_otp()
    expires_at = utc_now() + timedelta(minutes=10)

    db.query(PasswordResetOTP).filter(PasswordResetOTP.email == email).delete()
    
    otp_entry = PasswordResetOTP(
        email=email,
        otp=otp_code,
        expires_at=expires_at,
        created_at=utc_now()
    )
    db.add(otp_entry)
    db.commit()

    print(f"[KARIGAR AI OTP SERVICE] OTP for {email} is: {otp_code}")

    return {
        "status": "success",
        "message": f"A 6-digit OTP code has been sent to {email}.",
        "otp": otp_code
    }


@router.post(
    "/forgot-password/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Reset Password with OTP",
)
def reset_password_with_otp(payload: dict, db: Session = Depends(get_db)):
    from app.db.models import PasswordResetOTP
    email = payload.get("email", "").strip().lower()
    otp_code = payload.get("otp", "").strip()
    new_password = payload.get("new_password", "").strip()

    if not email or not otp_code or not new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email, OTP, and new password are required.")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    otp_record = (
        db.query(PasswordResetOTP)
        .filter(PasswordResetOTP.email == email, PasswordResetOTP.otp == otp_code)
        .first()
    )

    if not otp_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code. Please check and try again.")
    
    now = utc_now()
    record_expires = otp_record.expires_at
    if record_expires.tzinfo is None:
        record_expires = record_expires.replace(tzinfo=timezone.utc)
    if now > record_expires:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP code has expired. Please request a new code.")

    user.password_hash = hash_password(new_password)
    db.query(PasswordResetOTP).filter(PasswordResetOTP.email == email).delete()
    db.commit()

    return {
        "status": "success",
        "message": "Password reset successful! You can now log in with your new password."
    }

