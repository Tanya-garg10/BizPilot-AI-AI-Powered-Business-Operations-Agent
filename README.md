# BizPilot AI — Operations Engine for Small Businesses

> **Build with Gemini XPRIZE Submission**  
> BizPilot AI is an AI-powered operations platform for small businesses that turns customer conversations into qualified leads, appointments, automated follow-ups, and conversion opportunities.

## 🚀 Problem

Small business owners (such as SkillBridge Academy, local tutors, service providers, clinics, and consultants) lose over **60% of prospective customers** due to:
1. **Delayed responses** to off-hour enquiries on WhatsApp or website chat.
2. **Lack of lead intent scoring**, spending equal effort on casual browsers versus high-intent buyers.
3. **Manual appointment scheduling friction** leading to lead drop-off before counselling sessions.
4. **Follow-up fatigue**, missing timely reminders for interested prospects.

## ✨ Solution

**BizPilot AI** introduces a 5-Agent logical AI workforce powered by **Google Gemini 2.5** and **Cloud Firestore**:

$$\text{Customer Message} \longrightarrow \text{Gemini AI Engine} \longrightarrow \text{Intent \ Score} \longrightarrow \text{Firestore State} \longrightarrow \text{Action \ Dashboard}$$

## 🤖 AI Agent Architecture

BizPilot AI executes a lightweight, robust 5-agent pipeline:

1. **Reception Agent**: Identifies intent, answers FAQs (course duration, fees, timings, certificates, refund policy), and captures contact info.
2. **Sales Agent**: Evaluates buying signals and computes a **0–100 Lead Score** (Low, Medium, High, Very High Intent).
3. **Conversion Agent**: Recommends 1-on-1 academic counselling appointment slots and generates direct Stripe Payment Links.
4. **Follow-up Agent**: Detects required follow-ups and queues personalized curriculum reminders.
5. **Business Analyst Agent**: Aggregates stored operational data and generates actionable conversion insights.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend (Full-stack)**: Node.js, Express, TypeScript, tsx, esbuild.
- **Python Backend**: FastAPI, Pydantic, Uvicorn (available under `/backend/`).
- **AI**: `@google/genai` (GoogleGenAI SDK) powered by `gemini-2.5-flash`.
- **Database**: Google Cloud Firestore.
- **Payments**: Stripe API & Webhooks.
- **Deployment**: Docker, Google Cloud Run, Cloud Build (`cloudbuild.yaml`).

## 📂 Project Structure

```
.
├── server.ts                    # Express + Vite backend entry point
├── server/
│   ├── dbConfig.ts              # Firebase Firestore initialization
│   ├── store.ts                 # Firestore data access layer & memory fallback
│   ├── gemini.ts                # Gemini 2.5 multi-agent execution pipeline
│   └── stripe.ts                # Stripe payment link creation & webhook handler
├── src/
│   ├── App.tsx                  # Main React application shell
│   ├── types.ts                 # Global TypeScript interfaces
│   └── components/
│       ├── Header.tsx           # Global navigation & view mode switcher
│       ├── Sidebar.tsx          # Dashboard navigation sidebar
│       ├── LandingPage.tsx      # Marketing & workflow overview landing page
│       ├── CustomerChat.tsx     # WhatsApp-style AI customer chat simulator
│       ├── OverviewTab.tsx      # KPI cards, conversion funnel & AI insights
│       ├── ConversationsTab.tsx # Customer chat logs viewer
│       ├── LeadsTab.tsx         # Lead management pipeline table & stage editor
│       ├── AppointmentsTab.tsx  # Counselling appointments schedule
│       ├── AIActivityTab.tsx    # Live agent execution logs (agent_runs)
│       ├── PaymentsTab.tsx      # Payment history & Stripe link generator
│       └── SettingsTab.tsx      # Business configuration & FAQ manager
├── backend/                     # Standalone Python FastAPI backend
│   ├── main.py
│   ├── models.py
│   ├── agents.py
│   ├── requirements.txt
│   └── Dockerfile
├── firebase-applet-config.json  # Firebase Project Configuration
├── firestore.rules              # Firestore Security Rules
├── Dockerfile                   # Cloud Run production Dockerfile
├── cloudbuild.yaml              # Google Cloud Build deployment pipeline
├── metadata.json                # AI Studio Metadata
└── README.md
```

