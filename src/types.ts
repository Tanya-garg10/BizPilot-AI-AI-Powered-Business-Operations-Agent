export type LeadStage = 'New' | 'Qualified' | 'Appointment' | 'Payment Pending' | 'Converted' | 'Lost';

export interface Lead {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  intent: string;
  lead_score: number; // 0-100
  lead_stage: LeadStage;
  interested_service: string;
  source: string;
  created_at: string;
  updated_at: string;
  next_action: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  last_interaction: string;
  total_conversations: number;
}

export interface ConversationMessage {
  id?: string;
  customer_id: string;
  message: string;
  sender: 'customer' | 'ai';
  intent?: string;
  timestamp: string;
  ai_response?: string;
  lead_score?: number;
}

export interface Appointment {
  id: string;
  customer_id: string;
  customer_name: string;
  service: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface Followup {
  id: string;
  customer_id: string;
  lead_id: string;
  message: string;
  scheduled_for: string;
  status: 'Scheduled' | 'Sent' | 'Completed';
  created_at: string;
}

export interface AgentRun {
  id: string;
  timestamp: string;
  agent: 'Reception Agent' | 'Sales Agent' | 'Conversion Agent' | 'Follow-up Agent' | 'Business Analyst Agent';
  customer_id: string;
  intent: string;
  decision: string;
  action: string;
  tool_called: string;
  tool_result: string;
  status: 'success' | 'warning' | 'error';
  reasoning_summary: string;
}

export interface Payment {
  id: string;
  customer_id: string;
  lead_id: string;
  amount: number; // in INR
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  stripe_payment_id?: string;
  stripe_payment_link?: string;
  created_at: string;
}

export interface CourseService {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BusinessSettings {
  business_name: string;
  description: string;
  contact_phone: string;
  contact_email: string;
  services: CourseService[];
  faqs: FAQItem[];
}

export interface ChatRequest {
  message: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

export interface ChatResponse {
  intent: string;
  lead_score: number;
  lead_stage: LeadStage;
  response: string;
  next_action: string;
  recommended_course: string;
  requires_human: boolean;
  reason: string;
  customer_id: string;
  lead_id?: string;
  agent_logs: AgentRun[];
  appointment_slots_available?: string[];
  stripe_payment_url?: string;
}

export interface DashboardStats {
  total_conversations: number;
  qualified_leads: number;
  appointments: number;
  conversions: number;
  revenue: number;
  ai_actions: number;
}

export interface AIInsight {
  headline: string;
  summary: string;
  bottlenecks: string[];
  recommendations: string[];
  generated_at: string;
}
