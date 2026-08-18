from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import os
from .models import (
    ChatRequest, ChatResponse, LeadModel, CustomerModel, 
    AppointmentModel, FollowupModel, PaymentModel
)
from .agents import run_multi_agent_pipeline

app = FastAPI(
    title="BizPilot AI Backend API",
    description="AI-powered operations platform for small businesses - Build with Gemini XPRIZE",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "BizPilot AI FastAPI Cloud Run"}

@app.post("/api/chat", response_model=ChatResponse)
def process_chat(req: ChatRequest):
    cid = req.customer_id or "cust_python_demo"
    return run_multi_agent_pipeline(req.message, cid)

@app.get("/api/leads")
def get_leads():
    return [
        {
            "id": "lead_101",
            "customer_id": "cust_aarav_101",
            "name": "Aarav Sharma",
            "email": "aarav.sharma@example.com",
            "phone": "+91 98112 34567",
            "intent": "course_enquiry",
            "lead_score": 85,
            "lead_stage": "Appointment",
            "interested_service": "Python Development Course",
            "source": "WhatsApp Chat",
            "created_at": "2026-08-17T10:00:00Z",
            "updated_at": "2026-08-17T10:15:00Z",
            "next_action": "Conduct 1-on-1 Counselling"
        }
    ]

@app.get("/api/dashboard/stats")
def get_stats():
    return {
        "total_conversations": 42,
        "qualified_leads": 18,
        "appointments": 9,
        "conversions": 4,
        "revenue": 3996,
        "ai_actions": 67
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
