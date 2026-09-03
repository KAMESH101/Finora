import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import CreditCard, User, Wallet
from models.user_model import SignupModel, LoginModel, RefreshModel
from utils.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter()

# Simple in-memory login rate limiting: mobile -> {"failures": int, "locked_until": float}
_login_attempts: dict[str, dict] = {}
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_SECONDS = 5 * 60


@router.post("/signup")
def signup(user: SignupModel, db: Session = Depends(get_db)):
    if db.query(User).filter(User.mobile == user.mobile).first():
        raise HTTPException(status_code=400, detail="User already exists")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already in use")

    new_user = User(
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        password_hash=hash_password(user.password),
    )
    db.add(new_user)
    db.flush()

    db.add(Wallet(user_id=new_user.id, balance=10000))
    db.add(
        CreditCard(
            user_id=new_user.id,
            card_number_masked="**** **** **** 4821",
            credit_limit=100000,
            current_balance=0,
        )
    )
    db.commit()

    return {"message": "Signup successful"}


@router.post("/login")
def login(credentials: LoginModel, db: Session = Depends(get_db)):
    now = time.time()
    attempt = _login_attempts.get(credentials.mobile)
    if attempt and attempt["locked_until"] > now:
        retry_after = int(attempt["locked_until"] - now)
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed attempts. Try again in {retry_after} seconds.",
        )

    user = db.query(User).filter(User.mobile == credentials.mobile).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        attempt = _login_attempts.setdefault(credentials.mobile, {"failures": 0, "locked_until": 0})
        attempt["failures"] += 1
        if attempt["failures"] >= MAX_LOGIN_ATTEMPTS:
            attempt["locked_until"] = now + LOCKOUT_SECONDS
            attempt["failures"] = 0
        raise HTTPException(status_code=401, detail="Invalid credentials")

    _login_attempts.pop(credentials.mobile, None)

    token_payload = {"mobile": user.mobile, "name": user.name, "user_id": user.id}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    return {
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {"name": user.name, "mobile": user.mobile, "email": user.email},
    }


@router.post("/refresh")
def refresh_token(request: RefreshModel, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token, expected_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = None
    if payload.get("user_id") is not None:
        user = db.query(User).filter(User.id == payload["user_id"]).first()
    if user is None and payload.get("mobile"):
        user = db.query(User).filter(User.mobile == payload["mobile"]).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    new_access = create_access_token({"mobile": user.mobile, "name": user.name, "user_id": user.id})
    return {"access_token": new_access, "message": "Access token refreshed successfully"}
