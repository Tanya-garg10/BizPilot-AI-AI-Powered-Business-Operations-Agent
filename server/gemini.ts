import { GoogleGenAI, Type, Schema } from '@google/genai';
import { 
  BusinessSettings, 
  ChatResponse, 
  LeadStage, 
  AgentRun, 
  AIInsight,
  ConversationMessage
} from '../src/types.js';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

/**
 * Process incoming customer message through the 5 BizPilot AI logical agents:
 * 1. Reception Agent: Understand message, intent identification, answer FAQs, collect customer info
 * 2. Sales Agent: Evaluate buying intent, lead score (0-100), identify requirements
 * 3. Conversion Agent: Recommend appointment booking, payment link, or stage progression
 * 4. Follow-up Agent: Determine if follow-up required & draft message
 * 5. Business Analyst Agent: Summarize decision & action
 */
export async function processCustomerMessageWithGemini(
  message: string,
  customerHistory: ConversationMessage[],
  settings: BusinessSettings,
  customerId: string
): Promise<ChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Format services and FAQs for context
  const servicesContext = settings.services
    .map(s => `- ${s.name}: ₹${s.price} (${s.duration}). ${s.description}`)
    .join('\n');

  const faqsContext = settings.faqs
    .map(f => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n\n');

  const historyText = customerHistory.slice(-6)
    .map(h => `${h.sender.toUpperCase()}: ${h.message}`)
    .join('\n');

  const systemPrompt = `
You are the multi-agent AI engine for BizPilot AI, operating on behalf of "${settings.business_name}".
Business Description: ${settings.description}

SERVICES & PRICING:
${servicesContext}

FREQUENTLY ASKED QUESTIONS (FAQs):
${faqsContext}

CUSTOMER RECENT CHAT HISTORY:
${historyText.length > 0 ? historyText : "No previous conversation history."}

CUSTOMER NEW MESSAGE:
"${message}"

INSTRUCTIONS FOR THE 5 LOGICAL AGENTS:

1. RECEPTION AGENT:
   - Understand the customer's intent (e.g., "course_enquiry", "pricing_inquiry", "schedule_timing", "certificate_query", "refund_policy", "book_counselling", "enroll_payment", "general_greeting").
   - Answer their questions accurately based ONLY on the provided business services and FAQs.
   - Be warm, helpful, professional, and clear.

2. SALES AGENT:
   - Evaluate buying intent and compute a Lead Score from 0 to 100 based on the following criteria:
     * 0–30: Low Intent (Casual greeting, vague query, unrelated questions)
     * 31–60: Medium Intent (Asking for pricing, general info, comparison)
     * 61–80: High Intent (Asking about cohort start dates, syllabus details, enrollment steps)
     * 81–100: Very High Intent (Wants to join immediately, asking how to pay, asking to book counselling slot)
   - Assign Lead Stage: "New" (0-30), "Qualified" (31-60), "Appointment" (61-80), "Payment Pending" or "Converted" (81-100).

3. CONVERSION AGENT:
   - Identify the best Next Action (e.g. "book_appointment", "send_payment_link", "provide_course_details", "schedule_followup", "human_handoff").
   - Match the recommended course if applicable ("Python Development Course", "Web Development Course", "Data Analytics Course").

4. FOLLOW-UP AGENT:
   - Determine if a follow-up action is required (e.g. if the customer doesn't book immediately or needs time to decide).

5. BUSINESS ANALYST AGENT:
   - Create 4 concise agent execution log entries summarizing each agent's reasoning and actions.

You MUST respond with pure structured JSON matching this exact structure:
{
  "intent": "string (e.g. course_enquiry)",
  "lead_score": number (0-100),
  "lead_stage": "New" | "Qualified" | "Appointment" | "Payment Pending" | "Converted" | "Lost",
  "response": "string (The customer-facing reply message)",
  "next_action": "book_appointment" | "send_payment_link" | "provide_course_details" | "schedule_followup",
  "recommended_course": "string (or empty string)",
  "requires_human": boolean,
  "reason": "string (Concise reason for AI decision)",
  "agent_logs": [
    {
      "agent": "Reception Agent",
      "action": "string",
      "status": "success",
      "reasoning": "string"
    },
    {
      "agent": "Sales Agent",
      "action": "string",
      "status": "success",
      "reasoning": "string"
    },
    {
      "agent": "Conversion Agent",
      "action": "string",
      "status": "success",
      "reasoning": "string"
    },
    {
      "agent": "Follow-up Agent",
      "action": "string",
      "status": "success",
      "reasoning": "string"
    }
  ]
}
`;

  if (apiKey) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const responseText = response.text || "";
      const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJsonText);

      // Map response to ChatResponse format
      const agentLogs: AgentRun[] = (parsed.agent_logs || []).map((log: any, idx: number) => ({
        id: `log_${Date.now()}_${idx}`,
        timestamp: new Date().toISOString(),
        agent: log.agent || 'Reception Agent',
        customer_id: customerId,
        intent: parsed.intent || 'course_enquiry',
        decision: log.reasoning || parsed.reason || 'Processed customer query',
        action: log.action || 'Generated AI response',
        tool_called: log.agent === 'Sales Agent' ? 'lead_scoring_engine' :
                     log.agent === 'Conversion Agent' ? 'appointment_scheduler' : 'query_business_faq',
        tool_result: `Executed ${log.agent} step successfully`,
        status: log.status || 'success',
        reasoning_summary: log.reasoning || parsed.reason || 'Customer inquiry evaluation',
      }));

      const slots = parsed.next_action === 'book_appointment' || parsed.lead_score >= 60
        ? ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"]
        : undefined;

      return {
        intent: parsed.intent || 'course_enquiry',
        lead_score: typeof parsed.lead_score === 'number' ? parsed.lead_score : 50,
        lead_stage: parsed.lead_stage || 'Qualified',
        response: parsed.response || `Thank you for contacting ${settings.business_name}! How can we assist you today?`,
        next_action: parsed.next_action || 'provide_course_details',
        recommended_course: parsed.recommended_course || 'Python Development Course',
        requires_human: Boolean(parsed.requires_human),
        reason: parsed.reason || 'Customer interaction processed.',
        customer_id: customerId,
        agent_logs: agentLogs,
        appointment_slots_available: slots,
      };
    } catch (err) {
      console.error("Gemini API call failed or returned invalid JSON, falling back to rule-based agent pipeline:", err);
    }
  } else {
    console.warn("GEMINI_API_KEY is not set. Using rule-based fallback agent pipeline.");
  }

  // Robust Rule-Based Fallback Engine (Runs when Gemini API key is missing or encounters network issue)
  return runFallbackAgentPipeline(message, settings, customerId);
}

