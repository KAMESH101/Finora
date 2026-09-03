from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import CreditCard, Transaction, User
from services.credit_limit_service import check_credit_transaction, get_credit_card
from services.payment_service import execute_idempotent, to_amount
from utils.deps import get_current_user

router = APIRouter()


class AmountRequest(BaseModel):
    amount: float


class ChargeRequest(BaseModel):
    amount: float
    merchant: str = "Card Purchase"
    idempotency_key: str


def _summary(card: CreditCard) -> dict:
    available = card.credit_limit - card.current_balance
    utilization = (card.current_balance / card.credit_limit * 100) if card.credit_limit else 0
    return {
        "credit_limit": float(card.credit_limit),
        "current_balance": float(card.current_balance),
        "available_credit": float(available),
        "utilization_pct": float(utilization),
        "card_number_masked": card.card_number_masked,
    }


@router.get("/summary")
def credit_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        card = get_credit_card(db, user.id)
    except LookupError:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return _summary(card)


@router.post("/check")
def credit_check(
    body: AmountRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    amount = to_amount(body.amount)
    try:
        result = check_credit_transaction(db, user.id, amount)
    except LookupError:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return result.as_dict()


@router.post("/charge")
def credit_charge(
    body: ChargeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    amount = to_amount(body.amount)

    def work(db: Session):
        try:
            check = check_credit_transaction(db, user.id, amount)
        except LookupError:
            raise HTTPException(status_code=404, detail="Credit card not found")

        if not check.allowed:
            raise HTTPException(status_code=422, detail={"status": "blocked", **check.as_dict()})

        card = get_credit_card(db, user.id)
        card.current_balance += amount
        db.add(card)

        txn = Transaction(
            user_id=user.id,
            source="credit_card",
            type="debit",
            amount=amount,
            merchant=body.merchant,
            category="Card Purchase",
            status="success",
            payment_method="card",
        )
        db.add(txn)
        db.flush()

        return {"status": "success", "warning": check.warning, **_summary(card)}

    return execute_idempotent(
        db, user.id, body.idempotency_key, "creditcard.charge", body.model_dump(), work
    )
