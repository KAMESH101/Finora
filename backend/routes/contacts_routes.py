from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import Contact, User
from utils.deps import get_current_user

router = APIRouter()


class CreateContactRequest(BaseModel):
    name: str
    mobile: str | None = None
    upi_id: str | None = None
    avatar: str | None = None


def _serialize(c: Contact) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "mobile": c.mobile,
        "mobile_last4": c.mobile[-4:] if c.mobile else None,
        "upi_id": c.upi_id,
        "avatar": c.avatar or "👤",
    }


@router.get("")
def list_contacts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    contacts = (
        db.query(Contact)
        .filter(Contact.owner_user_id == user.id)
        .order_by(Contact.name)
        .all()
    )
    return {"contacts": [_serialize(c) for c in contacts]}


@router.get("/search")
def search_contacts(
    q: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    q_norm = q.strip().lower()
    contacts = (
        db.query(Contact)
        .filter(Contact.owner_user_id == user.id)
        .all()
    )
    matches = [c for c in contacts if q_norm in c.name.lower()]
    return {"matches": [_serialize(c) for c in matches]}


@router.post("")
def create_contact(
    body: CreateContactRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    contact = Contact(
        owner_user_id=user.id,
        name=body.name.strip(),
        mobile=body.mobile,
        upi_id=body.upi_id,
        avatar=body.avatar or "👤",
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return {"contact": _serialize(contact)}
