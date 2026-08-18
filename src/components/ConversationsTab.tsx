import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Bot, Search, RefreshCw, Calendar, Phone, Mail } from 'lucide-react';
import { Customer, ConversationMessage } from '../types';

interface ConversationsTabProps {
  customers: Customer[];
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ConversationsTab: React.FC<ConversationsTabProps> = ({ customers, showToast }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    customers.length > 0 ? customers[0].id : null
  );
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = async (cId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/conversations?customer_id=${cId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchConversations(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customer Conversations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review stored customer interactions and AI generated response logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Customer Sidebar List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No customers found.</div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = c.id === selectedCustomerId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`w-full text-left p-4 transition-colors flex items-center space-x-3 ${
                      isSelected ? 'bg-indigo-600/10 border-l-4 border-indigo-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                      {c.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100 text-xs truncate">{c.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.last_interaction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.email}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation Stream Details */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {activeCustomer ? (
            <>
              {/* Active Customer Banner */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
                    {activeCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{activeCustomer.name}</h3>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center space-x-1"><Mail className="w-3 h-3" /><span>{activeCustomer.email}</span></span>
                      <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{activeCustomer.phone}</span></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => fetchConversations(activeCustomer.id)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/30">
                {isLoading ? (
                  <div className="p-12 text-center text-xs text-slate-500">Loading conversation history...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500">No message history recorded yet for this customer.</div>
                ) : (
                  conversations.map((msg, idx) => {
                    const isUser = msg.sender === 'customer';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-md ${
                            isUser
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.message}</p>
                          <div className={`mt-2 text-[10px] flex items-center justify-between opacity-70 ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                            <span>{new Date(msg.timestamp).toLocaleString()}</span>
                            {msg.intent && (
                              <span className="font-semibold text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">
                                {msg.intent}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Select a customer from the left list to inspect conversation history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
