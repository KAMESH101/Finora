"""Structured financial-fact lookups — the ONLY source of numeric financial
data given to the LLM. Every function takes user_id from the authenticated
JWT (never from request body or LLM output) and scopes every query by it."""
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from models.db_models import Contact, CreditCard, Transaction, User, Wallet


def get_wallet_balance(db: Session, user_id: int) -> dict:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        return {"available": False}
    return {"available": True, "balance": float(wallet.balance), "currency": "INR"}


def get_recent_transactions(db: Session, user_id: int, limit: int = 5) -> dict:
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
        .all()
    )
    if not txns:
        return {"available": False}
    return {
        "available": True,
        "transactions": [
            {
                "merchant": t.merchant,
                "amount": float(t.amount),
                "type": t.type,
                "category": t.category,
                "date": t.created_at.isoformat() if t.created_at else None,
                "source": t.source,
            }
            for t in txns
        ],
    }


def get_spending_this_month(db: Session, user_id: int) -> dict:
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    txns = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "debit",
            Transaction.created_at >= start_of_month,
        )
        .all()
    )
    total = sum(float(t.amount) for t in txns)
    return {"available": True, "total_spent": total, "transaction_count": len(txns), "period": "this month"}


def get_credit_summary(db: Session, user_id: int) -> dict:
    card = db.query(CreditCard).filter(CreditCard.user_id == user_id).first()
    if not card:
        return {"available": False}
    available = card.credit_limit - card.current_balance
    utilization = (card.current_balance / card.credit_limit * 100) if card.credit_limit else 0
    return {
        "available": True,
        "credit_limit": float(card.credit_limit),
        "current_balance": float(card.current_balance),
        "available_credit": float(available),
        "utilization_pct": float(utilization),
    }


def get_credit_score(db: Session, user_id: int) -> dict:
    card = db.query(CreditCard).filter(CreditCard.user_id == user_id).first()
    if not card:
        return {"available": False}
    utilization = (card.current_balance / card.credit_limit) if card.credit_limit else 0
    # Deterministic formula from real account data (no bureau available):
    # lower utilization -> higher score, baseline 650, capped to [300, 900].
    score = 900 - int(utilization * 400)
    score = max(300, min(900, score))
    rating = "Excellent" if score >= 750 else "Good" if score >= 650 else "Fair" if score >= 550 else "Poor"
    return {"available": True, "score": score, "rating": rating, "utilization_pct": float(utilization * 100)}


def get_recent_recipients(db: Session, user_id: int, limit: int = 5) -> dict:
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.counterparty_contact_id.isnot(None))
        .order_by(Transaction.created_at.desc())
        .limit(limit)
        .all()
    )
    if not txns:
        return {"available": False}
    contact_ids = [t.counterparty_contact_id for t in txns]
    contacts = {c.id: c.name for c in db.query(Contact).filter(Contact.id.in_(contact_ids)).all()}
    return {
        "available": True,
        "recipients": [
            {
                "name": contacts.get(t.counterparty_contact_id, "Unknown"),
                "amount": float(t.amount),
                "date": t.created_at.isoformat() if t.created_at else None,
            }
            for t in txns
        ],
    }


def get_profile(db: Session, user_id: int) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"available": False}
    return {"available": True, "name": user.name, "email": user.email, "mobile": user.mobile}
