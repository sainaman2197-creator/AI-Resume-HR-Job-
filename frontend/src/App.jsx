import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HRRecruiterFunnel from './components/HRRecruiterFunnel';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import TalentPool from './components/TalentPool';
import JobMatcher from './components/JobMatcher';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { checkHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('funnel');
  const [funnelJobId, setFunnelJobId] = useState(null);
  const [healthData, setHealthData] = useState(null);

  const fetchHealth = () => {
    checkHealth()
      .then((data) => setHealthData(data))
      .catch((err) => console.error('Health check error:', err));
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerFunnelFromJob = (jobId) => {
    setFunnelJobId(jobId);
    setActiveTab('funnel');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthData={healthData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'funnel' && <HRRecruiterFunnel initialJobId={funnelJobId} />}
        {activeTab === 'analyzer' && <ResumeAnalyzer onSelectJob={() => setActiveTab('jobs')} />}
        {activeTab === 'talent' && <TalentPool />}
        {activeTab === 'jobs' && <JobMatcher onRunFunnel={handleTriggerFunnelFromJob} />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <Settings healthData={healthData} refreshHealth={fetchHealth} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AI Resume & PDF Analyzer &bull; Powered by FastAPI, PostgreSQL, and Google Gemini AI</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Candidates: {healthData?.candidates_count || 150}</span>
            <span>&bull;</span>
            <span>Jobs: {healthData?.jobs_count || 20}</span>
            <span>&bull;</span>
            <span>PostgreSQL: {healthData?.database || 'Active'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