## ⚙️ Local Setup & Environment Variables

Create a `.env` file at the root (use `.env.example` as a template):

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GOOGLE_CLOUD_PROJECT="gen-lang-client-0256879183"
FIRESTORE_DATABASE="(default)"
```

### Install Dependencies & Start App

```bash
# Start full-stack Express + React dev server
npm run dev
```

The application will run on `http://localhost:3000`.

## ☁️ Google Cloud Run Deployment Instructions

### 1. Enable Required GCP APIs
```bash
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       firestore.googleapis.com \
                       generativelanguage.googleapis.com
```

### 2. Deploy via Cloud Build
```bash
gcloud builds submit --config cloudbuild.yaml .
```

### 3. Deploy Direct to Cloud Run
```bash
gcloud run deploy bizpilot-ai \
  --image gcr.io/$PROJECT_ID/bizpilot-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY
```

## 📜 API Documentation

FastAPI / Express Swagger endpoint documentation is available at `/docs` when running the application.

## 🔮 Future Roadmap

The following features and enhancements are planned for upcoming versions of BizPilot AI:

### 🤖 AI & Agent Enhancements
- [ ] **Voice Agent Integration** — Support for voice-based customer interactions via Google Gemini Live API.
- [ ] **Multi-language Support** — Detect and respond in the customer's preferred language (Hindi, Spanish, French, etc.).
- [ ] **Sentiment Analysis** — Real-time emotional scoring to prioritize distressed or high-urgency leads.
- [ ] **Agent Memory** — Persistent long-term memory across sessions using Firestore for deeper personalization.

### 📱 Platform Integrations
- [ ] **WhatsApp Business API** — Native WhatsApp chat integration for real-world deployment.
- [ ] **Google Calendar Sync** — Auto-sync confirmed appointments to the business owner's Google Calendar.
- [ ] **Email Follow-ups** — Automated email sequences via Gmail API or SendGrid for lead nurturing.
- [ ] **CRM Integrations** — Push qualified leads directly to HubSpot, Salesforce, or Zoho CRM.

### 📊 Analytics & Reporting
- [ ] **Advanced Conversion Funnel** — Visual drop-off analysis at each stage of the lead pipeline.
- [ ] **Revenue Forecasting** — AI-driven revenue predictions based on historical lead conversion rates.
- [ ] **Exportable Reports** — PDF/CSV export of leads, appointments, and payment summaries.
- [ ] **Custom KPI Dashboards** — Business owners can configure their own metrics and alerts.

### 🔐 Security & Scale
- [ ] **Role-Based Access Control (RBAC)** — Staff-level access with restricted permissions.
- [ ] **Multi-tenant Architecture** — Support for multiple businesses on a single deployment.
- [ ] **SOC 2 Compliance** — Data encryption, audit logs, and compliance reporting.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve BizPilot AI, follow these steps:

1. **Fork** the repository
2. **Create** a new branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make** your changes and commit
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request on GitHub

### Guidelines
- Follow existing code style and TypeScript conventions.
- Write clear, descriptive commit messages.
- Test your changes locally before submitting a PR.
- For major changes, open an issue first to discuss what you'd like to change.

## 🛠️ Made With

BizPilot AI was built with love using the following technologies:

| Technology | Purpose |
|---|---|
| [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/) | Core AI engine powering all 5 agents |
| [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/) | Frontend UI framework |
| [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) | Type-safe development |
| [![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) | Lightning-fast build tool |
| [![Firebase](https://img.shields.io/badge/Firestore-Cloud-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/) | Real-time database & storage |
| [![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com/) | Payment processing & webhooks |
| [![Google Cloud](https://img.shields.io/badge/Google%20Cloud%20Run-Deploy-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run) | Serverless deployment |
| [![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/) | Python backend API |
| [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/) | Full-stack server runtime |

<div align="center">
  <p>Built with ❤️ for the <strong>Build with Gemini XPRIZE Hackathon</strong></p>
  <p>⭐ Star this repo if you found it useful!</p>
</div>
