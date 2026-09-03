from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import User
from services.pin_service import pin_status, setup_pin
from utils.deps import get_current_user

router = APIRouter()


class SetupPinRequest(BaseModel):
    pin: str
    confirm_pin: str


@router.get("/status")
def get_pin_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"configured": pin_status(db, user.id)}


@router.post("/setup")
def create_pin(
    body: SetupPinRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    setup_pin(db, user.id, body.pin, body.confirm_pin)
    return {"message": "Transaction PIN set successfully"}
