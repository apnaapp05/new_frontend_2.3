from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import date  # <--- YEH LINE MISSING THI

# 1. Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    role: str  # 'doctor' or 'patient'

# 2. Schema for Registration (Incoming Data)
class UserCreate(UserBase):
    password: str
    full_name: str
    
    # Optional fields based on role
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    hospital_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

# 3. Schema for Login (Incoming Data)
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 4. Schema for Response (Outgoing Data)
class UserOut(UserBase):
    id: UUID
    is_active: bool

    class Config:
        from_attributes = True

# --- NEW: APPOINTMENT SCHEMAS ---
class AppointmentCreate(BaseModel):
    doctor_id: Optional[UUID] = None
    hospital_id: Optional[UUID] = None
    date: date
    time: str
    reason: str = "Checkup"

class AppointmentOut(BaseModel):
    id: UUID
    date: date
    time: str
    status: str
    doctor_name: str
    hospital_name: str
    
    class Config:
        from_attributes = True

# 5. Forgot Password Schema
class ForgotPasswordRequest(BaseModel):
    email: EmailStr