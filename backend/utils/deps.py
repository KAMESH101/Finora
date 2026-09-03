from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import User
from utils.auth_utils import decode_token


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ", 1)[1]
    payload = decode_token(token, expected_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = None
    user_id = payload.get("user_id")
    if user_id is not None:
        user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        mobile = payload.get("mobile")
        if mobile:
            user = db.query(User).filter(User.mobile == mobile).first()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user
