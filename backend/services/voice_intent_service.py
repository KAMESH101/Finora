import re

AMOUNT_TO_RECIPIENT = re.compile(
    r"(?:send|pay|transfer)\s+(?:₹|rs\.?|inr|rupees?\s*)?(\d+(?:\.\d+)?)\s*(?:rupees?|₹|inr)?\s*(?:to|for)\s+([a-zA-Z][a-zA-Z\s]*)",
    re.IGNORECASE,
)


def parse_payment_command(text: str) -> dict:
    match = AMOUNT_TO_RECIPIENT.search(text.strip())
    if not match:
        return {"intent": "UNKNOWN", "amount": None, "currency": "INR", "recipient_name": None, "confidence": 0.0}

    amount = float(match.group(1))
    recipient = match.group(2).strip().rstrip(".").strip()

    if amount <= 0 or not recipient:
        return {"intent": "UNKNOWN", "amount": None, "currency": "INR", "recipient_name": None, "confidence": 0.0}

    return {
        "intent": "SEND_PAYMENT",
        "amount": amount,
        "currency": "INR",
        "recipient_name": recipient,
        "confidence": 0.9,
    }
