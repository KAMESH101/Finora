import json
import re

AMOUNT_TO_RECIPIENT = re.compile(
    r"(?:send|pay|transfer)\s+(?:₹\s*|rs\.?\s*|inr\s*|rupees?\s*)?(\d+(?:\.\d+)?)\s*(?:rupees?|₹|inr)?\s*(?:to|for)\s+([a-zA-Z][a-zA-Z\s]*)",
    re.IGNORECASE,
)

_UNKNOWN = {"intent": "UNKNOWN", "amount": None, "currency": "INR", "recipient_name": None, "confidence": 0.0}

_LLM_EXTRACT_PROMPT = (
    "Extract a payment instruction from this transcript. Respond with ONLY a JSON object, no other text: "
    '{{"amount": <number or null>, "recipient_name": "<name or null>"}}. '
    'If this is not a "send/pay money to someone" instruction, return {{"amount": null, "recipient_name": null}}. '
    "Transcript: {text}"
)


def _regex_parse(text: str) -> dict | None:
    match = AMOUNT_TO_RECIPIENT.search(text.strip())
    if not match:
        return None
    amount = float(match.group(1))
    recipient = match.group(2).strip().rstrip(".").strip()
    if amount <= 0 or not recipient:
        return None
    return {"amount": amount, "recipient_name": recipient}


def _llm_parse(text: str) -> dict | None:
    from services.ai.llm_provider import get_llm_response

    prompt = _LLM_EXTRACT_PROMPT.format(text=text)
    reply, provider = get_llm_response(prompt, "You extract structured data. Reply with JSON only.")
    if provider == "unavailable":
        return None
    try:
        # Models sometimes wrap JSON in prose or code fences — pull out the object.
        start, end = reply.index("{"), reply.rindex("}") + 1
        data = json.loads(reply[start:end])
        amount = data.get("amount")
        recipient = data.get("recipient_name")
        if amount and recipient and float(amount) > 0:
            return {"amount": float(amount), "recipient_name": str(recipient).strip()}
    except (ValueError, TypeError, json.JSONDecodeError):
        pass
    return None


def parse_payment_command(text: str) -> dict:
    """Extracts {amount, recipient_name} from a voice/typed command. Regex
    first (fast, deterministic); falls back to the LLM only to extract these
    two fields from phrasing regex can't catch — the LLM's output is never
    used for anything beyond that (the route layer independently re-validates
    both fields regardless of source, and the LLM never authorizes payment)."""
    parsed = _regex_parse(text) or _llm_parse(text)
    if not parsed:
        return dict(_UNKNOWN)

    return {
        "intent": "SEND_PAYMENT",
        "amount": parsed["amount"],
        "currency": "INR",
        "recipient_name": parsed["recipient_name"],
        "confidence": 0.9,
    }
