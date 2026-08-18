import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { 
  getSettings, 
  saveSettings, 
  getCustomer, 
  saveCustomer, 
  getAllCustomers,
  getLead,
  getLeadByCustomerId,
  saveLead,
  getAllLeads,
  addConversationMessage,
  getCustomerConversations,
  getAllConversations,
  saveAppointment,
  getAllAppointments,
  saveFollowup,
  getAllFollowups,
  logAgentRun,
  getAllAgentRuns,
  savePayment,
  getAllPayments,
  calculateDashboardStats,
  seedDemoDataIfEmpty
} from './server/store.js';
import { processCustomerMessageWithGemini, generateAIBusinessInsights } from './server/gemini.js';
import { createStripePaymentLink, isStripeConfigured } from './server/stripe.js';
import { Customer, Lead, ConversationMessage, Appointment, Followup, Payment, AgentRun } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Seed demo data if database is fresh
  await seedDemoDataIfEmpty().catch(err => console.warn('Seed demo error:', err));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Business Settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const updated = await saveSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Customer Chat Endpoint (POST /api/chat)
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, customer_id, customer_name, customer_phone, customer_email } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message field is required' });
      }

      // 1. Identify or Create Customer
      let cId = customer_id;
      if (!cId) {
        cId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      }

      let existingCustomer = await getCustomer(cId);
      const nowStr = new Date().toISOString();

      const customer: Customer = {
        id: cId,
        name: customer_name || existingCustomer?.name || "SkillBridge Learner",
        email: customer_email || existingCustomer?.email || `learner_${cId.substring(5)}@example.com`,
        phone: customer_phone || existingCustomer?.phone || "+91 98000 00000",
        created_at: existingCustomer?.created_at || nowStr,
        last_interaction: nowStr,
        total_conversations: (existingCustomer?.total_conversations || 0) + 1,
      };
      await saveCustomer(customer);

      // 2. Fetch recent conversation history
      const history = await getCustomerConversations(cId);

      // 3. Save incoming customer message
      const custMsg: ConversationMessage = {
        customer_id: cId,
        message,
        sender: 'customer',
        timestamp: nowStr,
      };
      await addConversationMessage(custMsg);

      // 4. Retrieve Business Settings
      const settings = await getSettings();

      // 5. Execute Gemini Agent Pipeline
      const aiResult = await processCustomerMessageWithGemini(message, history, settings, cId);

      // 6. Save AI Response Message
      const aiMsg: ConversationMessage = {
        customer_id: cId,
        message: aiResult.response,
        sender: 'ai',
        intent: aiResult.intent,
        timestamp: new Date().toISOString(),
        ai_response: aiResult.response,
        lead_score: aiResult.lead_score,
      };
      await addConversationMessage(aiMsg);

      // 7. Update or Create Lead
      let existingLead = await getLeadByCustomerId(cId);
      const leadId = existingLead?.id || `lead_${cId.replace('cust_', '')}`;

      const lead: Lead = {
        id: leadId,
        customer_id: cId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        intent: aiResult.intent,
        lead_score: Math.max(existingLead?.lead_score || 0, aiResult.lead_score),
        lead_stage: aiResult.lead_stage,
        interested_service: aiResult.recommended_course || existingLead?.interested_service || "Python Development Course",
        source: existingLead?.source || "Customer Chat",
        created_at: existingLead?.created_at || nowStr,
        updated_at: new Date().toISOString(),
        next_action: aiResult.next_action === 'book_appointment' ? 'Book Counselling Appointment' :
                    aiResult.next_action === 'send_payment_link' ? 'Send Course Payment Link' :
                    'Follow-up with Curriculum Details',
      };
      await saveLead(lead);

      // 8. Record Agent Execution Logs in Firestore
      for (const log of aiResult.agent_logs) {
        await logAgentRun(log);
      }

      // 9. Schedule Follow-up if score is high and not yet converted
      if (aiResult.lead_score >= 50 && aiResult.lead_stage !== 'Converted') {
        const followup: Followup = {
          id: `fup_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          customer_id: cId,
          lead_id: leadId,
          message: `Hi ${customer.name}! We saw you were interested in our ${lead.interested_service}. Would you like to reserve a seat for the upcoming batch?`,
          scheduled_for: new Date(Date.now() + 86400000).toISOString(),
          status: 'Scheduled',
          created_at: new Date().toISOString(),
        };
        await saveFollowup(followup);
      }

      // 10. Check Stripe Payment URL if requested
      let stripeUrl: string | undefined = undefined;
      if (aiResult.next_action === 'send_payment_link' || aiResult.lead_stage === 'Payment Pending') {
        const selectedService = settings.services.find(s => s.name === aiResult.recommended_course) || settings.services[0];
        const linkRes = await createStripePaymentLink(selectedService.name, selectedService.price, cId, leadId);
        if (linkRes.url) {
          stripeUrl = linkRes.url;
        }
      }

      return res.json({
        ...aiResult,
        lead_id: leadId,
        stripe_payment_url: stripeUrl,
      });
    } catch (err: any) {
      console.error('Error in POST /api/chat:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Leads API
  app.get('/api/leads', async (req, res) => {
    try {
      const leads = await getAllLeads();
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/leads/:id', async (req, res) => {
    try {
      const lead = await getLead(req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json(lead);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/leads', async (req, res) => {
    try {
      const newLead: Lead = {
        id: req.body.id || `lead_${Date.now()}`,
        customer_id: req.body.customer_id || `cust_${Date.now()}`,
        name: req.body.name || 'Anonymous Lead',
        email: req.body.email || '',
        phone: req.body.phone || '',
        intent: req.body.intent || 'course_enquiry',
        lead_score: req.body.lead_score || 50,
        lead_stage: req.body.lead_stage || 'New',
        interested_service: req.body.interested_service || 'Python Development Course',
        source: req.body.source || 'Manual Entry',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        next_action: req.body.next_action || 'Contact Lead',
      };
      const saved = await saveLead(newLead);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/leads/:id', async (req, res) => {
    try {
      const existing = await getLead(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Lead not found' });

      const updatedLead: Lead = {
        ...existing,
        ...req.body,
        updated_at: new Date().toISOString(),
      };
      await saveLead(updatedLead);
      res.json(updatedLead);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Customers API
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await getAllCustomers();
      res.json(customers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const cust: Customer = {
        id: req.body.id || `cust_${Date.now()}`,
        name: req.body.name || 'New Customer',
        email: req.body.email || '',
        phone: req.body.phone || '',
        created_at: new Date().toISOString(),
        last_interaction: new Date().toISOString(),
        total_conversations: 1,
      };
      const saved = await saveCustomer(cust);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Conversations API
  app.get('/api/conversations', async (req, res) => {
    try {
      const customerId = req.query.customer_id as string;
      if (customerId) {
        const msgs = await getCustomerConversations(customerId);
        return res.json(msgs);
      }
      const allMsgs = await getAllConversations();
      res.json(allMsgs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Appointments API
  app.get('/api/appointments', async (req, res) => {
    try {
      const apts = await getAllAppointments();
      res.json(apts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/appointments', async (req, res) => {
    try {
      const { customer_id, customer_name, service, date, time } = req.body;
      const apt: Appointment = {
        id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        customer_id: customer_id || 'cust_demo',
        customer_name: customer_name || 'Learner',
        service: service || 'SkillBridge Counselling Session',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '4:00 PM',
        status: 'Scheduled',
        created_at: new Date().toISOString(),
      };
      await saveAppointment(apt);

      // Update lead stage to Appointment
      if (customer_id) {
        const lead = await getLeadByCustomerId(customer_id);
        if (lead) {
          lead.lead_stage = 'Appointment';
          lead.next_action = 'Conduct Counselling Session';
          lead.updated_at = new Date().toISOString();
          await saveLead(lead);
        }
      }

      // Log Agent Action
      await logAgentRun({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent: 'Conversion Agent',
        customer_id: customer_id || 'cust_demo',
        intent: 'book_appointment',
        decision: `Appointment successfully booked for ${apt.date} at ${apt.time}.`,
        action: 'Created appointment record in Firestore',
        tool_called: 'appointment_scheduler',
        tool_result: 'Appointment status: Scheduled',
        status: 'success',
        reasoning_summary: 'Customer confirmed preferred counselling slot.',
      });

      res.json(apt);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Followups API
  app.get('/api/followups', async (req, res) => {
    try {
      const fups = await getAllFollowups();
      res.json(fups);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/followups', async (req, res) => {
    try {
      const fup: Followup = {
        id: `fup_${Date.now()}`,
        customer_id: req.body.customer_id,
        lead_id: req.body.lead_id,
        message: req.body.message,
        scheduled_for: req.body.scheduled_for || new Date(Date.now() + 86400000).toISOString(),
        status: 'Scheduled',
        created_at: new Date().toISOString(),
      };
      await saveFollowup(fup);
      res.json(fup);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Agent Execution Logs API
  app.get('/api/agent-runs', async (req, res) => {
    try {
      const runs = await getAllAgentRuns();
      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Payments API & Stripe
  app.get('/api/payments', async (req, res) => {
    try {
      const payments = await getAllPayments();
      res.json({
        stripe_configured: isStripeConfigured(),
        payments,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/payment/create-link', async (req, res) => {
    try {
      const { service_name, amount, customer_id, lead_id } = req.body;
      const result = await createStripePaymentLink(service_name, amount, customer_id, lead_id);
      
      if (!result.url) {
        return res.status(400).json({ 
          error: result.error || 'Payment integration not configured',
          stripe_configured: isStripeConfigured(),
        });
      }

      res.json({ payment_url: result.url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Stripe Webhook (Receives real Stripe payment events)
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret || !sig) {
      return res.status(400).send('Webhook secret or signature missing');
    }

    try {
      const { getStripe } = await import('./server/stripe.js');
      const stripe = getStripe();
      if (!stripe) return res.status(400).send('Stripe not initialized');

      const event = stripe.webhooks.constructEvent(req.body, sig as string, secret);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const customerId = session.metadata?.customer_id;
        const leadId = session.metadata?.lead_id;

        const payment: Payment = {
          id: `pay_${session.id}`,
          customer_id: customerId || 'cust_stripe',
          lead_id: leadId || 'lead_stripe',
          amount: (session.amount_total || 0) / 100,
          currency: (session.currency || 'inr').toUpperCase(),
          status: 'paid',
          stripe_payment_id: session.payment_intent || session.id,
          created_at: new Date().toISOString(),
        };
        await savePayment(payment);

        if (leadId) {
          const lead = await getLead(leadId);
          if (lead) {
            lead.lead_stage = 'Converted';
            lead.next_action = 'Send Welcome Kit & LMS Access';
            lead.updated_at = new Date().toISOString();
            await saveLead(lead);
          }
        }
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error('Stripe webhook error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Dashboard Stats & AI Insights
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await calculateDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/dashboard/insights', async (req, res) => {
    try {
      const stats = await calculateDashboardStats();
      const insight = await generateAIBusinessInsights(stats);
      res.json(insight);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed demo data manually if requested
  app.post('/api/seed', async (req, res) => {
    try {
      await seedDemoDataIfEmpty();
      res.json({ message: 'Demo data seeded successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Swagger / OpenAPI docs info endpoint
  app.get('/docs', (req, res) => {
    res.json({
      title: "BizPilot AI - FastAPI & Express REST Documentation",
      version: "1.0.0",
      description: "BizPilot AI Operations Engine for Build with Gemini XPRIZE",
      endpoints: [
        { path: "/api/chat", method: "POST", summary: "Process customer message with 5-agent Gemini pipeline" },
        { path: "/api/leads", method: "GET / POST", summary: "Retrieve or create sales leads" },
        { path: "/api/leads/:id", method: "GET / PATCH", summary: "Lead details and stage updater" },
        { path: "/api/customers", method: "GET / POST", summary: "Customer directory management" },
        { path: "/api/conversations", method: "GET", summary: "Conversation history logs" },
        { path: "/api/appointments", method: "GET / POST", summary: "Book counselling appointments" },
        { path: "/api/followups", method: "GET / POST", summary: "Scheduled automated follow-ups" },
        { path: "/api/agent-runs", method: "GET", summary: "Live agent execution logs" },
        { path: "/api/payments", method: "GET", summary: "Payment records and Stripe status" },
        { path: "/api/payment/create-link", method: "POST", summary: "Generate Stripe Payment Link" },
        { path: "/api/dashboard/stats", method: "GET", summary: "Calculated KPI metrics" },
        { path: "/api/dashboard/insights", method: "GET", summary: "AI-generated business insights" },
        { path: "/api/settings", method: "GET / POST", summary: "Business FAQ and pricing configuration" }
      ]
    });
  });

  // Vite middleware in Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BizPilot AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
