import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    Boolean,
    Text,
    LargeBinary,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship

from database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    mobile = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="user", uselist=False)
    credit_card = relationship("CreditCard", back_populates="user", uselist=False)
    pin_auth = relationship("PinAuth", back_populates="user", uselist=False)
    face_profile = relationship("FaceProfile", back_populates="user", uselist=False)


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Numeric(12, 2), nullable=False, default=10000)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wallet")


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    card_number_masked = Column(String, default="**** **** **** 4821")
    credit_limit = Column(Numeric(12, 2), nullable=False, default=100000)
    current_balance = Column(Numeric(12, 2), nullable=False, default=0)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="credit_card")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True)
    owner_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    upi_id = Column(String, nullable=True)
    avatar = Column(String, default="👤")
    linked_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (Index("ix_contacts_owner_name", "owner_user_id", "name"),)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    reference_id = Column(String, unique=True, nullable=False, default=lambda: f"TXN{_uuid()[:12].upper()}")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    source = Column(String, nullable=False)  # 'wallet' | 'credit_card'
    type = Column(String, nullable=False)  # 'debit' | 'credit'
    amount = Column(Numeric(12, 2), nullable=False)
    merchant = Column(String, nullable=True)
    category = Column(String, nullable=True)
    status = Column(String, nullable=False, default="success")  # success|blocked|failed
    payment_method = Column(String, nullable=True)  # wallet|voice|card|upi
    counterparty_contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (Index("ix_transactions_user_created", "user_id", "created_at"),)


class PinAuth(Base):
    __tablename__ = "pin_auth"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    pin_hash = Column(String, nullable=False)
    failed_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="pin_auth")


class FaceProfile(Base):
    __tablename__ = "face_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    descriptor_json = Column(Text, nullable=False)  # JSON array of 128 floats
    enrollment_image_path = Column(String, nullable=True)
    consent_given_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="face_profile")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    conversation_id = Column(String, nullable=False, default=_uuid)
    role = Column(String, nullable=False)  # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    provider = Column(String, nullable=True)  # 'gemini' | 'ollama' | None
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (Index("ix_chat_user_conv_created", "user_id", "conversation_id", "created_at"),)


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    data_type = Column(String, nullable=False)  # conversation|insight|merchant_summary
    source_ref = Column(String, nullable=True)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(LargeBinary, nullable=False)
    embedding_dim = Column(Integer, nullable=False)
    embedding_provider = Column(String, nullable=False)  # gemini|tfidf
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (Index("ix_knowledge_user_provider", "user_id", "embedding_provider"),)


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    endpoint = Column(String, nullable=False)
    request_hash = Column(String, nullable=False)
    status = Column(String, nullable=False, default="processing")  # processing|completed|failed
    response_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
