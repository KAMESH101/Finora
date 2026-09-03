import re
from datetime import datetime, timedelta

import bcrypt
from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.db_models import PinAuth

PIN_PATTERN = re.compile(r"^\d{4,6}$")
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def _hash(pin: str) -> str:
    return bcrypt.hashpw(pin.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def setup_pin(db: Session, user_id: int, pin: str, confirm_pin: str) -> None:
    if not PIN_PATTERN.match(pin):
        raise HTTPException(status_code=422, detail="PIN must be 4-6 digits")
    if pin != confirm_pin:
        raise HTTPException(status_code=422, detail="PINs do not match")

    existing = db.query(PinAuth).filter(PinAuth.user_id == user_id).first()
    if existing:
        existing.pin_hash = _hash(pin)
        existing.failed_attempts = 0
        existing.locked_until = None
    else:
        db.add(PinAuth(user_id=user_id, pin_hash=_hash(pin)))
    db.commit()


def pin_status(db: Session, user_id: int) -> bool:
    return db.query(PinAuth).filter(PinAuth.user_id == user_id).first() is not None


def verify_pin_or_raise(db: Session, user_id: int, pin: str) -> None:
    record = db.query(PinAuth).filter(PinAuth.user_id == user_id).first()
    if not record:
        raise HTTPException(status_code=400, detail="No transaction PIN has been set up yet")

    now = datetime.utcnow()
    if record.locked_until and record.locked_until > now:
        retry_after = int((record.locked_until - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"Too many incorrect PIN attempts. Try again in {retry_after} seconds.",
        )

    if not bcrypt.checkpw(pin.encode("utf-8"), record.pin_hash.encode("utf-8")):
        record.failed_attempts += 1
        if record.failed_attempts >= MAX_ATTEMPTS:
            record.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
            record.failed_attempts = 0
        db.add(record)
        db.commit()
        raise HTTPException(status_code=401, detail="Incorrect PIN. Please try again.")

    record.failed_attempts = 0
    record.locked_until = None
    db.add(record)
    db.commit()
