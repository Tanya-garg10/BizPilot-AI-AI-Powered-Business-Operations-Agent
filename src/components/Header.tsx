import React from 'react';
import { Bot, Sparkles, LayoutDashboard, MessageSquare, Globe, RefreshCw, FileText } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'dashboard' | 'chat';
  onViewChange: (view: 'landing' | 'dashboard' | 'chat') => void;
  businessName: string;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  businessName,
  onSeedData,
  isSeeding
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 lg:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div 
          onClick={() => onViewChange('landing')} 
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              BizPilot AI
            </span>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Gemini XPRIZE
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center pl-4 border-l border-slate-800 text-xs text-slate-400 space-x-2">
          <span>Active Demo Business:</span>
          <span className="font-semibold text-slate-200 bg-slate-800 px-2.5 py-1 rounded-md">
            {businessName}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onSeedData}
          disabled={isSeeding}
          title="Seed Demo Activity Data into Firestore"
          className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>

        <a
          href="/docs"
          target="_blank"
          rel="noreferrer"
          className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>API Docs</span>
        </a>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onViewChange('landing')}
            className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'landing'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landing</span>
          </button>

          <button
            onClick={() => onViewChange('chat')}
            className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'chat'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Chat</span>
          </button>

          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </header>
  );
};
