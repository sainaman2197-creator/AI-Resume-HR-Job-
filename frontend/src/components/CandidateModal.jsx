import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Briefcase, Award, GraduationCap, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';

export default function CandidateModal({ candidate, onClose }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{candidate.candidate_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {candidate.seniority_level}
              </span>
            </div>
            <p className="text-sm text-cyan-400 font-medium mt-1">{candidate.target_job_title}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2.5">
              {candidate.location && (
                <span className="flex items-center gap-1"><MapPin size={13} className="text-slate-500" /> {candidate.location}</span>
              )}
              {candidate.email && (
                <span className="flex items-center gap-1"><Mail size={13} className="text-slate-500" /> {candidate.email}</span>
              )}
              {candidate.phone && (
                <span className="flex items-center gap-1"><Phone size={13} className="text-slate-500" /> {candidate.phone}</span>
              )}
              {candidate.total_experience_years && (
                <span className="flex items-center gap-1"><Briefcase size={13} className="text-slate-500" /> {candidate.total_experience_years} yrs exp</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Career Summary */}
          {candidate.career_summary && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Career Summary</h3>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 text-slate-300 leading-relaxed">
                {candidate.career_summary}
              </div>
            </div>
          )}

          {/* Skills & Capability Tags */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Technical Skills & Capabilities</h3>
            <div className="flex flex-wrap gap-1.5">
              {candidate.capability_tags && candidate.capability_tags.length > 0 ? (
                candidate.capability_tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-cyan-300 border border-slate-700">
                    {tag}
                  </span>
                ))
              ) : candidate.skills ? (
                candidate.skills.split(',').map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-cyan-300 border border-slate-700">
                    {s.strip ? s.strip() : s.trim()}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs">No specific skills listed</span>
              )}
            </div>
          </div>

          {/* Education & Leadership */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                <GraduationCap size={15} className="text-indigo-400" /> Education
              </div>
              <p className="text-white font-medium">{candidate.education || 'Not specified'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                <Award size={15} className="text-emerald-400" /> Leadership & Coordination
              </div>
              <p className="text-white font-medium">{candidate.leadership || 'Individual contributor'}</p>
            </div>
          </div>

          {/* Projects */}
          {candidate.projects && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Notable Projects</h3>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                {candidate.projects.split('|').map((proj, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>{proj.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Text Toggle */}
          {candidate.resume_text && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center justify-between w-full py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white"
              >
                <span className="flex items-center gap-1.5"><FileText size={14} /> Full Extracted Resume Text</span>
                {showRaw ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showRaw && (
                <pre className="mt-2 p-3.5 bg-black/50 border border-slate-800 rounded-xl text-xs text-slate-400 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                  {candidate.resume_text}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">Candidate ID #{candidate.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
