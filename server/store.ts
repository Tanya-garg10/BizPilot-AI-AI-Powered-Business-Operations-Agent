import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc 
} from 'firebase/firestore';
import { db } from './dbConfig.js';
import { 
  Lead, 
  Customer, 
  ConversationMessage, 
  Appointment, 
  Followup, 
  AgentRun, 
  Payment, 
  BusinessSettings, 
  DashboardStats 
} from '../src/types.js';

// Default SkillBridge Academy Settings
export const DEFAULT_SETTINGS: BusinessSettings = {
  business_name: "SkillBridge Academy",
  description: "Premier tech skills training academy offering industry-aligned development and analytics certification courses.",
  contact_phone: "+91 98765 43210",
  contact_email: "support@skillbridge.academy",
  services: [
    {
      id: "course-python",
      name: "Python Development Course",
      price: 999,
      duration: "6 Weeks (Live + Recorded)",
      description: "Master Python programming from scratch to advanced web scraping, automation, and backend development."
    },
    {
      id: "course-webdev",
      name: "Web Development Course",
      price: 1499,
      duration: "8 Weeks (Hands-on Projects)",
      description: "Full-stack web development covering React, TypeScript, Node.js, Express, and database integration."
    },
    {
      id: "course-data",
      name: "Data Analytics Course",
      price: 1999,
      duration: "10 Weeks (Case Studies)",
      description: "Comprehensive data analytics with SQL, Python Pandas, Data Visualization, and Business Intelligence."
    }
  ],
  faqs: [
    {
      question: "What is the duration of the courses?",
      answer: "Python Development is 6 weeks, Web Development is 8 weeks, and Data Analytics is 10 weeks."
    },
    {
      question: "What are the class timings?",
      answer: "Live sessions are held on weekdays from 7:00 PM to 8:30 PM IST. Recorded lectures and weekend mentor Q&A slots are also provided."
    },
    {
      question: "Are these courses suitable for beginners?",
      answer: "Yes! All courses start from zero prerequisites and build up to job-ready practical projects."
    },
    {
      question: "Will I get a certificate upon completion?",
      answer: "Yes, you receive an industry-recognized Verified Certificate of Completion after submitting final capstone projects."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept Credit/Debit Cards, UPI, NetBanking, and Stripe online payments."
    },
    {
      question: "Is 1-on-1 career counselling available?",
      answer: "Yes, free 1-on-1 counselling sessions with industry experts can be booked anytime before or after enrollment."
    },
    {
      question: "What is the refund policy?",
      answer: "We offer a 100% full refund within 7 days of course start if you are not completely satisfied."
    }
  ]
};

// Memory fallback cache in case Firestore is unreachable or offline
const memoryStore = {
  settings: DEFAULT_SETTINGS,
  customers: new Map<string, Customer>(),
  leads: new Map<string, Lead>(),
  conversations: [] as ConversationMessage[],
  appointments: new Map<string, Appointment>(),
  followups: new Map<string, Followup>(),
  agentRuns: [] as AgentRun[],
  payments: new Map<string, Payment>(),
};

// --- Settings ---
export async function getSettings(): Promise<BusinessSettings> {
  try {
    const docRef = doc(db, 'business_settings', 'config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BusinessSettings;
    } else {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    console.warn('Firestore getSettings error, using memory store:', err);
    return memoryStore.settings;
  }
}

export async function saveSettings(settings: BusinessSettings): Promise<BusinessSettings> {
  try {
    const docRef = doc(db, 'business_settings', 'config');
    await setDoc(docRef, settings, { merge: true });
    memoryStore.settings = settings;
    return settings;
  } catch (err) {
    console.warn('Firestore saveSettings error, using memory store:', err);
    memoryStore.settings = settings;
    return settings;
  }
}

// --- Customers ---
export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const docRef = doc(db, 'customers', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Customer;
    }
  } catch (err) {
    console.warn('Firestore getCustomer error:', err);
  }
  return memoryStore.customers.get(id) || null;
}

export async function saveCustomer(customer: Customer): Promise<Customer> {
  try {
    const docRef = doc(db, 'customers', customer.id);
    await setDoc(docRef, customer, { merge: true });
  } catch (err) {
    console.warn('Firestore saveCustomer error:', err);
  }
  memoryStore.customers.set(customer.id, customer);
  return customer;
}

