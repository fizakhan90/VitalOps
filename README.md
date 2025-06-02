# 🩺 VitalOps – Real-Time Health Monitoring at the DevOps Intersection

**🚀 X-RAPTORS Hackathon 2025 – The Intersection Challenge**  
**👥 Team:** *LazyBird*  
**🌐 Live App:** [https://vitalops-app.onrender.com](https://vitalops-app.onrender.com)  
**💻 GitHub Repo:** [https://github.com/fizakhan90/vitalops](https://github.com/fizakhan90/vitalops)  
**🎥 Demo Video:** *[Add your demo video link here]*

---

## ⚡ The Idea: Innovation Happens at Intersections

VitalOps was born at the intersection of **Healthcare** and **DevOps**, where real-world patient needs meet robust engineering practices.

In response to the **Intersection Challenge** theme of the X-RAPTORS Hackathon, we created **VitalOps**, a real-time health monitoring platform built using DevOps best practices, to deliver critical health insights reliably and efficiently.

---

## 🎯 Mission: Make HealthTech Reliable, Fast & Scalable

**VitalOps** is a remote vitals monitoring system that:
- Simulates data from an IoT device (PPG sensor + Arduino R4 wifi).
- Ingests and validates Heart Rate and SpO₂ data in real time.
- Displays vitals on a live dashboard.
- Uses a fully automated CI/CD pipeline for fast and reliable deployment.

This project could only exist at the **collision point of Health and DevOps**, making it a true embodiment of the Intersection Challenge.

---

## 🔀 The Power of the Intersection: Health x DevOps

### 🏥 Health Domain
- Real-time collection of critical vitals (Heart Rate, SpO₂).
- Enables remote patient monitoring and elderly care.
- User-friendly UI with current and historical readings.
- Vitals status labels: **Normal**, **Warning**, **Critical**.

### ⚙️ DevOps Domain
- **CI/CD Pipeline:** GitHub Actions automate build, test, containerization, and deployment.
- **Containerization:** Combined backend + frontend Docker image for portability and consistency.
- **GHCR + Render.com:** Docker image hosting and seamless production deployment.
- **Frontend Export:** Next.js statically exported and served via FastAPI.

### 🎇 Fusion Value
- Health systems need **reliability** → DevOps ensures uptime and repeatability.
- Medical software requires **agility** → CI/CD allows quick, safe iterations.
- The outcome: A **resilient, scalable health monitoring system** that couldn't be built in either domain alone.

---

## 🛠 Features

✅ Real-time vital signs ingestion  
✅ Backend validation for error codes, data types, and ranges  
✅ Dynamic dashboard with patient status indicators  
✅ History of last 10 readings with timestamps  
✅ Auto-refresh, error handling, retry mechanism  
✅ Unified Dockerized deployment with CI/CD  
✅ Deployed to production automatically on push to `main`

---

## 🧪 Tech Stack

**Backend**  
- Python, FastAPI, Pydantic, Uvicorn

**Frontend**  
- Next.js (React + TypeScript), Tailwind CSS, shadcn/ui, lucide-react

**DevOps**  
- Docker, GitHub Actions (CI/CD), GitHub Container Registry (GHCR), Render.com

**Simulated IoT Hardware**  
- Arduino UNO R4 WiFi   
- PPG Sensor (for HR and SpO₂)

---

## 🧩 Architecture Overview

> _[Add architecture diagram or description here]_  
> You can use Mermaid, PlantUML, or upload an image (e.g., `/assets/architecture.png`).

---

## 📦 CI/CD Workflow

On every push to `main`:
1. 🔧 Build frontend (`npm run build`) → static export  
2. 📁 Copy exported assets into `backend/static`  
3. 🐳 Build full Docker image (backend + static frontend)  
4. 📤 Push image to GitHub Container Registry (GHCR)  
5. 🚀 Trigger deploy hook on Render.com  

✅ **Result:** Zero-click production deployment from commit to live app.

---

## 🧰 Local Setup

### 1. Clone the Repo

```bash
git clone https://github.com/fizakhan90/vitalops.git
cd vitalops
```
### 2. Run Backend 
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate (Windows)
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 5000
```
### 3. Run Frontend
```bash
cd frontend
npm install

# Ensure .env.local has:
# NEXT_PUBLIC_API_URL=http://localhost:5000

npm run dev
```
### 4.Dockerized App (Full Stack)
```bash
# After copying frontend/out/* → backend/static/
cd backend
docker build -t vitalops-local .
docker run -p 5000:5000 vitalops-local

# App available at: http://localhost:5000
```

