import React from 'react';
import { FileSearch, Users, Briefcase, BarChart3, Settings, ShieldCheck, Sparkles, AlertCircle, Filter } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, healthData }) {
  const navItems = [
    { id: 'funnel', label: 'HR Funnel (Top 10 & 5)', icon: Filter, highlight: true },
    { id: 'analyzer', label: 'Resume Analyzer', icon: FileSearch },
    { id: 'talent', label: 'Talent Pool', icon: Users, badge: healthData?.candidates_count || 150 },
    { id: 'jobs', label: 'Jobs & Matching', icon: Briefcase, badge: healthData?.jobs_count },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('analyzer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white tracking-tight">ResumeAI</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ATS Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Intelligent PDF Parser & Talent Intelligence</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : item.highlight
                      ? 'text-cyan-300 hover:text-white bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* System Status */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${healthData?.database === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300">DB: {healthData?.database || 'Checking...'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
