import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  CheckCircle, 
  Calendar, 
  Clock, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Mail, 
  Info,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ChatResponse, ConversationMessage, AgentRun } from '../types';

interface CustomerChatProps {
  onAppointmentBooked?: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CustomerChat: React.FC<CustomerChatProps> = ({ onAppointmentBooked, showToast }) => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'customer' | 'ai';
    text: string;
    timestamp: string;
    intent?: string;
    leadScore?: number;
    nextAction?: string;
    agentLogs?: AgentRun[];
    appointmentSlots?: string[];
    stripeUrl?: string;
    bookedSlot?: string;
  }>>([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: "Hello! Welcome to SkillBridge Academy. How can I help you today? Ask me about our Python, Web Development, or Data Analytics courses!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('Aarav Sharma');
  const [customerPhone, setCustomerPhone] = useState('+91 98112 34567');
  const [customerEmail, setCustomerEmail] = useState('aarav.sharma@example.com');
  const [customerId] = useState(`cust_sim_${Math.floor(1000 + Math.random() * 9000)}`);
  const [expandedLogsId, setExpandedLogsId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Hi, I want to join the Python course.",
    "What are the class timings?",
    "Is there a certificate provided?",
    "I want to book counselling.",
    "How much is the Web Development course?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user_${Date.now()}`;

    // Add customer message locally
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'customer',
        text,
        timestamp: timeStr,
      }
    ]);

    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          customer_id: customerId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
        })
      });

      if (!res.ok) {
        throw new Error('Failed to get response from AI engine');
      }

      const data: ChatResponse = await res.json();
      const aiMsgId = `ai_${Date.now()}`;

      setMessages(prev => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: data.intent,
          leadScore: data.lead_score,
          nextAction: data.next_action,
          agentLogs: data.agent_logs,
          appointmentSlots: data.appointment_slots_available,
          stripeUrl: data.stripe_payment_url,
        }
      ]);

      // Auto-expand logs for latest AI response
      setExpandedLogsId(aiMsgId);
    } catch (err: any) {
      console.error("Chat error:", err);
      showToast(err.message || 'Error communicating with AI engine', 'error');
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: "I'm having a brief connection issue. Please try again or ask another question!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointmentSlot = async (msgId: string, slotTime: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          customer_name: customerName,
          service: 'SkillBridge 1-on-1 Academic Counselling',
          date: new Date().toISOString().split('T')[0],
          time: slotTime,
        })
      });

      if (res.ok) {
        showToast(`Appointment confirmed for ${slotTime}!`, 'success');
        setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
            return { ...m, bookedSlot: slotTime };
          }
          return m;
        }));
        if (onAppointmentBooked) onAppointmentBooked();
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to book slot', 'error');
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-slate-700 text-slate-300';
    if (score >= 81) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (score >= 61) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    if (score >= 31) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-slate-700 text-slate-300';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return '';
    if (score >= 81) return 'Very High Intent';
    if (score >= 61) return 'High Intent';
    if (score >= 31) return 'Medium Intent';
    return 'Low Intent';
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* WhatsApp / Chat Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-white text-base">SkillBridge Assistant</h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold px-2 py-0.5 rounded-full">
                BizPilot AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Online • Powered by Gemini 2.5</p>
          </div>
        </div>

        {/* Customer Identity Configuration */}
        <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your Name"
              className="bg-transparent border-b border-slate-700 text-white font-medium focus:outline-none focus:border-indigo-500 w-28 text-xs"
            />
          </div>

          <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone Number"
              className="bg-transparent border-b border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 w-28 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'customer';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                <div className={`mt-2 text-[10px] flex items-center justify-between opacity-70 ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                  <span>{msg.timestamp}</span>
                  {msg.intent && (
                    <span className="font-semibold uppercase tracking-wider text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700">
                      Intent: {msg.intent}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Metadata & Action Cards */}
              {!isUser && msg.leadScore !== undefined && (
                <div className="max-w-[85%] sm:max-w-[75%] space-y-3">
                  {/* Lead Score Badge */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${getScoreColor(msg.leadScore)}`}>
                      <Sparkles className="w-3 h-3" />
                      <span>Lead Score: {msg.leadScore}/100 • {getScoreLabel(msg.leadScore)}</span>
                    </span>
                  </div>

                  {/* Interactive Action Card: Appointment Booking */}
                  {(msg.nextAction === 'book_appointment' || (msg.appointmentSlots && msg.appointmentSlots.length > 0)) && (
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span className="font-bold text-xs text-white">Book Free 1-on-1 Academic Counselling</span>
                        </div>
                        {msg.bookedSlot && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Confirmed ✓</span>
                          </span>
                        )}
                      </div>

                      {msg.bookedSlot ? (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
                          <span>Appointment reserved for today at <b>{msg.bookedSlot}</b>.</span>
                          <span className="font-semibold text-emerald-400">Recorded in Firestore</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-300 mb-2">Select an available time slot below:</p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {(msg.appointmentSlots || ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"]).map((slot) => (
                              <button
                                key={slot}
                                onClick={() => handleBookAppointmentSlot(msg.id, slot)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-indigo-200 hover:text-white text-xs font-semibold transition-all text-center cursor-pointer"
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Card if generated */}
                  {msg.stripeUrl && (
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-bold text-xs">Official Stripe Payment Link</span>
                      </div>
                      <p className="text-xs text-slate-300">Enroll directly via Stripe secure gateway:</p>
                      <a
                        href={msg.stripeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        <span>Complete Payment on Stripe</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Collapsible Live Agent Execution Logs */}
                  {msg.agentLogs && msg.agentLogs.length > 0 && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedLogsId(expandedLogsId === msg.id ? null : msg.id)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 bg-slate-900"
                      >
                        <div className="flex items-center space-x-2 font-semibold">
                          <Bot className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Live Agent Execution Logs (4 Steps)</span>
                        </div>
                        {expandedLogsId === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {expandedLogsId === msg.id && (
                        <div className="p-3 space-y-2 bg-slate-950 border-t border-slate-800/80 text-[11px] font-mono">
                          {msg.agentLogs.map((log, idx) => (
                            <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800/60 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-300">✓ {log.agent}</span>
                                <span className="text-[10px] text-slate-500">{log.tool_called}</span>
                              </div>
                              <p className="text-slate-300 font-sans">{log.action}</p>
                              <p className="text-[10px] text-slate-400 italic font-sans">{log.reasoning_summary}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3 text-xs text-slate-400 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>BizPilot AI Agents executing pipeline...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Pills */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto flex items-center space-x-2 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Quick Prompts:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-xs text-indigo-300 hover:text-white bg-slate-900 hover:bg-indigo-600/30 border border-indigo-500/20 px-3 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message (e.g. 'Hi, I want to join the Python course')..."
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isLoading}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};
