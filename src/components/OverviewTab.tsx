import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  IndianRupee, 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { DashboardStats, AIInsight } from '../types';

interface OverviewTabProps {
  stats: DashboardStats;
  onRefresh: () => void;
  isLoading: boolean;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  onRefresh,
  isLoading,
  showToast
}) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const fetchInsights = async () => {
    setIsLoadingInsight(true);
    try {
      const res = await fetch('/api/dashboard/insights');
      if (res.ok) {
        const data = await res.json();
        setInsight(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI Insights:', err);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const kpis = [
    {
      label: 'Total Conversations',
      value: stats.total_conversations,
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'Incoming customer chat interactions',
    },
    {
      label: 'Qualified Leads',
      value: stats.qualified_leads,
      icon: UserCheck,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      description: 'Leads with score ≥ 31',
    },
    {
      label: 'Appointments Booked',
      value: stats.appointments,
      icon: Calendar,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      description: '1-on-1 counselling sessions',
    },
    {
      label: 'Paid Conversions',
      value: stats.conversions,
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Enrolled students',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.revenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Real paid course revenue',
    },
    {
      label: 'AI Actions Executed',
      value: stats.ai_actions,
      icon: Cpu,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Gemini agent pipeline runs',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Operations Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics computed directly from Firestore application collections.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-extrabold text-white tracking-tight">{kpi.value}</span>
                <p className="text-[10px] text-slate-500 mt-1">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-bold text-base text-white">AI Business Insight (Generated by Gemini)</h2>
          </div>

          <button
            onClick={fetchInsights}
            disabled={isLoadingInsight}
            className="flex items-center space-x-1 text-xs text-indigo-300 hover:text-white bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingInsight ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        </div>

        {insight ? (
          <div className="space-y-4 text-sm">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-slate-100 text-sm mb-1">{insight.headline}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{insight.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-950/40 border border-amber-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Bottlenecks</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {insight.bottlenecks.map((b, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-amber-400">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/40 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Actionable Recommendations</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {insight.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Generating AI Business Insights...
          </div>
        )}
      </div>

      {/* Conversion Funnel Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Conversion Funnel Progression</h3>
          <span className="text-xs text-slate-400">SkillBridge Learner Funnel</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase">1. Total Inquiries</span>
            <p className="text-3xl font-extrabold text-white">{stats.total_conversations}</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-full"></div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-violet-400 uppercase">2. Qualified Leads</span>
            <p className="text-3xl font-extrabold text-white">{stats.qualified_leads}</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-violet-500 h-full transition-all" 
                style={{ width: `${stats.total_conversations > 0 ? (stats.qualified_leads / stats.total_conversations) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase">3. Appointments</span>
            <p className="text-3xl font-extrabold text-white">{stats.appointments}</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-sky-500 h-full transition-all" 
                style={{ width: `${stats.total_conversations > 0 ? (stats.appointments / stats.total_conversations) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase">4. Conversions</span>
            <p className="text-3xl font-extrabold text-white">{stats.conversions}</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all" 
                style={{ width: `${stats.total_conversations > 0 ? (stats.conversions / stats.total_conversations) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
