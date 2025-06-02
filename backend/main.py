from wsgiref.validate import validator
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator, ValidationError, field_validator
from typing import List, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware


# --- Pydantic Models (Data Validation & Serialization) ---
class VitalSignReading(BaseModel):
    Spo2: float = Field( description="Blood oxygen saturation in percentage")
    Hr: float = Field(description="Heart rate in beats per minute")

    @field_validator('Spo2')
    @classmethod
    def spo2_must_be_valid(cls, value: float, info) -> float: # Use 'info'
        if value == -999:
            # info.field_name gives the name of the field ("Spo2")
            raise ValueError(f"{info.field_name} cannot be -999")
        if not (0 <= value <= 100): # Allow 0 for Spo2
            raise ValueError("Spo2 must be between 0 and 100")
        return value

    # Validator for Hr
    @field_validator('Hr')
    @classmethod
    def hr_must_be_valid(cls, value: float, info) -> float: # Use 'info'
        if value == -999:
            raise ValueError(f"{info.field_name} cannot be -999")
        if value <= 0: # Assuming HR must be strictly positive
            raise ValueError("Hr must be greater than 0")
        return value



class StoredVitalSignReading(VitalSignReading):
    timestamp_server: datetime = Field(default_factory=datetime.utcnow)


db_vitals: List[StoredVitalSignReading] = []

# --- FastAPI Application Instance ---
app = FastAPI(
    title="VitalOps API",
    description="API for receiving and retrieving vital signs data from IoT devices.",
    version="0.1.0"
)
origins = [
    "http://localhost:5000", 
    "http://127.0.0.1:5000",
    "http://localhost:3000", 
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.post("/api/vitals", response_model=StoredVitalSignReading, status_code=201)
async def create_vital_reading(reading: VitalSignReading):
    """
    Receive and store a new vital sign reading.
    - Validates incoming data against the VitalSignReading model.
    - Adds a server-side timestamp.
    - Stores it (in memory for this MVP).
    - Returns the stored reading with the timestamp.
    """
    print(f"Received data: {reading.dict()}") 


    stored_reading = StoredVitalSignReading(
        **reading.dict(), 
        timestamp_server=datetime.utcnow() 
    )
    
    db_vitals.append(stored_reading)
    return stored_reading

@app.get("/api/vitals/latest", response_model=Optional[StoredVitalSignReading])
async def get_latest_vital_reading():
    """
    Retrieve the most recent vital sign reading.
    Returns null if no data is available.
    """
    if not db_vitals:
        return None 
    return db_vitals[-1]

@app.get("/api/vitals/history", response_model=List[StoredVitalSignReading])
async def get_vitals_history(limit: int = 10):
    """
    Retrieve a list of the most recent vital sign readings.
    Default limit is 10.
    """
    if not db_vitals:
        return []
    
    return db_vitals[-limit:]

@app.get("/")
async def read_root():
    return {"message": "Welcome to the VitalOps API!"}
