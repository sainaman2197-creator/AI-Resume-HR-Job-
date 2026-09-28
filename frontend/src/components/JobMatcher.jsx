import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, MapPin, DollarSign, Sparkles, CheckCircle2, AlertCircle, RefreshCw, X, Eye, Filter } from 'lucide-react';
import { getJobs, createJob, matchJobToCandidates, getCandidateDetail } from '../services/api';
import CandidateModal from './CandidateModal';

export default function JobMatcher({ onRunFunnel }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingJob, setMatchingJob] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState(null);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: 'Remote, India',
    experience_level: 'Mid-Level',
    required_skills: '',
    description: '',
    salary_range: '₹12 - ₹18 LPA',
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleMatchCandidates = async (job) => {
    setMatchingJob(job);
    setMatchingLoading(true);
    try {
      const data = await matchJobToCandidates(job.id, 8);
      setMatchResults(data);
    } catch (err) {
      console.error('Failed to match candidates:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description) return;

    try {
      const skillsArray = newJob.required_skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await createJob({
        ...newJob,
        required_skills: skillsArray,
      });

      setShowPostModal(false);
      setNewJob({
        title: '',
        company: '',
        location: 'Remote, India',
        experience_level: 'Mid-Level',
        required_skills: '',
        description: '',
        salary_range: '₹12 - ₹18 LPA',
      });
      fetchJobs();
    } catch (err) {
      console.error('Failed to create job:', err);
    }
  };

  const handleOpenCandidate = async (candId) => {
    try {
      const detail = await getCandidateDetail(candId);
      setActiveCandidate(detail);
    } catch (err) {
      console.error('Failed to open candidate:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Briefcase className="text-cyan-400" /> Active Job Openings & AI Matcher
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse corporate job listings and run AI candidate matchmaking across the 100-profile talent pool.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-cyan-500/20 shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw size={32} className="animate-spin text-cyan-400 mb-3" />
          <p className="text-sm">Loading job openings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <p className="text-xs font-semibold text-cyan-400 mt-0.5">{job.company}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                    {job.experience_level}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-500" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={12} className="text-slate-500" /> {job.salary_range}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills */}
                <div className="mt-3.5">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Required Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills && job.required_skills.length > 0 ? (
                      job.required_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">Job #{job.id}</span>
                <div className="flex items-center gap-2">
                  {onRunFunnel && (
                    <button
                      onClick={() => onRunFunnel(job.id)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition border border-indigo-500/40 shadow-sm cursor-pointer"
                    >
                      <Filter size={13} className="text-indigo-400" />
                      <span>Top 10 & 5 Funnel</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleMatchCandidates(job)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition border border-cyan-500/30 shadow-sm cursor-pointer"
                  >
                    <Sparkles size={13} className="text-cyan-400" />
                    <span>Match</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recruiter Matching Modal */}
      {matchingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                  <Sparkles size={14} /> AI Candidate Ranking
                </div>
                <h2 className="text-xl font-bold text-white">{matchingJob.title} &bull; {matchingJob.company}</h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {matchingJob.required_skills?.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setMatchingJob(null); setMatchResults(null); }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Results Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {matchingLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <RefreshCw size={32} className="animate-spin text-cyan-400 mb-3" />
                  <p className="text-sm">Evaluating 100 candidate resumes against requirements...</p>
                </div>
              ) : matchResults && matchResults.top_candidates ? (
                <div className="space-y-3">
                  {matchResults.top_candidates.map((cand, rank) => (
                    <div
                      key={cand.candidate_id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          #{rank + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{cand.candidate_name}</h4>
                            <span className="text-[11px] text-cyan-400 font-medium">({cand.target_job_title})</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {cand.total_experience_years} yrs exp &bull; {cand.location} &bull; {cand.seniority_level}
                          </p>

                          {/* Matching Skills */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {cand.matched_skills?.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                ✓ {s}
                              </span>
                            ))}
                            {cand.missing_skills?.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                                - {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <span className={`text-base font-extrabold ${cand.match_percentage >= 80 ? 'text-emerald-400' : cand.match_percentage >= 60 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {cand.match_percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">Fit Match</span>
                        </div>
                        <button
                          onClick={() => handleOpenCandidate(cand.candidate_id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                        >
                          <Eye size={12} /> Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No matching data available.</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
              <button
                onClick={() => { setMatchingJob(null); setMatchResults(null); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-cyan-400" /> Post New Job Opening
              </h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior AI Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Remote"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Experience Level</label>
                  <select
                    value={newJob.experience_level}
                    onChange={(e) => setNewJob({ ...newJob, experience_level: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹15 - ₹25 LPA"
                    value={newJob.salary_range}
                    onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Required Skills (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, FastAPI, Docker, PostgreSQL, AWS"
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob({ ...newJob, required_skills: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Job Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe core responsibilities and technical expectations..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition"
                >
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {activeCandidate && (
        <CandidateModal
          candidate={activeCandidate}
          onClose={() => setActiveCandidate(null)}
        />
      )}
    </div>
  );
}
