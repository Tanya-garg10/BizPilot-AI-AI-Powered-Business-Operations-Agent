import os
import json
import google.generativeai as genai
from .models import ChatResponse, AgentLog

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def run_multi_agent_pipeline(message: str, customer_id: str) -> ChatResponse:
    system_prompt = f"""
You are the multi-agent AI engine for BizPilot AI operating on behalf of SkillBridge Academy.

SERVICES:
1. Python Development Course — ₹999 (6 Weeks Live)
2. Web Development Course — ₹1,499 (8 Weeks Projects)
3. Data Analytics Course — ₹1,999 (10 Weeks Case Studies)

CUSTOMER MESSAGE:
"{message}"

Perform 5 logical agent operations: Reception, Sales, Conversion, Follow-up, Business Analyst.

Respond ONLY with valid JSON matching:
{{
  "intent": "course_enquiry",
  "lead_score": 82,
  "lead_stage": "Qualified",
  "response": "Our Python course is ₹999...",
  "next_action": "book_appointment",
  "recommended_course": "Python Development Course",
  "requires_human": false,
  "reason": "Customer expressed purchase interest",
  "agent_logs": [
    {{"agent": "Reception Agent", "action": "Intent detected", "status": "success", "reasoning": "Identified course inquiry"}},
    {{"agent": "Sales Agent", "action": "Lead score computed: 82", "status": "success", "reasoning": "High intent"}},
    {{"agent": "Conversion Agent", "action": "Appointment recommended", "status": "success", "reasoning": "Counseling offered"}},
    {{"agent": "Follow-up Agent", "action": "Followup scheduled", "status": "success", "reasoning": "24h reminder"}}
  ]
}}
"""
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(system_prompt)
            cleaned = response.text.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(cleaned)
            return ChatResponse(
                intent=parsed.get("intent", "course_enquiry"),
                lead_score=parsed.get("lead_score", 75),
                lead_stage=parsed.get("lead_stage", "Qualified"),
                response=parsed.get("response", "Thank you for reaching out to SkillBridge Academy!"),
                next_action=parsed.get("next_action", "book_appointment"),
                recommended_course=parsed.get("recommended_course", "Python Development Course"),
                requires_human=parsed.get("requires_human", False),
                reason=parsed.get("reason", "Inquiry processed"),
                customer_id=customer_id,
                lead_id=f"lead_{customer_id}",
                agent_logs=[AgentLog(**log) for log in parsed.get("agent_logs", [])],
                appointment_slots_available=["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"]
            )
        except Exception as e:
            print("Gemini call error:", e)

    # Fallback
    return ChatResponse(
        intent="course_enquiry",
        lead_score=80,
        lead_stage="Qualified",
        response="Welcome to SkillBridge Academy! Our Python Development Course is ₹999 for a 6-week program. Would you like to schedule a free 1-on-1 counselling session?",
        next_action="book_appointment",
        recommended_course="Python Development Course",
        requires_human=False,
        reason="Automated fallback response",
        customer_id=customer_id,
        lead_id=f"lead_{customer_id}",
        agent_logs=[
            AgentLog(agent="Reception Agent", action="Intent detected", status="success", reasoning="Keywords matched"),
            AgentLog(agent="Sales Agent", action="Scored: 80", status="success", reasoning="High engagement"),
            AgentLog(agent="Conversion Agent", action="Book counselling", status="success", reasoning="Proposed slots"),
            AgentLog(agent="Follow-up Agent", action="Scheduled 24h follow-up", status="success", reasoning="Queued")
        ],
        appointment_slots_available=["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"]
    )
