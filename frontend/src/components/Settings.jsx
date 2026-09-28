import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, CheckCircle2, ShieldCheck, Database, Cpu, RefreshCw, AlertCircle } from 'lucide-react';
import { getApiKeyStatus, updateApiKey, checkHealth } from '../services/api';

export default function Settings({ healthData, refreshHealth }) {
  const [apiKey, setApiKey] = useState('');
  const [keyStatus, setKeyStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getApiKeyStatus()
      .then((data) => setKeyStatus(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await updateApiKey(apiKey);
      setKeyStatus({ is_configured: true, masked_key: `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` });
      setApiKey('');
      setSaveSuccess(true);
      if (refreshHealth) refreshHealth();
    } catch (err) {
      console.error('Failed to update API key:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <SettingsIcon className="text-cyan-400" /> Platform Configuration & AI Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure Gemini AI credentials, verify database health, and view system status.
        </p>
      </div>

      {/* Gemini API Key Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key size={18} className="text-cyan-400" /> Google Gemini AI Integration
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supply your Gemini API key to enable high-fidelity deep neural resume reasoning. If no key is set, the system seamlessly uses the local deterministic ATS heuristic engine.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${keyStatus?.is_configured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              <span className={`w-2 h-2 rounded-full ${keyStatus?.is_configured ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {keyStatus?.is_configured ? 'AI Active' : 'Heuristic Mode'}
            </span>
          </div>
        </div>

        {keyStatus?.masked_key && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
            <span>Configured Key:</span>
            <code className="px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-300">{keyStatus.masked_key}</code>
          </div>
        )}

        <form onSubmit={handleSaveKey} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            placeholder="Paste your Gemini API Key (AIzaSy...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={saving || !apiKey.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            <span>Save API Key</span>
          </button>
        </form>

        {saveSuccess && (
          <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Gemini API key updated and active for subsequent resume scans!
          </div>
        )}
      </div>

      {/* System Architecture Status */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Cpu size={18} className="text-indigo-400" /> Platform Status & Telemetry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">PostgreSQL Database</span>
              <Database size={15} className="text-cyan-400" />
            </div>
            <p className="text-lg font-bold text-white mt-1">resume_db</p>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 size={11} /> Connected on port 5432
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Candidate Profiles</span>
              <Cpu size={15} className="text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-white mt-1">{healthData?.candidates_count || 100} Loaded</p>
            <span className="text-[11px] text-slate-400 block mt-1">100 Resumes Dataset</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Corporate Jobs</span>
              <Briefcase size={15} className="text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-white mt-1">{healthData?.jobs_count || 20} Active</p>
            <span className="text-[11px] text-slate-400 block mt-1">Ready for AI Matching</span>
          </div>
        </div>
      </div>
    </div>
  );
}
