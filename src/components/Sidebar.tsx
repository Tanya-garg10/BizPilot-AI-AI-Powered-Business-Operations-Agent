import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  UserCheck, 
  Calendar, 
  Cpu, 
  CreditCard, 
  Settings,
  Bot,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export type DashboardTab = 
  | 'overview' 
  | 'chat' 
  | 'conversations' 
  | 'leads' 
  | 'appointments' 
  | 'ai_activity' 
  | 'payments' 
  | 'settings';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  businessName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  businessName
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'chat', label: 'Customer Chat Sim', icon: MessageSquare, badge: 'Live AI' },
    { id: 'conversations', label: 'Conversations', icon: Users },
    { id: 'leads', label: 'Leads Pipeline', icon: UserCheck },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'ai_activity', label: 'AI Execution Logs', icon: Cpu, badge: 'Agent' },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Business Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] flex-shrink-0">
      <div className="p-4 space-y-6">
        <div className="p-3.5 bg-gradient-to-br from-indigo-950/80 to-slate-900 rounded-xl border border-indigo-500/20">
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Business Context</span>
          </div>
          <p className="font-semibold text-slate-100 text-sm truncate">{businessName}</p>
          <p className="text-xs text-slate-400 mt-0.5">SkillBridge Academy Demo</p>
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Operations & AI
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as DashboardTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-200">Gemini 2.5 Engine</p>
            <p className="text-[10px] text-slate-400">5 Logical Agents Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
