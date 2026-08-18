import React, { useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, Clock, Bot, Search, RefreshCw, Terminal } from 'lucide-react';
import { AgentRun } from '../types';

interface AIActivityTabProps {
  runs: AgentRun[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const AIActivityTab: React.FC<AIActivityTabProps> = ({ runs, onRefresh, isLoading }) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const agentNames = [
    'Reception Agent',
    'Sales Agent',
    'Conversion Agent',
    'Follow-up Agent',
    'Business Analyst Agent'
  ];

  const filteredRuns = runs.filter(run => {
    const matchesAgent = selectedAgentFilter === 'All' || run.agent === selectedAgentFilter;
    const matchesSearch = 
      run.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.decision.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.intent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.reasoning_summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAgent && matchesSearch;
  });

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'Reception Agent': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Sales Agent': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'Conversion Agent': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Follow-up Agent': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <span>LIVE AI ACTIVITY LOGS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time execution log evidence stored in Firestore collection: <code className="text-indigo-300 font-mono">agent_runs</code>
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Agent Activity</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search execution logs, tools, or reasoning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          {['All', ...agentNames].map((ag) => (
            <button
              key={ag}
              onClick={() => setSelectedAgentFilter(ag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedAgentFilter === ag
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {ag.replace(' Agent', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Stream List */}
      <div className="space-y-3">
        {filteredRuns.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
            No agent execution runs recorded matching current filters.
          </div>
        ) : (
          filteredRuns.map((run) => (
            <div
              key={run.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="flex items-start space-x-3.5 flex-1">
                <div className="mt-0.5">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs ${getAgentColor(run.agent)}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{run.agent}</span>
                    <span className="text-[10px] font-mono bg-slate-950 text-indigo-300 border border-slate-800 px-2 py-0.5 rounded">
                      Intent: {run.intent}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {run.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200">{run.action}</p>
                  <p className="text-xs text-slate-400">{run.decision}</p>

                  <div className="pt-2 flex items-center space-x-4 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center space-x-1">
                      <Terminal className="w-3 h-3 text-slate-400" />
                      <span>Tool: {run.tool_called}</span>
                    </span>
                    <span className="truncate max-w-xs">{run.tool_result}</span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right text-[11px] text-slate-500 flex sm:flex-col justify-between items-end gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                <span className="flex items-center space-x-1 font-mono text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(run.timestamp).toLocaleTimeString()}</span>
                </span>
                <span className="text-[10px] text-slate-600 font-mono">{run.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
