from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator, ValidationError # Removed unused 'validator' from wsgiref
from typing import List, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Make sure this is imported
from fastapi.responses import FileResponse  # If you explicitly serve index.html

# --- Pydantic Models (Data Validation & Serialization) ---
class VitalSignReading(BaseModel):
    Spo2: float = Field(description="Blood oxygen saturation in percentage")
    Hr: float = Field(description="Heart rate in beats per minute")

    @field_validator('Spo2')
    @classmethod
    def spo2_must_be_valid(cls, value: float, info) -> float:
        if value == -999:
            raise ValueError(f"{info.field_name} cannot be -999")
        if not (0 <= value <= 100):
            raise ValueError("Spo2 must be between 0 and 100")
        return value

    @field_validator('Hr')
    @classmethod
    def hr_must_be_valid(cls, value: float, info) -> float:
        if value == -999:
            raise ValueError(f"{info.field_name} cannot be -999")
        if value <= 0:
            raise ValueError("Hr must be greater than 0")
        return value

class StoredVitalSignReading(VitalSignReading):
    timestamp_server: datetime = Field(default_factory=datetime.utcnow)

db_vitals: List[StoredVitalSignReading] = []

app = FastAPI(
    title="VitalOps API",
    description="API for receiving and retrieving vital signs data from IoT devices.",
    version="0.1.0"
)

origins = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:3000",
    # Add your deployed frontend URL here once you have it, and your ngrok URL if testing
    # e.g., "https://your-frontend.vercel.app",
    # "https://vitalops.onrender.com" # Allow requests from itself if frontend is served from same domain
]
# Add your ngrok URL from the error log, ensuring no trailing spaces
# For example, if your ngrok URL was "http://6de5-103-249-77-122.ngrok-free.app "
# it should be "http://6de5-103-249-77-122.ngrok-free.app"
# It's good practice to dynamically get this or use a wildcard for dev if secure enough.
# For production, list specific origins.

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Be specific in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

# POST to /api/vitals to create new readings
@app.post("/api/vitals", response_model=StoredVitalSignReading, status_code=201)
async def create_vital_reading(reading: VitalSignReading):
    print(f"Received data: {reading.dict()}")
    stored_reading = StoredVitalSignReading(
        **reading.dict(),
        timestamp_server=datetime.utcnow()
    )
    db_vitals.append(stored_reading)
    return stored_reading

# GET /api/vitals/latest to get the most recent reading
@app.get("/api/vitals/latest", response_model=Optional[StoredVitalSignReading])
async def get_latest_vital_reading():
    if not db_vitals:
        return None
    return db_vitals[-1]

# GET /api/vitals/history to get a list of recent readings
@app.get("/api/vitals/history", response_model=List[StoredVitalSignReading])
async def get_vitals_history(limit: int = 10):
    if not db_vitals:
        return []
    return db_vitals[-limit:]

# Optional: A simple health check or API root message at a different path
@app.get("/api/ping", include_in_schema=False) # Or just /api/
async def api_root_message():
    return {"message": "Welcome to the VitalOps API endpoints!"}


# --- Serve Static Frontend Files (Mount this AFTER your API routes) ---
# This will serve index.html from the 'static' directory for requests to '/'
# and other files like CSS/JS relative to that.
app.mount("/", StaticFiles(directory="static", html=True), name="static-frontend")