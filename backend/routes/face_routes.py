from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import User
from services.face_verification_service import (
    enroll_face,
    enrollment_status,
    revoke_enrollment,
    verify_face,
)
from utils.deps import get_current_user

router = APIRouter()


class EnrollRequest(BaseModel):
    consent: bool


@router.get("/status")
def get_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"enrolled": enrollment_status(db, user.id)}


@router.post("/enroll")
def enroll(body: EnrollRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    enroll_face(db, user.id, body.consent)
    return {"message": "Face verification enrolled"}


@router.post("/verify")
def verify(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return verify_face(db, user.id)


@router.delete("/enrollment")
def delete_enrollment(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    revoke_enrollment(db, user.id)
    return {"message": "Face enrollment removed"}
