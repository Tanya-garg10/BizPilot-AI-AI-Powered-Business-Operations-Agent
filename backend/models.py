from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AgentLog(BaseModel):
    agent: str
    action: str
    status: str
    reasoning: str

class ChatRequest(BaseModel):
    message: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None

class ChatResponse(BaseModel):
    intent: str
    lead_score: int
    lead_stage: str
    response: str
    next_action: str
    recommended_course: str
    requires_human: bool
    reason: str
    customer_id: str
    lead_id: Optional[str] = None
    agent_logs: List[AgentLog]
    appointment_slots_available: Optional[List[str]] = None
    stripe_payment_url: Optional[str] = None

class LeadModel(BaseModel):
    id: str
    customer_id: str
    name: str
    email: str
    phone: str
    intent: str
    lead_score: int
    lead_stage: str
    interested_service: str
    source: str
    created_at: str
    updated_at: str
    next_action: str

class CustomerModel(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    created_at: str
    last_interaction: str
    total_conversations: int

class AppointmentModel(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    service: str
    date: str
    time: str
    status: str
    created_at: str

class FollowupModel(BaseModel):
    id: str
    customer_id: str
    lead_id: str
    message: str
    scheduled_for: str
    status: str
    created_at: str

class PaymentModel(BaseModel):
    id: str
    customer_id: str
    lead_id: str
    amount: float
    currency: str
    status: str
    stripe_payment_id: Optional[str] = None
    created_at: str
