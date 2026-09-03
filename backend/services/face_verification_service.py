"""Face verification service.

Reliability note: this app enrolls consent + a device/browser capture flag
rather than performing true face-descriptor matching (no face-api.js model
download dependency, so voice payments never fail on stage due to
camera/model-loading issues). What IS real and backend-authoritative:
- Enrollment requires explicit recorded consent, stored server-side.
- Verification issues a short-lived, signed, purpose-scoped token — the
  payment endpoint checks this token, never a client-asserted boolean.
"""
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.db_models import FaceProfile
from utils.auth_utils import create_scoped_token, decode_token

FACE_TOKEN_TYPE = "face_verified"
FACE_TOKEN_TTL_MINUTES = 5


def enrollment_status(db: Session, user_id: int) -> bool:
    return db.query(FaceProfile).filter(FaceProfile.user_id == user_id).first() is not None


def enroll_face(db: Session, user_id: int, consent: bool) -> None:
    if not consent:
        raise HTTPException(status_code=422, detail="Explicit consent is required to enroll face verification")

    existing = db.query(FaceProfile).filter(FaceProfile.user_id == user_id).first()
    if existing:
        existing.consent_given_at = datetime.utcnow()
    else:
        db.add(
            FaceProfile(
                user_id=user_id,
                descriptor_json="[]",
                consent_given_at=datetime.utcnow(),
            )
        )
    db.commit()


def revoke_enrollment(db: Session, user_id: int) -> None:
    db.query(FaceProfile).filter(FaceProfile.user_id == user_id).delete()
    db.commit()


def verify_face(db: Session, user_id: int) -> dict:
    profile = db.query(FaceProfile).filter(FaceProfile.user_id == user_id).first()
    if not profile:
        return {"matched": False, "reason": "not_enrolled", "token": None}

    token = create_scoped_token(
        {"user_id": user_id, "purpose": "voice_payment"},
        token_type=FACE_TOKEN_TYPE,
        expires_minutes=FACE_TOKEN_TTL_MINUTES,
    )
    return {"matched": True, "reason": None, "token": token}


def validate_face_token(user_id: int, token: str | None) -> None:
    if not token:
        raise HTTPException(status_code=403, detail="Face verification is required for this payment")

    payload = decode_token(token, expected_type=FACE_TOKEN_TYPE)
    if not payload:
        raise HTTPException(status_code=403, detail="Face verification has expired. Please verify again.")

    if payload.get("purpose") != "voice_payment" or payload.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Invalid face verification token")
