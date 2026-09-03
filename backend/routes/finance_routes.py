from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import json, os
from utils.auth_utils import decode_token

router = APIRouter()
FINANCE_FILE = "data/finance.json"

class Transaction(BaseModel):
    category: str
    amount: float
    type: str
    note: str = ""

def read_finance():
    if not os.path.exists(FINANCE_FILE):
        return []
    with open(FINANCE_FILE, "r") as f:
        return json.load(f)

def write_finance(data):
    with open(FINANCE_FILE, "w") as f:
        json.dump(data, f, indent=4)

def get_user_from_token(token: str):
    user_data = decode_token(token, expected_type="access")
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_data

@router.get("/transactions")
def get_transactions(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = get_user_from_token(token)

    data = read_finance()
    user_txns = [t for t in data if t["mobile"] == user["mobile"]]
    return {"transactions": user_txns}

@router.post("/add-transaction")
def add_transaction(txn: Transaction, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = get_user_from_token(token)

    data = read_finance()
    new_txn = txn.dict()
    new_txn["mobile"] = user["mobile"]
    data.append(new_txn)
    write_finance(data)
    return {"message": "Transaction added successfully"}
