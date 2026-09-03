from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import Contact, Transaction, User, Wallet
from services.payment_service import execute_idempotent, to_amount
from services.pin_service import verify_pin_or_raise
from services.face_verification_service import validate_face_token
from utils.deps import get_current_user

router = APIRouter()


class AdjustRequest(BaseModel):
    merchant: str
    category: str | None = None
    amount: float
    type: str  # 'debit' | 'credit'
    payment_method: str = "wallet"
    idempotency_key: str


class PayRequest(BaseModel):
    contact_id: int
    amount: float
    pin: str
    idempotency_key: str
    channel: str = "voice"
    face_token: str | None = None


def _wallet_for(db: Session, user_id: int) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet


def _serialize_txn(t: Transaction) -> dict:
    return {
        "id": t.reference_id,
        "date": t.created_at.isoformat() if t.created_at else datetime.utcnow().isoformat(),
        "merchant": t.merchant,
        "category": t.category,
        "amount": float(t.amount),
        "type": t.type,
        "status": t.status,
        "paymentMethod": t.payment_method,
    }


@router.get("/summary")
def wallet_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = _wallet_for(db, user.id)
    return {"balance": float(wallet.balance), "currency": "INR"}


@router.get("/transactions")
def wallet_transactions(
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id, Transaction.source == "wallet")
        .order_by(Transaction.created_at.desc())
        .limit(limit)
        .all()
    )
    return {"transactions": [_serialize_txn(t) for t in txns]}


@router.post("/adjust")
def wallet_adjust(
    body: AdjustRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.type not in ("debit", "credit"):
        raise HTTPException(status_code=422, detail="type must be 'debit' or 'credit'")
    amount = to_amount(body.amount)

    def work(db: Session):
        wallet = _wallet_for(db, user.id)
        if body.type == "debit" and wallet.balance < amount:
            raise HTTPException(status_code=422, detail="Insufficient balance")

        if body.type == "debit":
            wallet.balance -= amount
        else:
            wallet.balance += amount

        txn = Transaction(
            user_id=user.id,
            source="wallet",
            type=body.type,
            amount=amount,
            merchant=body.merchant,
            category=body.category or "Others",
            status="success",
            payment_method=body.payment_method,
        )
        db.add(txn)
        db.add(wallet)
        db.flush()

        return {
            "status": "success",
            "transaction": _serialize_txn(txn),
            "new_balance": float(wallet.balance),
        }

    return execute_idempotent(
        db, user.id, body.idempotency_key, "wallet.adjust", body.model_dump(), work
    )


@router.post("/pay")
def wallet_pay(
    body: PayRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    amount = to_amount(body.amount)

    def work(db: Session):
        contact = (
            db.query(Contact)
            .filter(Contact.id == body.contact_id, Contact.owner_user_id == user.id)
            .first()
        )
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        # Voice payments require a genuine, backend-issued face-verification
        # token (never a client-asserted boolean) before anything else runs.
        if body.channel == "voice":
            validate_face_token(user.id, body.face_token)

        # PIN verification and money movement happen atomically in the same
        # transaction — never "verify then trust a flag" from the client.
        verify_pin_or_raise(db, user.id, body.pin)

        wallet = _wallet_for(db, user.id)
        if wallet.balance < amount:
            raise HTTPException(status_code=422, detail="Insufficient balance")

        wallet.balance -= amount
        db.add(wallet)

        txn = Transaction(
            user_id=user.id,
            source="wallet",
            type="debit",
            amount=amount,
            merchant=contact.name,
            category="Transfer",
            status="success",
            payment_method=body.channel,
            counterparty_contact_id=contact.id,
        )
        db.add(txn)
        db.flush()

        return {
            "status": "success",
            "reference_id": txn.reference_id,
            "amount": float(amount),
            "recipient": {"id": contact.id, "name": contact.name, "avatar": contact.avatar},
            "new_balance": float(wallet.balance),
            "created_at": txn.created_at.isoformat(),
        }

    return execute_idempotent(
        db, user.id, body.idempotency_key, "wallet.pay", body.model_dump(), work
    )
