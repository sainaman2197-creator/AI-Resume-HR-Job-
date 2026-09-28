import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Briefcase, FileCheck, Award, TrendingUp, Clock, Trash2, RefreshCw } from 'lucide-react';
import { getAnalytics, deleteResume } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDeleteResume = async (id) => {
    try {
      await deleteResume(id);
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw size={32} className="animate-spin text-cyan-400 mb-3" />
        <p className="text-sm">Calculating talent intelligence and metrics...</p>
      </div>
    );
  }

  const maxSkillCount = data?.top_skills?.[0]?.count || 1;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 className="text-cyan-400" /> Talent & ATS Analytics Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time metrics, skill demand frequencies, and candidate experience distributions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Candidate Talent Pool</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{data?.total_candidates || 0}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Briefcase size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Active Job Openings</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{data?.total_jobs || 0}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileCheck size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">PDF Resumes Scanned</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{data?.total_resumes_analyzed || 0}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Avg ATS Score</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{data?.average_ats_score || 0}%</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top In-Demand Skills */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400" /> Top Skills in Talent Pool
            </h3>
            <span className="text-xs text-slate-400">Frequency</span>
          </div>

          <div className="space-y-3 mt-4">
            {data?.top_skills?.map((item, idx) => {
              const pct = Math.round((item.count / maxSkillCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.skill}</span>
                    <span className="text-cyan-400 font-bold">{item.count} profiles</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seniority Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Users size={16} className="text-indigo-400" /> Seniority Level Breakdown
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {data?.seniority_distribution?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-medium text-slate-400 block">{item.level}</span>
                  <span className="text-2xl font-black text-white mt-1 block">{item.count}</span>
                  <span className="text-[10px] text-cyan-400 font-semibold mt-0.5 block">
                    {Math.round((item.count / (data?.total_candidates || 1)) * 100)}% of candidates
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            Data aggregated automatically from the 100 candidate resumes and corporate job postings in PostgreSQL.
          </div>
        </div>
      </div>

      {/* Recent Scanned Resumes */}
      {data?.recent_resumes && data.recent_resumes.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Clock size={16} className="text-cyan-400" /> Recently Scanned Resumes
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">File Name</th>
                  <th className="pb-3 font-semibold">ATS Score</th>
                  <th className="pb-3 font-semibold">Scanned At</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recent_resumes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-medium text-white">{r.file_name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.ats_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {r.ats_score}%
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{r.created_at}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteResume(r.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                        title="Delete resume"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
