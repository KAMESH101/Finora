"""One-time, re-runnable migration from the flat-file JSON store to SQLite.

Run from the backend/ directory:
    python -m scripts.migrate_to_sqlite
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, SessionLocal, engine
from models.db_models import CreditCard, Contact, User, Wallet

USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "users.json")

# Seeded from frontend/src/mockUsers.ts MOCK_USERS, plus two duplicate-name
# contacts so the voice-payment "multiple matches" flow is demoable.
SEED_CONTACTS = [
    {"name": "Rahul Sharma", "mobile": "9876543210", "upi_id": "rahul.sharma@okaxis", "avatar": "👨"},
    {"name": "Priya Patel", "mobile": "9876543211", "upi_id": "priya.patel@paytm", "avatar": "👩"},
    {"name": "Amit Kumar", "mobile": "9876543212", "upi_id": "amit.kumar@ybl", "avatar": "👨‍💼"},
    {"name": "Sneha Singh", "mobile": "9876543213", "upi_id": "sneha.singh@okicici", "avatar": "👩‍💼"},
    {"name": "Vikram Reddy", "mobile": "9876543214", "upi_id": "vikram.reddy@paytm", "avatar": "🧑"},
    {"name": "Anjali Desai", "mobile": "9876543215", "upi_id": "anjali.desai@okaxis", "avatar": "👩‍🦰"},
    {"name": "Rajesh Gupta", "mobile": "9876543216", "upi_id": "rajesh.gupta@ybl", "avatar": "👨‍🦳"},
    {"name": "Kavya Nair", "mobile": "9876543217", "upi_id": "kavya.nair@paytm", "avatar": "👩‍🎓"},
    {"name": "Dinesh Kumar", "mobile": "9876500001", "upi_id": "dinesh.kumar@okaxis", "avatar": "👨"},
    {"name": "Dinesh Rao", "mobile": "9876500002", "upi_id": "dinesh.rao@paytm", "avatar": "🧑‍💼"},
]


def read_json_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def migrate():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        json_users = read_json_users()
        migrated = 0
        wallets_created = 0
        cards_created = 0
        contacts_created = 0

        for u in json_users:
            existing = db.query(User).filter(User.mobile == u["mobile"]).first()
            if existing:
                user = existing
            else:
                user = User(
                    mobile=u["mobile"],
                    name=u["name"],
                    email=u["email"],
                    password_hash=u["password"],
                )
                db.add(user)
                db.flush()
                migrated += 1

            if not db.query(Wallet).filter(Wallet.user_id == user.id).first():
                db.add(Wallet(user_id=user.id, balance=10000))
                wallets_created += 1

            if not db.query(CreditCard).filter(CreditCard.user_id == user.id).first():
                db.add(
                    CreditCard(
                        user_id=user.id,
                        card_number_masked="**** **** **** 4821",
                        credit_limit=100000,
                        current_balance=42000,
                    )
                )
                cards_created += 1

            if not db.query(Contact).filter(Contact.owner_user_id == user.id).first():
                for c in SEED_CONTACTS:
                    db.add(
                        Contact(
                            owner_user_id=user.id,
                            name=c["name"],
                            mobile=c["mobile"],
                            upi_id=c["upi_id"],
                            avatar=c["avatar"],
                        )
                    )
                    contacts_created += 1

        db.commit()
        print(
            f"Migration complete: {migrated} users migrated, "
            f"{wallets_created} wallets created, {cards_created} credit cards created, "
            f"{contacts_created} contacts seeded."
        )
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
