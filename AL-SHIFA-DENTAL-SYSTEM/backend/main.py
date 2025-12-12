from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta, date
from jose import jwt, JWTError
import models, database, schemas

# --- IMPORT AGENTS ---
# Make sure your agent files are in a folder named 'agents' with an empty __init__.py
from agents.appointment_agent import AppointmentAgent, AgentInput as ApptInput
from agents.inventory_agent import InventoryAgent, InventoryInput
from agents.revenue_agent import RevenueAgent, FinanceInput
from agents.case_agent import CaseTrackingAgent, CaseInput

# --- CONFIGURATION ---
SECRET_KEY = "alshifa_super_secret_key_change_this_in_prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# 1. Setup Database & Security
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Al-Shifa Dental API")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- INITIALIZE AGENTS ---
appt_agent = AppointmentAgent()
inv_agent = InventoryAgent()
fin_agent = RevenueAgent()
case_agent = CaseTrackingAgent()

# --- CORS SETTINGS ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- HELPER FUNCTIONS ---
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# --- AUTH ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Bismillāhir-Raḥmānir-Raḥīm - Al-Shifa API is Running"}

@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if user.role == "doctor":
        hospital = db.query(models.Hospital).first()
        if not hospital:
            hospital = models.Hospital(name=user.hospital_name or "General Clinic", location="City Center")
            db.add(hospital)
            db.commit()
            db.refresh(hospital)

        new_doctor = models.Doctor(
            user_id=new_user.id,
            hospital_id=hospital.id,
            full_name=user.full_name,
            specialization=user.specialization or "General Dentist",
            license_number=user.license_number or "PENDING-000"
        )
        db.add(new_doctor)
    
    elif user.role == "patient":
        new_patient = models.Patient(
            user_id=new_user.id,
            full_name=user.full_name,
            age=user.age,
            gender=user.gender
        )
        db.add(new_patient)

    db.commit()
    return new_user

