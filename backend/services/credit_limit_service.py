import os
from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy.orm import Session

from models.db_models import CreditCard

WARNING_THRESHOLD_PCT = float(os.environ.get("CREDIT_UTILIZATION_WARNING_THRESHOLD", 80))


@dataclass
class CreditCheckResult:
    allowed: bool
    blocked_reason: str | None
    warning: bool
    credit_limit: float
    current_balance: float
    available_credit: float
    utilization_after_pct: float
    threshold_pct: float

    def as_dict(self) -> dict:
        return {
            "allowed": self.allowed,
            "blocked_reason": self.blocked_reason,
            "warning": self.warning,
            "credit_limit": self.credit_limit,
            "current_balance": self.current_balance,
            "available_credit": self.available_credit,
            "utilization_after_pct": self.utilization_after_pct,
            "threshold_pct": self.threshold_pct,
        }


def get_credit_card(db: Session, user_id: int) -> CreditCard:
    card = db.query(CreditCard).filter(CreditCard.user_id == user_id).first()
    if not card:
        raise LookupError("Credit card not found")
    return card


def check_credit_transaction(db: Session, user_id: int, amount) -> CreditCheckResult:
    card = get_credit_card(db, user_id)
    amount = Decimal(str(amount))

    available_before = card.credit_limit - card.current_balance
    projected_balance = card.current_balance + amount
    utilization_after = (projected_balance / card.credit_limit * 100) if card.credit_limit else Decimal(0)

    if amount > available_before:
        return CreditCheckResult(
            allowed=False,
            blocked_reason="exceeds_limit",
            warning=False,
            credit_limit=float(card.credit_limit),
            current_balance=float(card.current_balance),
            available_credit=float(available_before),
            utilization_after_pct=float(utilization_after),
            threshold_pct=WARNING_THRESHOLD_PCT,
        )

    warning = float(utilization_after) >= WARNING_THRESHOLD_PCT
    return CreditCheckResult(
        allowed=True,
        blocked_reason=None,
        warning=warning,
        credit_limit=float(card.credit_limit),
        current_balance=float(card.current_balance),
        available_credit=float(available_before),
        utilization_after_pct=float(utilization_after),
        threshold_pct=WARNING_THRESHOLD_PCT,
    )
