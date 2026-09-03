import hashlib
import json
from decimal import Decimal

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from fastapi import HTTPException
from models.db_models import IdempotencyKey


def _hash_payload(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True, default=str).encode()).hexdigest()


def execute_idempotent(db: Session, user_id: int, idempotency_key: str, endpoint: str, payload: dict, work_fn):
    """Runs work_fn(db) exactly once per idempotency_key. Replays the cached
    response on a duplicate call instead of re-executing the financial mutation.
    """
    request_hash = _hash_payload(payload)

    existing = db.query(IdempotencyKey).filter(IdempotencyKey.key == idempotency_key).first()
    if existing:
        if existing.status == "completed":
            return json.loads(existing.response_json)
        raise HTTPException(
            status_code=409,
            detail="Payment already in progress or previously failed for this idempotency key — please retry with a new key.",
        )

    record = IdempotencyKey(
        key=idempotency_key,
        user_id=user_id,
        endpoint=endpoint,
        request_hash=request_hash,
        status="processing",
    )
    db.add(record)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        existing = db.query(IdempotencyKey).filter(IdempotencyKey.key == idempotency_key).first()
        if existing and existing.status == "completed":
            return json.loads(existing.response_json)
        raise HTTPException(status_code=409, detail="Duplicate request already being processed.")

    try:
        result = work_fn(db)
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    record.status = "completed"
    record.response_json = json.dumps(result, default=str)
    db.add(record)
    db.commit()
    return result


def to_amount(value) -> Decimal:
    try:
        amount = Decimal(str(value))
    except Exception:
        raise HTTPException(status_code=422, detail="Amount must be a valid number")
    if amount <= 0:
        raise HTTPException(status_code=422, detail="Amount must be a positive value")
    return amount
