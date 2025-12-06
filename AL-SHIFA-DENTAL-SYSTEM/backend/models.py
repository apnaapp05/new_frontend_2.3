from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Time, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # doctor, patient, admin
    is_active = Column(Boolean, default=True)
    
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    patient_profile = relationship("Patient", back_populates="user", uselist=False)

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    contact = Column(String)
    
    doctors = relationship("Doctor", back_populates="hospital")
    inventory = relationship("Inventory", back_populates="hospital")

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id"))
    full_name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    
    # --- YEH MISSING THA ---
    license_number = Column(String, nullable=True) 
    
    is_verified = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="doctor_profile")
    hospital = relationship("Hospital", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    full_name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    
    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"))
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id")) # Added Hospital Link
    date = Column(Date, nullable=False)
    time = Column(String, nullable=False)
    status = Column(String, default="scheduled")
    notes = Column(Text, nullable=True)
    
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id"))
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    status = Column(String, default="Good") # Good, Low, Critical
    
    hospital = relationship("Hospital", back_populates="inventory")