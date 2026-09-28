from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import random

from database import SessionLocal
from models import User


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class CheckoutRequest(BaseModel):
    email: EmailStr
    phone: str
    shipping_address: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "OTP Login API is working"}


@app.post("/register")
def register_user(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    otp = str(random.randint(100000, 999999))

    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        otp_code=otp
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "otp": otp
    }


@app.get("/check-user")
def check_user(
    email: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    if user:
        return {
            "registered": True,
            "first_name": user.first_name,
            "last_name": user.last_name
        }

    return {
        "registered": False
    }


@app.post("/verify-otp")
def verify_otp(
    otp_data: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == otp_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.otp_code != otp_data.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    return {
        "message": "OTP verified successfully",
        "logged_in": True,
        "first_name": user.first_name,
        "last_name": user.last_name
    }


@app.post("/checkout")
def checkout(
    checkout_data: CheckoutRequest,
    db: Session = Depends(get_db)
):
    from sqlalchemy import text

    db.execute(
        text("""
            INSERT INTO checkout_orders
            (email, phone, shipping_address)
            VALUES (:email, :phone, :shipping_address)
        """),
        {
            "email": checkout_data.email,
            "phone": checkout_data.phone,
            "shipping_address": checkout_data.shipping_address,
        }
    )

    db.commit()

    return {
        "message": "Checkout information saved successfully"
    }