/**
 * Intelligent Rule-Based Fallback Pipeline to ensure 100% reliable functionality
 */
function runFallbackAgentPipeline(
  message: string,
  settings: BusinessSettings,
  customerId: string
): ChatResponse {
  const lower = message.toLowerCase();
  let intent = "course_enquiry";
  let leadScore = 40;
  let leadStage: LeadStage = "Qualified";
  let responseText = "";
  let nextAction = "provide_course_details";
  let recommendedCourse = "";

  // Match Services
  const matchedService = settings.services.find(s => 
    lower.includes(s.name.toLowerCase()) || 
    (s.name.toLowerCase().includes("python") && lower.includes("python")) ||
    (s.name.toLowerCase().includes("web") && (lower.includes("web") || lower.includes("fullstack"))) ||
    (s.name.toLowerCase().includes("data") && (lower.includes("data") || lower.includes("analytics")))
  );

  if (matchedService) {
    recommendedCourse = matchedService.name;
  }

  // Intent Detection & Responses
  if (lower.includes("python") || lower.includes("web") || lower.includes("data") || lower.includes("course") || lower.includes("join") || lower.includes("enroll")) {
    intent = "course_enquiry";
    leadScore = matchedService ? 82 : 75;
    leadStage = "Appointment";
    nextAction = "book_appointment";
    const courseInfo = matchedService 
      ? `Our ${matchedService.name} is priced at ₹${matchedService.price} for a ${matchedService.duration} program.`
      : `We offer Python Development (₹999), Web Development (₹1,499), and Data Analytics (₹1,999) courses.`;
    
    responseText = `${courseInfo} All courses include live interactive classes, hands-on projects, mentor support, and verified certificates. Would you like to schedule a free 1-on-1 counselling session with our academic advisor?`;
  } else if (lower.includes("timing") || lower.includes("time") || lower.includes("schedule") || lower.includes("when")) {
    intent = "schedule_timing";
    leadScore = 65;
    leadStage = "Qualified";
    nextAction = "book_appointment";
    responseText = `Live classes are held on weekdays from 7:00 PM to 8:30 PM IST. We also provide full recorded session access and weekend mentor Q&A slots. Would you like to book a counselling session to choose your preferred batch?`;
  } else if (lower.includes("price") || lower.includes("fee") || lower.includes("cost") || lower.includes("discount") || lower.includes("pay")) {
    intent = "pricing_inquiry";
    leadScore = 80;
    leadStage = "Payment Pending";
    nextAction = "send_payment_link";
    responseText = `Our course fees are:\n- Python Development Course: ₹999\n- Web Development Course: ₹1,499\n- Data Analytics Course: ₹1,999\n\nAll courses include a 7-day money-back guarantee! Would you like us to generate a direct payment link for you?`;
  } else if (lower.includes("certificate") || lower.includes("degree") || lower.includes("job")) {
    intent = "certificate_query";
    leadScore = 60;
    leadStage = "Qualified";
    responseText = `Yes! Upon completing your capstone projects, you will receive an industry-recognized Verified Certificate of Completion that you can add to LinkedIn and your resume. Would you like to check out the course syllabus?`;
  } else if (lower.includes("refund") || lower.includes("cancel") || lower.includes("money back")) {
    intent = "refund_policy";
    leadScore = 30;
    leadStage = "New";
    responseText = `We offer a 100% full refund policy within 7 days of course commencement. If you are not satisfied with the learning experience, we issue a no-questions-asked refund.`;
  } else {
    intent = "general_greeting";
    leadScore = 35;
    leadStage = "New";
    responseText = `Hello! Welcome to ${settings.business_name}. How can I assist you with your tech career learning goals today?`;
  }

  const timestamp = new Date().toISOString();
  const agentLogs: AgentRun[] = [
    {
      id: `log_${Date.now()}_1`,
      timestamp,
      agent: "Reception Agent",
      customer_id: customerId,
      intent,
      decision: `Detected customer intent: ${intent}`,
      action: "Queried knowledge base & FAQ database",
      tool_called: "query_business_faq",
      tool_result: `Found relevant context for ${intent}`,
      status: "success",
      reasoning_summary: `Analyzed keywords in message: "${message.substring(0, 40)}..."`,
    },
    {
      id: `log_${Date.now()}_2`,
      timestamp,
      agent: "Sales Agent",
      customer_id: customerId,
      intent,
      decision: `Assigned Lead Score: ${leadScore}/100`,
      action: `Assigned Lead Stage: ${leadStage}`,
      tool_called: "lead_scoring_engine",
      tool_result: `Lead score updated to ${leadScore}`,
      status: "success",
      reasoning_summary: `Buying intent evaluated as ${leadScore >= 80 ? 'Very High' : leadScore >= 60 ? 'High' : 'Medium'}.`,
    },
    {
      id: `log_${Date.now()}_3`,
      timestamp,
      agent: "Conversion Agent",
      customer_id: customerId,
      intent,
      decision: `Recommended next action: ${nextAction}`,
      action: `Selected primary offer: ${recommendedCourse || 'Course Catalog'}`,
      tool_called: "conversion_optimizer",
      tool_result: `Prepared ${nextAction} action card`,
      status: "success",
      reasoning_summary: `Guided customer toward enrollment funnel step.`,
    },
    {
      id: `log_${Date.now()}_4`,
      timestamp,
      agent: "Follow-up Agent",
      customer_id: customerId,
      intent,
      decision: "Scheduled automated follow-up check in 24 hours.",
      action: "Registered task in followups queue",
      tool_called: "followup_scheduler",
      tool_result: "Follow-up queued",
      status: "success",
      reasoning_summary: "Enforces continuous lead engagement strategy.",
    }
  ];

  return {
    intent,
    lead_score: leadScore,
    lead_stage: leadStage,
    response: responseText,
    next_action: nextAction,
    recommended_course: recommendedCourse || "Python Development Course",
    requires_human: false,
    reason: `Automated processing complete. Lead score: ${leadScore}`,
    customer_id: customerId,
    agent_logs: agentLogs,
    appointment_slots_available: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"],
  };
}

