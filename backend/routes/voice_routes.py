from fastapi import APIRouter, Depends
from pydantic import BaseModel

from models.db_models import User
from services.voice_intent_service import parse_payment_command
from utils.deps import get_current_user

router = APIRouter()


class ParseIntentRequest(BaseModel):
    transcript: str


@router.post("/parse-intent")
def parse_intent(body: ParseIntentRequest, user: User = Depends(get_current_user)):
    return parse_payment_command(body.transcript)
