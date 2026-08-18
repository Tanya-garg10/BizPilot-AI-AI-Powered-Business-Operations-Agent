import React, { useState } from 'react';
import { UserCheck, Search, Filter, Sparkles, Edit2, CheckCircle, Clock } from 'lucide-react';
import { Lead, LeadStage } from '../types';

interface LeadsTabProps {
  leads: Lead[];
  onUpdateStage: (leadId: string, newStage: LeadStage) => void;
  isLoading: boolean;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({ leads, onUpdateStage, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const stageOptions: LeadStage[] = ['New', 'Qualified', 'Appointment', 'Payment Pending', 'Converted', 'Lost'];

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.interested_service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStageFilter === 'All' || l.lead_stage === selectedStageFilter;
    return matchesSearch && matchesStage;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 81) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 61) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (score >= 31) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const getStageBadgeColor = (stage: LeadStage) => {
    switch (stage) {
      case 'Converted': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Payment Pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Appointment': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Qualified': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Lost': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time lead qualification, Gemini AI intent scores, and pipeline management.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          {['All', ...stageOptions].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedStageFilter === stage
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Customer Lead</th>
                <th className="px-6 py-4">Interested Course</th>
                <th className="px-6 py-4">AI Score</th>
                <th className="px-6 py-4">Lead Stage</th>
                <th className="px-6 py-4">Next Action</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No leads found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-400">{lead.email} • {lead.phone}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-200">{lead.interested_service}</span>
                      <div className="text-[10px] text-slate-500">Source: {lead.source}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 font-extrabold px-2.5 py-1 rounded-md border ${getScoreBadgeColor(lead.lead_score)}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{lead.lead_score}/100</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold ${getStageBadgeColor(lead.lead_stage)}`}>
                        {lead.lead_stage}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {lead.next_action}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage Updater Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-bold text-lg text-white">Update Lead Stage</h3>

            <div>
              <p className="text-xs text-slate-400">Customer: <b className="text-white">{editingLead.name}</b></p>
              <p className="text-xs text-slate-400">Course: <b className="text-white">{editingLead.interested_service}</b></p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select New Stage:</label>
              <div className="grid grid-cols-2 gap-2">
                {stageOptions.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateStage(editingLead.id, st);
                      setEditingLead(null);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      editingLead.lead_stage === st
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
