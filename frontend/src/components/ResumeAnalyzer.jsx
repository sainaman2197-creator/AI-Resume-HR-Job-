import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Lightbulb, Briefcase, Zap, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import { uploadResume } from '../services/api';

export default function ResumeAnalyzer({ onSelectJob }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF document (.pdf).');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (!dropped.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a PDF document (.pdf).');
        return;
      }
      setFile(dropped);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await uploadResume(file);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto pt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Resume & ATS Optimization Engine
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400">
          Upload any PDF resume to generate an instant Applicant Tracking System (ATS) score, detect formatting mistakes, extract technical skills, and match against active job openings.
        </p>
      </div>

      {/* Upload Box (Visible when no result yet) */}
      {!result && (
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-950/20'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
              }`}
              onClick={() => document.getElementById('resume-file-input').click()}
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {file ? file.name : 'Choose a resume PDF or drag & drop here'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5">
                  {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Supported format: Adobe PDF (.pdf) up to 10MB'}
                </p>

                {file && (
                  <div className="mt-4 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Ready to analyze
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-2.5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <button
                type="submit"
                disabled={!file || loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Analyzing with AI & ATS Engine...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>Analyze Resume Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analysis Result View */}
      {result && (
        <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
          {/* Top Bar with Reset */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{result.file_name}</h2>
                <p className="text-xs text-slate-400">Analysis completed & saved to database (ID #{result.resume_id})</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition border border-slate-700"
            >
              <RefreshCw size={13} />
              <span>Analyze Another Resume</span>
            </button>
          </div>

          {/* Row 1: Score & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">ATS Compatibility Score</h3>
              <ScoreGauge score={result.ats_score} size={190} />
              <p className="text-xs text-center text-slate-400 mt-4 max-w-xs">
                Calculated based on standard ATS readability, keyword density, section headers, and measurable impact.
              </p>
            </div>

            {/* Candidate Overview */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Overview & AI Summary</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {result.experience_years} Years Exp
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  {result.analysis?.summary || `Candidate with technical background and approximately ${result.experience_years} years of experience.`}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Target Role</span>
                    <span className="text-xs font-semibold text-white mt-0.5 block truncate">
                      {result.analysis?.target_role || 'Software Developer'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Seniority</span>
                    <span className="text-xs font-semibold text-white mt-0.5 block">
                      {result.analysis?.seniority_level || 'Mid-Level'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Skills Extracted</span>
                    <span className="text-xs font-semibold text-cyan-400 mt-0.5 block">
                      {result.skills?.length || 0} Skills
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Job Matches</span>
                    <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">
                      {result.matched_jobs?.length || 0} Openings
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>AI Engine: {result.analysis?.ai_powered ? 'Google Gemini AI' : 'Deterministic ATS Parser'}</span>
                <span>Resume ID #{result.resume_id}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Skills Cloud & Strengths */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Skills */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Layers size={14} className="text-cyan-400" /> Extracted Technical & Domain Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.skills && result.skills.length > 0 ? (
                  result.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No specific skills detected.</span>
                )}
              </div>
            </div>

            {/* Identified Strengths */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} /> Resume Strengths
              </h3>
              <ul className="space-y-2.5">
                {result.strengths && result.strengths.length > 0 ? (
                  result.strengths.map((st, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{st}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">Clear technical structure.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Row 3: Formatting Mistakes & Missing Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formatting Mistakes / Warnings */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> ATS Formatting Issues & Flaws
              </h3>
              <ul className="space-y-2.5">
                {result.mistakes && result.mistakes.length > 0 ? (
                  result.mistakes.map((mis, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{mis}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-emerald-400">No major formatting mistakes detected!</li>
                )}
              </ul>
            </div>

            {/* Missing In-Demand Skills */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
                <Lightbulb size={14} /> Missing High-Impact Skills
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Adding these industry-standard skills to your profile can boost ATS visibility for senior roles:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills && result.missing_skills.length > 0 ? (
                  result.missing_skills.map((ms, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      + {ms}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Stack has broad coverage.</span>
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Matched Job Openings */}
          {result.matched_jobs && result.matched_jobs.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase size={18} className="text-cyan-400" /> Best Matching Job Openings
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated by cross-referencing your resume text & skills with current database openings.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.matched_jobs.map((job) => (
                  <div
                    key={job.job_id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-white">{job.title}</h4>
                          <p className="text-xs text-cyan-400 font-medium">{job.company}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-extrabold text-emerald-400">
                            {job.match_percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">Match Score</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-[11px] text-slate-400 block mb-1">Matching Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {job.matched_skills && job.matched_skills.length > 0 ? (
                            job.matched_skills.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                ✓ {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-500">None yet</span>
                          )}
                        </div>
                      </div>

                      {job.missing_skills && job.missing_skills.length > 0 && (
                        <div className="mt-2.5">
                          <span className="text-[11px] text-slate-400 block mb-1">Missing Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {job.missing_skills.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                - {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>{job.location} &bull; {job.salary_range}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
