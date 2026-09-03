from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional, List
import json, os
from utils.auth_utils import decode_token
from services.geosmart_service import compute_geo_summary, find_hotspots, generate_insights, detect_anomalies

router = APIRouter()
FINANCE_FILE = "data/finance.json"

def read_finance():
    if not os.path.exists(FINANCE_FILE):
        return []
    with open(FINANCE_FILE, "r") as f:
        try:
            return json.load(f)
        except Exception:
            return []

def get_user_from_token(token: str):
    user_data = decode_token(token, expected_type="access")
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_data

@router.get("/transactions")
def get_geo_transactions(
    category: Optional[str] = Query(None),
    paymentMethod: Optional[str] = Query(None),
    authorization: str = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = get_user_from_token(token)

    data = read_finance()
    user_txns = [t for t in data if t.get("mobile") == user["mobile"]]

    if category and category != "all":
        user_txns = [t for t in user_txns if t.get("category") == category]
    if paymentMethod and paymentMethod != "all":
        user_txns = [t for t in user_txns if t.get("paymentMethod") == paymentMethod]

    return {"transactions": user_txns}

@router.get("/summary")
def get_geo_summary(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = get_user_from_token(token)

    data = read_finance()
    user_txns = [t for t in data if t.get("mobile") == user["mobile"]]
    summary = compute_geo_summary(user_txns)
    return summary

@router.get("/hotspots")
def get_geo_hotspots(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = get_user_from_token(token)

    data = read_finance()
    user_txns = [t for t in data if t.get("mobile") == user["mobile"]]
    return {"hotspots": find_hotspots(user_txns)}

@router.get("/insights")
def get_geo_insights(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    user = get_user_from_token(token)

    data = read_finance()
    user_txns = [t for t in data if t.get("mobile") == user["mobile"]]
    return {"insights": generate_insights(user_txns)}