export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const snap = await getDocs(collection(db, 'customers'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
    }
  } catch (err) {
    console.warn('Firestore getAllCustomers error:', err);
  }
  return Array.from(memoryStore.customers.values());
}

// --- Leads ---
export async function getLead(id: string): Promise<Lead | null> {
  try {
    const docRef = doc(db, 'leads', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Lead;
    }
  } catch (err) {
    console.warn('Firestore getLead error:', err);
  }
  return memoryStore.leads.get(id) || null;
}

export async function getLeadByCustomerId(customerId: string): Promise<Lead | null> {
  try {
    const q = query(collection(db, 'leads'), where('customer_id', '==', customerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0];
      return { id: docData.id, ...docData.data() } as Lead;
    }
  } catch (err) {
    console.warn('Firestore getLeadByCustomerId error:', err);
  }
  for (const lead of memoryStore.leads.values()) {
    if (lead.customer_id === customerId) return lead;
  }
  return null;
}

export async function saveLead(lead: Lead): Promise<Lead> {
  try {
    const docRef = doc(db, 'leads', lead.id);
    await setDoc(docRef, lead, { merge: true });
  } catch (err) {
    console.warn('Firestore saveLead error:', err);
  }
  memoryStore.leads.set(lead.id, lead);
  return lead;
}

