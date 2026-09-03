from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import User
from services.ai.ai_orchestrator import get_history, handle_chat_message
from utils.deps import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


@router.post("/chat")
def chat(body: ChatRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return handle_chat_message(db, user, body.message, body.conversation_id)


@router.get("/history")
def history(
    conversation_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return {"messages": get_history(db, user.id, conversation_id)}
