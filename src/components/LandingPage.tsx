import React from 'react';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Users, 
  Cpu, 
  Database,
  BarChart3,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onStartChat: () => void;
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  onOpenDashboard
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-violet-600/15 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built for Build with Gemini XPRIZE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            BizPilot AI
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              Turn customer conversations into business actions.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal max-w-3xl mx-auto leading-relaxed">
            An AI-powered operations agent that helps small businesses qualify leads, book appointments, automate follow-ups, and support conversions.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartChat}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-indigo-200" />
              <span>Try AI Agent</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenDashboard}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>View Dashboard</span>
            </button>
          </div>

          {/* Quick Metrics Banner */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-slate-800/80 mt-12">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium">Instant Response</p>
              <p className="text-2xl font-bold text-white mt-1">&lt; 1.2s</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium">Lead Qualification</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">0–100 Score</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium">Data Persistence</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">Cloud Firestore</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium">Multi-Agent Engine</p>
              <p className="text-2xl font-bold text-violet-400 mt-1">5 AI Agents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">The Problem</h2>
            <p className="text-3xl font-extrabold text-white">
              Small businesses lose 60%+ of potential customers to delayed responses & manual follow-up fatigue.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Missed Enquiries Off-Hours</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Customers ask questions on WhatsApp or website chat at night or during busy work hours. Without immediate answers, they seek competitors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                02
              </div>
              <h3 className="text-lg font-bold text-white">No Lead Intent Scoring</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Business owners spend hours treating all enquiries equally instead of focusing on high-intent buyers ready to enroll or pay.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Friction in Appointment Booking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Manual back-and-forth scheduling creates booking friction. Without automated slots and payment links, leads go cold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How BizPilot Works Workflow */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Architecture & Workflow</h2>
          <p className="text-3xl font-extrabold text-white">
            End-to-End Operational Workflow Engine
          </p>
        </div>

        <div className="relative p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <MessageSquare className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Step 1</p>
              <h4 className="font-bold text-white text-sm">Customer Message</h4>
              <p className="text-xs text-slate-400">User sends inquiry on WhatsApp / Chat simulator</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Cpu className="w-8 h-8 text-violet-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-violet-300 uppercase tracking-wider">Step 2</p>
              <h4 className="font-bold text-white text-sm">Gemini AI Agent</h4>
              <p className="text-xs text-slate-400">Intent detection, lead scoring & decision evaluation</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <Database className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Step 3</p>
              <h4 className="font-bold text-white text-sm">Firestore & Action</h4>
              <p className="text-xs text-slate-400">Updates leads, appointments, followups & agent logs</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <BarChart3 className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Step 4</p>
              <h4 className="font-bold text-white text-sm">Owner Dashboard</h4>
              <p className="text-xs text-slate-400">Live stats, AI execution logs & Stripe payments</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">5 Specialized Logical AI Agents</h2>
            <p className="text-3xl font-extrabold text-white">
              A complete AI workforce designed for small business operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">1. Reception Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Understands customer intent, answers complex course FAQs from knowledge base, and gathers customer contact information seamlessly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">2. Sales Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates buying signals and computes a 0–100 Lead Score. Categorizes leads into Low, Medium, High, and Very High intent stages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">3. Conversion Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recommends free 1-on-1 counselling appointment slots, creates appointment records in Firestore, and generates Stripe payment links.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">4. Follow-up Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects required follow-ups, schedules tasks in the system queue, and drafts personalized course syllabus follow-up messages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 lg:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">5. Business Analyst Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates real KPI metrics, identifies conversion drop-off bottlenecks, and outputs strategic business growth recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Pricing Plans</h2>
          <p className="text-3xl font-extrabold text-white">
            Accessible, Transparent Pricing for Small Businesses
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter</span>
              <div className="text-3xl font-extrabold text-white">
                ₹1,499 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <p className="text-xs text-slate-400">Ideal for single-person businesses and tutors.</p>
              <ul className="space-y-2 text-xs text-slate-300 pt-4">
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Up to 250 conversations / mo</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Reception & Sales Agents</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Cloud Firestore Persistence</span></li>
              </ul>
            </div>
            <button onClick={onStartChat} className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors">
              Get Started
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 shadow-2xl flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Growth Pro</span>
              <div className="text-3xl font-extrabold text-white">
                ₹3,999 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <p className="text-xs text-indigo-200">For academies and service providers growing fast.</p>
              <ul className="space-y-2 text-xs text-slate-200 pt-4">
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Unlimited Conversations</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>All 5 Logical AI Agents</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Automated Appointment Booking</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Stripe Payment Link Integration</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>AI Business Insights Engine</span></li>
              </ul>
            </div>
            <button onClick={onStartChat} className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all">
              Try Growth Pro
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Custom</span>
              <div className="text-3xl font-extrabold text-white">Custom</div>
              <p className="text-xs text-slate-400">For multi-branch academies with custom CRM integrations.</p>
              <ul className="space-y-2 text-xs text-slate-300 pt-4">
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Dedicated Cloud Run Instance</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Custom WhatsApp API Gateway</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span>SLA & Dedicated Account Manager</span></li>
              </ul>
            </div>
            <button onClick={onOpenDashboard} className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>BizPilot AI Operations Platform • Built with Gemini XPRIZE Hackathon Submission</p>
      </footer>
    </div>
  );
};
