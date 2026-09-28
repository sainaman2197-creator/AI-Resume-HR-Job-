import React, { useState, useEffect } from 'react';
import { 
  Filter, Sparkles, Users, Award, ChevronRight, CheckCircle2, 
  AlertCircle, ArrowRight, FileText, Briefcase, HelpCircle, 
  BarChart3, RefreshCw, Eye, Printer, BookmarkCheck, Check
} from 'lucide-react';
import { runHRMatchFunnel, getJobs, getCandidateDetail } from '../services/api';
import CandidateModal from './CandidateModal';

const PRESET_JDS = [
  {
    name: 'Python Developer',
    title: 'Python Backend Developer',
    experience_level: 'Mid-Level',
    min_experience_years: 3.0,
    required_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs', 'Git'],
    description: 'Looking for a Mid-Level Python developer to develop high-throughput REST APIs, asynchronous microservices with FastAPI, and manage PostgreSQL database schemas.',
    vacancy_count: 2
  },
  {
    name: 'AI/ML Engineer',
    title: 'Machine Learning & AI Engineer',
    experience_level: 'Mid-Level',
    min_experience_years: 2.5,
    required_skills: ['Python', 'Machine Learning', 'Scikit-learn', 'Pandas', 'NumPy', 'PyTorch'],
    description: 'Seeking an AI/ML Engineer to develop predictive machine learning models, feature engineering pipelines, and deploy ML models into production services.',
    vacancy_count: 1
  },
  {
    name: 'Generative AI Specialist',
    title: 'Generative AI & LLM Specialist',
    experience_level: 'Mid-Level',
    min_experience_years: 3.0,
    required_skills: ['Python', 'LangChain', 'RAG', 'Vector DB', 'Gemini API', 'OpenAI', 'Embeddings'],
    description: 'Enterprise generative AI engineer needed to design and deploy RAG applications, autonomous agents, and integrate vector databases with LLMs.',
    vacancy_count: 1
  },
  {
    name: 'Full Stack Developer',
    title: 'Full Stack Python Developer',
    experience_level: 'Mid-Level',
    min_experience_years: 2.0,
    required_skills: ['Python', 'FastAPI', 'React', 'JavaScript', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
    description: 'Build end-to-end full stack web applications integrating modern React frontends with robust FastAPI asynchronous backends and PostgreSQL.',
    vacancy_count: 3
  },
  {
    name: 'DevOps & Cloud Engineer',
    title: 'DevOps & Cloud Engineer',
    experience_level: 'Senior',
    min_experience_years: 5.0,
    required_skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux', 'Python'],
    description: 'Lead cloud infrastructure deployment on AWS, maintain automated multi-stage CI/CD pipelines, and configure scalable Kubernetes clusters.',
    vacancy_count: 1
  },
  {
    name: 'Data Scientist',
    title: 'Senior Data Scientist',
    experience_level: 'Mid-Level',
    min_experience_years: 3.5,
    required_skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Scikit-learn', 'Statistics', 'Data Science'],
    description: 'Perform predictive analysis, customer behavior modeling, exploratory data analysis across millions of transactions, and build KPI dashboards.',
    vacancy_count: 2
  }
];

export default function HRRecruiterFunnel({ initialJobId = null }) {
  const [existingJobs, setExistingJobs] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(0);
  
  // Job Vacancy Form State
  const [jdForm, setJdForm] = useState({
    title: PRESET_JDS[0].title,
    experience_level: PRESET_JDS[0].experience_level,
    min_experience_years: PRESET_JDS[0].min_experience_years,
    required_skills: PRESET_JDS[0].required_skills.join(', '),
    description: PRESET_JDS[0].description,
    vacancy_count: PRESET_JDS[0].vacancy_count,
    job_id: null
  });

  const [loading, setLoading] = useState(false);
  const [funnelData, setFunnelData] = useState(null);
  const [activeStageTab, setActiveStageTab] = useState('top5'); // 'top5' or 'top10'
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Fetch corporate jobs for dropdown
  useEffect(() => {
    getJobs()
      .then((jobs) => {
        setExistingJobs(jobs || []);
        if (initialJobId) {
          const match = jobs.find(j => j.id === initialJobId);
          if (match) {
            handleSelectExistingJob(match);
          }
        }
      })
      .catch((err) => console.error('Failed to load jobs:', err));
  }, [initialJobId]);

  const handleApplyPreset = (idx) => {
    setSelectedPreset(idx);
    const preset = PRESET_JDS[idx];
    setJdForm({
      title: preset.title,
      experience_level: preset.experience_level,
      min_experience_years: preset.min_experience_years,
      required_skills: preset.required_skills.join(', '),
      description: preset.description,
      vacancy_count: preset.vacancy_count,
      job_id: null
    });
  };

  const handleSelectExistingJob = (job) => {
    setJdForm({
      title: job.title,
      experience_level: job.experience_level,
      min_experience_years: job.experience_level === 'Senior' ? 5.0 : job.experience_level === 'Junior' ? 1.0 : 3.0,
      required_skills: Array.isArray(job.required_skills) ? job.required_skills.join(', ') : job.required_skills,
      description: job.description,
      vacancy_count: 1,
      job_id: job.id
    });
    setSelectedPreset(-1);
  };

  const handleRunFunnel = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = jdForm.required_skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        job_id: jdForm.job_id || undefined,
        title: jdForm.title,
        required_skills: skillsArray,
        experience_level: jdForm.experience_level,
        min_experience_years: parseFloat(jdForm.min_experience_years) || 0.0,
        description: jdForm.description,
        vacancy_count: parseInt(jdForm.vacancy_count) || 1
      };

      const result = await runHRMatchFunnel(payload);
      setFunnelData(result);
      setActiveStageTab('top5'); // Focus on Top 5 finalists
    } catch (err) {
      console.error('HR Funnel Error:', err);
      alert('Error running BML Funnel: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCandidateModal = async (candidateId) => {
    try {
      const detail = await getCandidateDetail(candidateId);
      setActiveCandidate(detail);
    } catch (err) {
      console.error('Failed to fetch candidate modal detail:', err);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mb-2">
              <Filter size={13} className="text-cyan-400" />
              <span>HR Recruiter Intelligence Funnel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Job Description (JD) &rarr; Top 10 Shortlist &rarr; Top 5 Finalists
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Upload or configure any office job opening. The BML (Best Match Logic & NLP) engine scans all 
              <strong> 150 candidate resumes</strong>, shortlists the <strong>Top 10 candidates</strong> in Stage 1, 
              and executes multi-dimensional evaluation to pick the <strong>Top 5 interview finalists</strong> in Stage 2.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleRunFunnel()}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2.5 transition shadow-lg shadow-cyan-500/30 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-white" />
                  <span>Scanning 150 Resumes...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-cyan-200" />
                  <span>Execute BML Funnel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Funnel Pipeline Visualizer */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-cyan-400 text-sm shrink-0">
              150
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Step 1: Talent Pool</span>
              <span className="text-xs font-bold text-white">150 Resumes Scanned</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-sm shrink-0">
              10
            </div>
            <div>
              <span className="text-[11px] text-cyan-400 block font-medium">Stage 1: Primary Funnel</span>
              <span className="text-xs font-bold text-white">Top 10 Shortlisted</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 flex items-center justify-center font-black text-sm shrink-0">
              5
            </div>
            <div>
              <span className="text-[11px] text-indigo-300 block font-medium">Stage 2: Final Selection</span>
              <span className="text-xs font-bold text-white">Top 5 Interview Finalists</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Job Description (JD) Input & Presets */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="text-cyan-400" size={20} />
              1. Job Vacancy & Description (JD)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an industry preset, load an existing office job, or enter custom job requirements.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {PRESET_JDS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedPreset === idx 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleRunFunnel} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Job Title & Vacancy Post *
              </label>
              <input
                type="text"
                required
                value={jdForm.title}
                onChange={(e) => setJdForm({ ...jdForm, title: e.target.value })}
                placeholder="e.g. Senior Python / FastAPI Engineer"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Load Existing Corporate Job
              </label>
              <select
                onChange={(e) => {
                  const job = existingJobs.find(j => j.id === parseInt(e.target.value));
                  if (job) handleSelectExistingJob(job);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Choose from 20 Jobs --</option>
                {existingJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Experience Level *
              </label>
              <select
                value={jdForm.experience_level}
                onChange={(e) => setJdForm({ ...jdForm, experience_level: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Fresher">Fresher (0 - 1 years)</option>
                <option value="Junior">Junior (1 - 3 years)</option>
                <option value="Mid-Level">Mid-Level (3 - 6 years)</option>
                <option value="Senior">Senior (6+ years)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Min. Experience Required (Years)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={jdForm.min_experience_years}
                onChange={(e) => setJdForm({ ...jdForm, min_experience_years: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Number of Vacancies (Post Openings)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={jdForm.vacancy_count}
                onChange={(e) => setJdForm({ ...jdForm, vacancy_count: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Required Technical Skills (Comma-separated) *
            </label>
            <input
              type="text"
              required
              value={jdForm.required_skills}
              onChange={(e) => setJdForm({ ...jdForm, required_skills: e.target.value })}
              placeholder="e.g. Python, FastAPI, PostgreSQL, Docker, Git"
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Full Job Description & Role Responsibilities *
            </label>
            <textarea
              required
              rows={3}
              value={jdForm.description}
              onChange={(e) => setJdForm({ ...jdForm, description: e.target.value })}
              placeholder="Describe core engineering duties, expectations, tech stack..."
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Algorithm: <strong>BML (Best Match Logic & TF-IDF Semantic Scoring)</strong>
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Evaluating Talent Pool...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Match Candidates & Filter Funnel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Funnel Results Section */}
      {funnelData ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Funnel Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 size={12} /> BML Match Completed
                </span>
                <span className="text-xs text-slate-400">
                  Total Vacancies: <strong>{funnelData.job_summary?.vacancy_count || 1}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {funnelData.job_summary?.title}
              </h2>
            </div>

            {/* Stage Toggle Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setActiveStageTab('top5')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeStageTab === 'top5'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award size={14} />
                <span>Stage 2: Top 5 Finalists</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white ml-1">5</span>
              </button>

              <button
                onClick={() => setActiveStageTab('top10')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeStageTab === 'top10'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={14} />
                <span>Stage 1: Top 10 Shortlist</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white ml-1">10</span>
              </button>
            </div>
          </div>

          {/* STAGE 2: TOP 5 FINALISTS (INTERVIEW READY) */}
          {activeStageTab === 'top5' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <Award size={16} /> Stage 2: Top 5 Interview Finalists
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Selected through deep multi-dimensional scoring (Skills Depth, Project Relevance, Experience Fit, Semantic match) with tailored interview questions.
                  </p>
                </div>
                <button
                  onClick={handlePrintDossier}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Printer size={14} /> Print / Export Dossier
                </button>
              </div>

              {/* Top 5 Finalist Cards */}
              <div className="space-y-5">
                {funnelData.stage2_top5?.map((cand) => (
                  <div
                    key={cand.candidate_id}
                    className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-500/60 transition shadow-xl space-y-4"
                  >
                    {/* Finalist Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
                          #{cand.finalist_rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-lg font-extrabold text-white">{cand.candidate_name}</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                              {cand.hiring_badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {cand.target_job_title} &bull; {cand.total_experience_years} Years Experience &bull; {cand.seniority_level} &bull; {cand.location}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {cand.education} &bull; {cand.email} &bull; {cand.phone}
                          </p>
                        </div>
                      </div>

                      {/* Overall BML Score Dial */}
                      <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            {Math.round(cand.final_bml_score)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                            BML Match Score
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenCandidateModal(cand.candidate_id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                        >
                          <Eye size={14} /> Full Profile
                        </button>
                      </div>
                    </div>

                    {/* Selection Rationale Box */}
                    <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                      <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                        <BookmarkCheck size={14} /> Selection Rationale (Why Picked in Top 5):
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {cand.selection_rationale}
                      </p>
                    </div>

                    {/* 4-Dimension Score Breakdown */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                        Evaluation Dimensions Breakdown:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Technical Skills (40%)</span>
                          <span className="text-sm font-bold text-emerald-400">{cand.skill_match_pct}%</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${cand.skill_match_pct}%` }}></div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Project Relevance (25%)</span>
                          <span className="text-sm font-bold text-cyan-400">{cand.project_relevance_pct}%</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${cand.project_relevance_pct}%` }}></div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Experience Fit (20%)</span>
                          <span className="text-sm font-bold text-indigo-400">{cand.experience_fit_pct}%</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${cand.experience_fit_pct}%` }}></div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Resume & Semantics (15%)</span>
                          <span className="text-sm font-bold text-purple-400">{cand.semantic_fit_pct}%</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${cand.semantic_fit_pct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Matched vs Missing Skills Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-400 block mb-1.5">
                          ✓ Matched Skills ({cand.matched_skills?.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cand.matched_skills?.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                          - Missing / Gaps ({cand.missing_skills?.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cand.missing_skills && cand.missing_skills.length > 0 ? (
                            cand.missing_skills.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400 border border-slate-700">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">None &bull; 100% Core Skill Match!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tailored Interview Questions Section */}
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2.5">
                        <HelpCircle size={15} /> Tailored HR & Technical Interview Questions:
                      </span>
                      <div className="space-y-2">
                        {cand.tailored_interview_questions?.map((q, qIdx) => (
                          <div key={qIdx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              Q{qIdx + 1}
                            </span>
                            <span className="leading-relaxed">{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top 5 Side-by-Side Comparison Matrix */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="text-cyan-400" size={18} />
                  Side-by-Side Comparison Matrix (Top 5 Finalists)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Candidate</th>
                        <th className="p-3">Experience</th>
                        <th className="p-3">Skills Match</th>
                        <th className="p-3">Project Fit</th>
                        <th className="p-3">Overall Score</th>
                        <th className="p-3">Recommendation</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {funnelData.stage2_top5?.map((cand) => (
                        <tr key={cand.candidate_id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-bold text-cyan-400">#{cand.finalist_rank}</td>
                          <td className="p-3 font-semibold text-white">{cand.candidate_name}</td>
                          <td className="p-3">{cand.total_experience_years} yrs ({cand.seniority_level})</td>
                          <td className="p-3 text-emerald-400 font-bold">{cand.skill_match_pct}%</td>
                          <td className="p-3 text-cyan-400 font-bold">{cand.project_relevance_pct}%</td>
                          <td className="p-3 text-white font-extrabold">{Math.round(cand.final_bml_score)}%</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                              {cand.hiring_badge}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleOpenCandidateModal(cand.candidate_id)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition cursor-pointer"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 1: TOP 10 SHORTLIST VIEW */}
          {activeStageTab === 'top10' && (
            <div className="space-y-4">
              <div className="bg-cyan-950/30 border border-cyan-500/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                    <Users size={16} /> Stage 1: Top 10 Shortlisted Candidates
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Evaluated across 150 talent pool resumes using BML skill coverage, TF-IDF text matching, and experience alignment.
                  </p>
                </div>
                <span className="text-xs font-semibold text-cyan-400">
                  Scanned 150 &rarr; Filtered 10
                </span>
              </div>

              <div className="space-y-3">
                {funnelData.stage1_top10?.map((cand) => {
                  const isTop5Finalist = funnelData.stage2_top5?.some(f => f.candidate_id === cand.candidate_id);

                  return (
                    <div
                      key={cand.candidate_id}
                      className={`p-4 rounded-xl bg-slate-900/90 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isTop5Finalist ? 'border-indigo-500/50 shadow-md shadow-indigo-950/30' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isTop5Finalist 
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          #{cand.stage1_rank}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{cand.candidate_name}</h4>
                            {isTop5Finalist && (
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                Top 5 Finalist
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {cand.target_job_title} &bull; {cand.total_experience_years} yrs ({cand.seniority_level}) &bull; {cand.location}
                          </p>

                          {/* Matched skills */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {cand.matched_skills?.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
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
                          <span className="text-lg font-extrabold text-emerald-400">
                            {cand.overall_score}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">Stage 1 Fit</span>
                        </div>
                        <button
                          onClick={() => handleOpenCandidateModal(cand.candidate_id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                        >
                          <Eye size={12} /> Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500 p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <Filter size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">Ready to Shortlist Candidates</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Click "Execute BML Funnel" above or select any preset job to scan all 150 resumes and generate the Top 10 shortlist and Top 5 finalists!
          </p>
        </div>
      )}

      {/* Candidate Modal for detail inspection */}
      {activeCandidate && (
        <CandidateModal
          candidate={activeCandidate}
          onClose={() => setActiveCandidate(null)}
        />
      )}
    </div>
  );
}
