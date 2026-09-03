import re

# Ordered: more specific patterns first.
_PATTERNS = [
    ("credit_score", re.compile(r"credit\s*score", re.I)),
    ("credit_card_summary", re.compile(r"credit\s*(card|limit)|available\s*credit|utili[sz]ation", re.I)),
    ("recent_recipients", re.compile(r"(who|whom).*(sen[dt]|pay|transfer)|recent\s*recipient", re.I)),
    ("spending_this_month", re.compile(r"spen[dt].*(month|this month)|how much.*spen[dt]", re.I)),
    ("recent_transactions", re.compile(r"(recent|last|latest)\s*transaction|transaction\s*history|show.*transaction", re.I)),
    ("wallet_balance", re.compile(r"(wallet\s*)?balance|how much.*(have|left)|available\s*balance", re.I)),
    ("profile", re.compile(r"my\s*(name|email|profile|account)", re.I)),
]


def classify_query(query: str) -> str | None:
    for intent, pattern in _PATTERNS:
        if pattern.search(query):
            return intent
    return None