/**
 * Generate AI Business Insights based on stored metrics
 */
export async function generateAIBusinessInsights(
  stats: { total_conversations: number; qualified_leads: number; appointments: number; conversions: number; revenue: number }
): Promise<AIInsight> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = getAI();
      const prompt = `
Analyze these current business performance metrics for SkillBridge Academy:
- Total Customer Conversations: ${stats.total_conversations}
- Qualified Leads (Score >= 31): ${stats.qualified_leads}
- Booked Appointments / Counselling Sessions: ${stats.appointments}
- Paid Conversions: ${stats.conversions}
- Total Generated Revenue: ₹${stats.revenue}

Provide actionable business optimization insights. Return pure JSON matching this structure:
{
  "headline": "Short punchy executive summary headline",
  "summary": "1-2 sentence overview of performance",
  "bottlenecks": ["2 key conversion bottlenecks"],
  "recommendations": ["2 concrete actionable recommendations"]
}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const cleaned = (response.text || "").replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        headline: parsed.headline || "High Engagement & Conversion Potential Identified",
        summary: parsed.summary || `${stats.qualified_leads} leads qualified with ₹${stats.revenue} generated revenue across recent interactions.`,
        bottlenecks: parsed.bottlenecks || [
          "Customer drop-off occurs between initial course enquiry and scheduling counselling sessions.",
          "High enquiry volume for Python course requires faster automated payment link generation."
        ],
        recommendations: parsed.recommendations || [
          "Offer immediate 1-click counselling booking slots right after high-intent enquiries.",
          "Automate WhatsApp payment follow-up reminders 2 hours after counselling sessions."
        ],
        generated_at: new Date().toISOString()
      };
    } catch (err) {
      console.error("Failed to generate AI Insights with Gemini:", err);
    }
  }

  // Fallback Insight
  return {
    headline: "Solid Lead Qualification & Healthy Funnel Motion",
    summary: `${stats.qualified_leads} out of ${stats.total_conversations} conversations qualified into high-intent leads, driving ${stats.appointments} counselling appointments and ₹${stats.revenue} total revenue.`,
    bottlenecks: [
      "Conversion friction observed when leads transition from pricing enquiries to booking counselling.",
      "Follow-up delays can lead to lost lead momentum within 24 hours of first enquiry."
    ],
    recommendations: [
      "Automatically prompt 1-click appointment booking when lead score exceeds 60.",
      "Send personalized curriculum highlights via automated follow-up within 2 hours."
    ],
    generated_at: new Date().toISOString()
  };
}
