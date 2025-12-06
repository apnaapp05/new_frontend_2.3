from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer # <--- New Import
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
import models, database, schemas

# --- CONFIGURATION ---
SECRET_KEY = "alshifa_super_secret_key_change_this_in_prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# 1. Setup Database & Security
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Al-Shifa Dental API")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login") # <--- Token URL Setup

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

# --- NEW: GET CURRENT USER FROM TOKEN ---
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

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Bismillāhir-Raḥmānir-Raḥīm - API is Running"}

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

# --- NEW ENDPOINT: GET MY PROFILE ---
@app.get("/users/me")
def read_users_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # User mil gaya, ab uski profile dhoondo
    if current_user.role == "patient":
        profile = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
        return {
            "email": current_user.email,
            "role": current_user.role,
            "full_name": profile.full_name if profile else "Unknown",
            "details": profile
        }
    elif current_user.role == "doctor":
        profile = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
        return {
            "email": current_user.email,
            "role": current_user.role,
            "full_name": profile.full_name if profile else "Doctor",
            "details": profile
        }
    return current_user
# --- NEW: APPOINTMENT ENDPOINTS ---

@app.post("/appointments", response_model=schemas.AppointmentOut)
def create_appointment(
    appt: schemas.AppointmentCreate, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # 1. Get Patient Profile
    if current_user.role != "patient":
        raise HTTPException(status_code=400, detail="Only patients can book appointments")
    
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()

    # 2. Assign Doctor (Logic: Agar doctor_id nahi diya, to pehla doctor utha lo - Temporary Logic)
    doctor_id = appt.doctor_id
    doctor_name = "Unknown Dr"
    
    if not doctor_id:
        # Auto-assign first doctor found (Logic ko hum baad mein AI se replace karenge)
        random_doc = db.query(models.Doctor).first()
        if not random_doc:
            raise HTTPException(status_code=404, detail="No doctors available")
        doctor_id = random_doc.id
        doctor_name = random_doc.full_name
    else:
        doc = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
        doctor_name = doc.full_name if doc else "Unknown"

    # 3. Assign Hospital
    hospital_id = appt.hospital_id
    hospital_name = "Main Clinic"
    
    if not hospital_id:
        hosp = db.query(models.Hospital).first()
        if hosp:
            hospital_id = hosp.id
            hospital_name = hosp.name

    # 4. Save to DB
    new_appt = models.Appointment(
        patient_id=patient.id,
        doctor_id=doctor_id,
        hospital_id=hospital_id,
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
        "hospital_name": hospital_name
    }

@app.get("/appointments/my", response_model=list[schemas.AppointmentOut])
def get_my_appointments(
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role == "patient":
        patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
        appts = db.query(models.Appointment).filter(models.Appointment.patient_id == patient.id).all()
    
    elif current_user.role == "doctor":
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
        appts = db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor.id).all()
    
    else:
        return []

    # Map data for response
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