@app.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=403, detail="Invalid Credentials")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.post("/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        return {"message": "If this email is registered, you will receive a reset link."}
    # Mock Email Sending
    print(f"\n==========================================")
    print(f" PASSWORD RESET REQUEST FOR: {user.email}")
    print(f" RESET LINK: http://localhost:3000/auth/reset-password?token=mock_token_{user.id}")
    print(f"==========================================\n")
    return {"message": "Password reset link sent to your email."}

@app.get("/users/me")
def read_users_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "patient":
        profile = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
        return {"email": current_user.email, "role": current_user.role, "full_name": profile.full_name if profile else "Unknown", "details": profile}
    elif current_user.role == "doctor":
        profile = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
        return {"email": current_user.email, "role": current_user.role, "full_name": profile.full_name if profile else "Doctor", "details": profile}
    return current_user

# --- APPOINTMENT ROUTES ---

@app.post("/appointments", response_model=schemas.AppointmentOut)
def create_appointment(appt: schemas.AppointmentCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "patient":
        raise HTTPException(status_code=400, detail="Only patients can book appointments")
    
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
    doctor_id = appt.doctor_id
    doctor_name = "Unknown Dr"
    
    if not doctor_id:
        random_doc = db.query(models.Doctor).first()
        if not random_doc:
            raise HTTPException(status_code=404, detail="No doctors available")
        doctor_id = random_doc.id
        doctor_name = random_doc.full_name
    else:
        doc = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
        doctor_name = doc.full_name if doc else "Unknown"

    hospital = db.query(models.Hospital).first()
    hospital_id = hospital.id if hospital else None
    
    new_appt = models.Appointment(
        patient_id=patient.id,
        doctor_id=doctor_id,
        hospital_id=hospital_id, # Can be null if logic allows
        date=appt.date,
        time=appt.time,
        status="confirmed",
        notes=appt.reason
    )
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)

    return {
        "id": new_appt.id,
        "date": new_appt.date,
        "time": new_appt.time,
        "status": new_appt.status,
        "doctor_name": doctor_name,
        "hospital_name": hospital.name if hospital else "Main Clinic"
    }

@app.get("/appointments/my", response_model=list[schemas.AppointmentOut])
def get_my_appointments(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "patient":
        patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
        appts = db.query(models.Appointment).filter(models.Appointment.patient_id == patient.id).all()
    elif current_user.role == "doctor":
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
        appts = db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor.id).all()
    else:
        return []

    results = []
    for a in appts:
        doc = db.query(models.Doctor).filter(models.Doctor.id == a.doctor_id).first()
        hosp = db.query(models.Hospital).filter(models.Hospital.id == a.hospital_id).first()
        results.append({
            "id": a.id,
            "date": a.date,
            "time": a.time,
            "status": a.status,
            "doctor_name": doc.full_name if doc else "Unknown",
            "hospital_name": hosp.name if hosp else "Unknown"
        })
    return results

@app.get("/doctors")
def get_all_doctors(db: Session = Depends(get_db)):
    doctors = db.query(models.Doctor).all()
    results = []
    for doc in doctors:
        hospital = db.query(models.Hospital).filter(models.Hospital.id == doc.hospital_id).first()
        results.append({
            "id": str(doc.id),
            "full_name": doc.full_name,
            "specialization": doc.specialization,
            "hospital_name": hospital.name if hospital else "Unknown Clinic",
            "location": hospital.location if hospital else "City Center"
        })
    return results

@app.get("/doctor/dashboard")
def get_doctor_dashboard(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Access Denied")
    
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    today = date.today()
    todays_appts = db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor.id, models.Appointment.date == today).all()
    
    appt_list = []
    for a in todays_appts:
        patient = db.query(models.Patient).filter(models.Patient.id == a.patient_id).first()
        appt_list.append({
            "id": str(a.id),
            "patient_name": patient.full_name if patient else "Unknown",
            "time": a.time,
            "status": a.status,
            "treatment": a.notes or "Checkup"
        })

    return {
        "today_count": len(todays_appts),
        "total_patients": db.query(models.Appointment.patient_id).filter(models.Appointment.doctor_id == doctor.id).distinct().count(),
        "revenue": len(todays_appts) * 1500,
        "appointments": appt_list
    }

@app.get("/doctor/patients")
def get_my_patients(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Access Denied")
    
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
    patient_ids = db.query(models.Appointment.patient_id).filter(models.Appointment.doctor_id == doctor.id).distinct().all()
    ids = [p[0] for p in patient_ids]
    patients = db.query(models.Patient).filter(models.Patient.id.in_(ids)).all()
    
    results = []
    for p in patients:
        last_appt = db.query(models.Appointment).filter(models.Appointment.patient_id == p.id, models.Appointment.doctor_id == doctor.id).order_by(models.Appointment.date.desc()).first()
        results.append({
            "id": str(p.id),
            "name": p.full_name,
            "age": p.age,
            "gender": p.gender,
            "last_visit": last_appt.date if last_appt else None,
            "condition": last_appt.notes or "Checkup",
            "status": "Active"
        })
    return results

# --- AGENTIC AI ENDPOINTS ---

@app.post("/agent/appointment")
def chat_appointment(input_data: ApptInput):
    # Agent 1: Appointment & History
    return appt_agent.process_request(input_data)

@app.post("/agent/inventory")
def chat_inventory(input_data: InventoryInput):
    # Agent 2: Inventory
    return inv_agent.process_request(input_data)

@app.post("/agent/finance")
def chat_finance(input_data: FinanceInput):
    # Agent 3: Revenue
    return fin_agent.process_request(input_data)

@app.post("/agent/case")
def chat_case(input_data: CaseInput):
    # Agent 4: Case Tracking
    return case_agent.process_request(input_data)

#          --- DOCTOR DASHBOARD ANALYTICS ---

# --- NEW: INVENTORY READ ENDPOINT ---
@app.get("/doctor/inventory")
def get_inventory(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Access Denied")
    
    # Access the Inventory Agent's Memory directly
    graph_data = inv_agent.memory.graph
    
    inventory_list = []
    for item_id, data in graph_data.items():
        # Determine status based on threshold
        status = "Good"
        if data["stock"] < data["threshold"]:
            status = "Critical"
        elif data["stock"] < data["threshold"] * 1.5:
            status = "Low"
            
        inventory_list.append({
            "id": item_id,
            "name": data["name"],
            "stock": data["stock"],
            "reorder_level": data["threshold"],
            "status": status,
            "supplier": data["supplier"]
        })
    
    return inventory_list

# --- NEW: FINANCE READ ENDPOINT ---
@app.get("/doctor/finance")
def get_finance_stats(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Access Denied")
    
    # Access the Revenue Agent's Graph Memory
    invoices = list(fin_agent.memory.graph.values())
    
    # Calculate Real-Time Stats
    total_revenue = sum(inv['amount'] for inv in invoices if inv['status'] == 'Paid')
    total_pending = sum(inv['amount'] for inv in invoices if inv['status'] == 'Pending')
    
    return {
        "total_revenue": total_revenue,
        "total_pending": total_pending,
        "invoices": invoices  # List of all invoices for the table
    }

# --- NEW: SCHEDULE READ ENDPOINT ---
@app.get("/doctor/schedule")
def get_doctor_schedule(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Access Denied")
    
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
    
    # Fetch all upcoming appointments
    upcoming_appts = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor.id,
        models.Appointment.date >= date.today()
    ).order_by(models.Appointment.date, models.Appointment.time).all()
    
    schedule_data = []
    for appt in upcoming_appts:
        patient = db.query(models.Patient).filter(models.Patient.id == appt.patient_id).first()
        schedule_data.append({
            "id": str(appt.id),
            "date": appt.date,
            "time": appt.time,
            "patient_name": patient.full_name if patient else "Unknown",
            "type": appt.notes or "General Checkup",
            "status": appt.status
        })
        
    return schedule_data