export async function getAllLeads(): Promise<Lead[]> {
  try {
    const snap = await getDocs(collection(db, 'leads'));
    if (!snap.empty) {
      const leads = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
      return leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  } catch (err) {
    console.warn('Firestore getAllLeads error:', err);
  }
  return Array.from(memoryStore.leads.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// --- Conversations ---
export async function addConversationMessage(msg: ConversationMessage): Promise<ConversationMessage> {
  try {
    const colRef = collection(db, 'conversations');
    const docRef = await addDoc(colRef, msg);
    msg.id = docRef.id;
  } catch (err) {
    console.warn('Firestore addConversationMessage error:', err);
    msg.id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }
  memoryStore.conversations.push(msg);
  return msg;
}

export async function getCustomerConversations(customerId: string): Promise<ConversationMessage[]> {
  try {
    const q = query(collection(db, 'conversations'), where('customer_id', '==', customerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ConversationMessage));
      return msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
  } catch (err) {
    console.warn('Firestore getCustomerConversations error:', err);
  }
  return memoryStore.conversations
    .filter(m => m.customer_id === customerId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function getAllConversations(): Promise<ConversationMessage[]> {
  try {
    const snap = await getDocs(collection(db, 'conversations'));
    if (!snap.empty) {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ConversationMessage));
      return msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (err) {
    console.warn('Firestore getAllConversations error:', err);
  }
  return memoryStore.conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// --- Appointments ---
export async function saveAppointment(apt: Appointment): Promise<Appointment> {
  try {
    const docRef = doc(db, 'appointments', apt.id);
    await setDoc(docRef, apt, { merge: true });
  } catch (err) {
    console.warn('Firestore saveAppointment error:', err);
  }
  memoryStore.appointments.set(apt.id, apt);
  return apt;
}

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const snap = await getDocs(collection(db, 'appointments'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
    }
  } catch (err) {
    console.warn('Firestore getAllAppointments error:', err);
  }
  return Array.from(memoryStore.appointments.values());
}

// --- Followups ---
export async function saveFollowup(fup: Followup): Promise<Followup> {
  try {
    const docRef = doc(db, 'followups', fup.id);
    await setDoc(docRef, fup, { merge: true });
  } catch (err) {
    console.warn('Firestore saveFollowup error:', err);
  }
  memoryStore.followups.set(fup.id, fup);
  return fup;
}

export async function getAllFollowups(): Promise<Followup[]> {
  try {
    const snap = await getDocs(collection(db, 'followups'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Followup));
    }
  } catch (err) {
    console.warn('Firestore getAllFollowups error:', err);
  }
  return Array.from(memoryStore.followups.values());
}

// --- Agent Execution Runs ---
export async function logAgentRun(run: AgentRun): Promise<AgentRun> {
  try {
    const docRef = doc(db, 'agent_runs', run.id);
    await setDoc(docRef, run, { merge: true });
  } catch (err) {
    console.warn('Firestore logAgentRun error:', err);
  }
  memoryStore.agentRuns.unshift(run);
  return run;
}

export async function getAllAgentRuns(): Promise<AgentRun[]> {
  try {
    const snap = await getDocs(collection(db, 'agent_runs'));
    if (!snap.empty) {
      const runs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AgentRun));
      return runs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (err) {
    console.warn('Firestore getAllAgentRuns error:', err);
  }
  return memoryStore.agentRuns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// --- Payments ---
export async function savePayment(payment: Payment): Promise<Payment> {
  try {
    const docRef = doc(db, 'payments', payment.id);
    await setDoc(docRef, payment, { merge: true });
  } catch (err) {
    console.warn('Firestore savePayment error:', err);
  }
  memoryStore.payments.set(payment.id, payment);
  return payment;
}

export async function getAllPayments(): Promise<Payment[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
    }
  } catch (err) {
    console.warn('Firestore getAllPayments error:', err);
  }
  return Array.from(memoryStore.payments.values());
}

// --- Dashboard Stats Calculation from Stored Data ---
export async function calculateDashboardStats(): Promise<DashboardStats> {
  const conversations = await getAllConversations();
  const leads = await getAllLeads();
  const appointments = await getAllAppointments();
  const agentRuns = await getAllAgentRuns();
  const payments = await getAllPayments();

  const qualifiedLeads = leads.filter(l => l.lead_score >= 31).length;
  const conversions = leads.filter(l => l.lead_stage === 'Converted').length;

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    total_conversations: conversations.length,
    qualified_leads: qualifiedLeads,
    appointments: appointments.length,
    conversions: conversions,
    revenue: totalRevenue,
    ai_actions: agentRuns.length,
  };
}

// Seed function for demo state if DB is empty
export async function seedDemoDataIfEmpty(): Promise<void> {
  const customers = await getAllCustomers();
  if (customers.length > 0) return; // already seeded or has user data

  const now = new Date();
  const tMinusMin = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

  // Demo Customer 1: Aarav Sharma (High Intent, Python Course, Appointment Booked)
  const cust1: Customer = {
    id: "cust_aarav_101",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98112 34567",
    created_at: tMinusMin(120),
    last_interaction: tMinusMin(10),
    total_conversations: 4,
  };
  await saveCustomer(cust1);

  const lead1: Lead = {
    id: "lead_aarav_101",
    customer_id: cust1.id,
    name: cust1.name,
    email: cust1.email,
    phone: cust1.phone,
    intent: "course_enquiry",
    lead_score: 85,
    lead_stage: "Appointment",
    interested_service: "Python Development Course",
    source: "WhatsApp Chat",
    created_at: tMinusMin(120),
    updated_at: tMinusMin(10),
    next_action: "Conduct 1-on-1 Counselling",
  };
  await saveLead(lead1);

  const apt1: Appointment = {
    id: "apt_101",
    customer_id: cust1.id,
    customer_name: cust1.name,
    service: "Python Development Course - 1-on-1 Counselling",
    date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
    time: "4:00 PM",
    status: "Scheduled",
    created_at: tMinusMin(10),
  };
  await saveAppointment(apt1);

  // Demo Customer 2: Priya Patel (Converted, Paid WebDev)
  const cust2: Customer = {
    id: "cust_priya_102",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98220 12345",
    created_at: tMinusMin(300),
    last_interaction: tMinusMin(45),
    total_conversations: 6,
  };
  await saveCustomer(cust2);

  const lead2: Lead = {
    id: "lead_priya_102",
    customer_id: cust2.id,
    name: cust2.name,
    email: cust2.email,
    phone: cust2.phone,
    intent: "purchase_enrollment",
    lead_score: 95,
    lead_stage: "Converted",
    interested_service: "Web Development Course",
    source: "Website Direct",
    created_at: tMinusMin(300),
    updated_at: tMinusMin(45),
    next_action: "Send Onboarding Kit & LMS Access",
  };
  await saveLead(lead2);

  const pay2: Payment = {
    id: "pay_102",
    customer_id: cust2.id,
    lead_id: lead2.id,
    amount: 1499,
    currency: "INR",
    status: "paid",
    stripe_payment_id: "pi_stripe_live_demo_9822",
    created_at: tMinusMin(45),
  };
  await savePayment(pay2);

  // Demo Customer 3: Rahul Verma (Medium Intent, Data Analytics Enquiry)
  const cust3: Customer = {
    id: "cust_rahul_103",
    name: "Rahul Verma",
    email: "rahul.v@example.com",
    phone: "+91 97331 99887",
    created_at: tMinusMin(60),
    last_interaction: tMinusMin(5),
    total_conversations: 2,
  };
  await saveCustomer(cust3);

  const lead3: Lead = {
    id: "lead_rahul_103",
    customer_id: cust3.id,
    name: cust3.name,
    email: cust3.email,
    phone: cust3.phone,
    intent: "pricing_inquiry",
    lead_score: 55,
    lead_stage: "Qualified",
    interested_service: "Data Analytics Course",
    source: "Instagram Ad",
    created_at: tMinusMin(60),
    updated_at: tMinusMin(5),
    next_action: "Follow up with Course Syllabus PDF",
  };
  await saveLead(lead3);

  const followup3: Followup = {
    id: "fup_103",
    customer_id: cust3.id,
    lead_id: lead3.id,
    message: "Hi Rahul! Here is the detailed Data Analytics curriculum PDF. Let us know if you'd like to reserve a seat for the upcoming cohort!",
    scheduled_for: new Date(now.getTime() + 86400000 * 2).toISOString(),
    status: "Scheduled",
    created_at: tMinusMin(5),
  };
  await saveFollowup(followup3);

  // Add Conversations for Aarav
  await addConversationMessage({
    customer_id: cust1.id,
    message: "Hi, I want to join the Python course. What are the timings?",
    sender: "customer",
    intent: "course_enquiry",
    timestamp: tMinusMin(120),
  });
  await addConversationMessage({
    customer_id: cust1.id,
    message: "Welcome to SkillBridge Academy! Our Python Development Course is ₹999 for a 6-week live program. Live sessions are on weekdays from 7:00 PM to 8:30 PM IST. Would you like to schedule a free 1-on-1 counselling session?",
    sender: "ai",
    intent: "course_enquiry",
    lead_score: 85,
    timestamp: tMinusMin(119),
  });

  // Log Agent Execution Runs
  await logAgentRun({
    id: "run_101",
    timestamp: tMinusMin(120),
    agent: "Reception Agent",
    customer_id: cust1.id,
    intent: "course_enquiry",
    decision: "Identified interest in Python Development Course and timing queries.",
    action: "Retrieved FAQ context for course duration and session schedule.",
    tool_called: "query_business_faq",
    tool_result: "Found matching service: Python Development Course (₹999)",
    status: "success",
    reasoning_summary: "Customer asked specific question about Python course timing. Intent is genuine product inquiry.",
  });

  await logAgentRun({
    id: "run_102",
    timestamp: tMinusMin(120),
    agent: "Sales Agent",
    customer_id: cust1.id,
    intent: "course_enquiry",
    decision: "Scored lead at 85/100 (Very High Intent).",
    action: "Assigned stage: Qualified",
    tool_called: "lead_scoring_engine",
    tool_result: "Lead score updated to 85",
    status: "success",
    reasoning_summary: "Customer expressed immediate course intent and queried schedule specifics.",
  });

  await logAgentRun({
    id: "run_103",
    timestamp: tMinusMin(120),
    agent: "Conversion Agent",
    customer_id: cust1.id,
    intent: "course_enquiry",
    decision: "Recommended free 1-on-1 counselling appointment.",
    action: "Generated appointment booking prompt with available slots.",
    tool_called: "appointment_scheduler",
    tool_result: "Proposed slots: 10:00 AM, 12:00 PM, 2:00 PM, 4:00 PM, 6:00 PM",
    status: "success",
    reasoning_summary: "High-intent lead benefits from personalized academic counselling to drive enrollment.",
  });

  await logAgentRun({
    id: "run_104",
    timestamp: tMinusMin(10),
    agent: "Follow-up Agent",
    customer_id: cust1.id,
    intent: "book_appointment",
    decision: "Appointment confirmed for tomorrow at 4:00 PM.",
    action: "Scheduled reminder notification.",
    tool_called: "followup_task_creator",
    tool_result: "Reminder set 2 hours before appointment",
    status: "success",
    reasoning_summary: "Automated booking confirmation and pre-session reminder created.",
  });
}
