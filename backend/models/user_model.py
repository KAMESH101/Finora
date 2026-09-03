import re
from pydantic import BaseModel, EmailStr, field_validator

MOBILE_PATTERN = re.compile(r"^\d{10}$")


class SignupModel(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    password: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("mobile")
    @classmethod
    def mobile_valid(cls, v: str) -> str:
        v = v.strip()
        if not MOBILE_PATTERN.match(v):
            raise ValueError("Mobile number must be exactly 10 digits")
        return v

    @field_validator("password")
    @classmethod
    def password_strong_enough(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v


class LoginModel(BaseModel):
    mobile: str
    password: str

    @field_validator("mobile")
    @classmethod
    def mobile_valid(cls, v: str) -> str:
        v = v.strip()
        if not MOBILE_PATTERN.match(v):
            raise ValueError("Mobile number must be exactly 10 digits")
        return v


class RefreshModel(BaseModel):
    refresh_token: str
