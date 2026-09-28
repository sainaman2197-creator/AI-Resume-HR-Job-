import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, MapPin, Briefcase, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { getCandidates, getCandidateDetail } from '../services/api';
import CandidateModal from './CandidateModal';

export default function TalentPool() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [seniority, setSeniority] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState(null);

  const popularSkills = ['Python', 'FastAPI', 'Django', 'Machine Learning', 'React', 'Docker', 'PostgreSQL', 'AWS'];

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const data = await getCandidates({
        search,
        seniority,
        skill: selectedSkill,
        page,
        limit: 12,
      });
      setCandidates(data.candidates || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [page, seniority, selectedSkill]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const handleSelectCandidate = async (id) => {
    try {
      const detail = await getCandidateDetail(id);
      setActiveCandidate(detail);
    } catch (err) {
      console.error('Failed to get candidate detail:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Users className="text-cyan-400" /> Candidate Talent Pool
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, filter, and review profiles from the candidate talent database ({total} candidates loaded).
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, role, skill, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
          <Filter size={14} /> Seniority:
        </span>
        {['all', 'Fresher', 'Junior', 'Mid-Level', 'Senior'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => { setSeniority(lvl); setPage(1); }}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              seniority === lvl
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {lvl === 'all' ? 'All Levels' : lvl}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 hidden sm:block mx-1" />

        <span className="text-slate-400 font-semibold mr-1">Skill:</span>
        <button
          onClick={() => { setSelectedSkill(''); setPage(1); }}
          className={`px-2.5 py-1 rounded-lg transition ${
            selectedSkill === '' ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Any
        </button>
        {popularSkills.map((sk) => (
          <button
            key={sk}
            onClick={() => { setSelectedSkill(sk === selectedSkill ? '' : sk); setPage(1); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedSkill === sk
                ? 'bg-indigo-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {sk}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw size={32} className="animate-spin text-cyan-400 mb-3" />
          <p className="text-sm">Loading candidates from database...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Users size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-base font-semibold text-white">No candidates match the specified criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search terms or filters.</p>
        </div>
      ) : (
        /* Candidate Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 transition flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                      {cand.candidate_name}
                    </h3>
                    <p className="text-xs font-semibold text-cyan-400 mt-0.5">{cand.target_job_title}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                    {cand.seniority_level}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-500" /> {cand.location || 'India'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} className="text-slate-500" /> {cand.total_experience_years} yrs
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mt-3 leading-relaxed">
                  {cand.career_summary || 'Experienced software professional.'}
                </p>

                {/* Capability Tags */}
                <div className="flex flex-wrap gap-1 mt-3.5">
                  {cand.capability_tags && cand.capability_tags.length > 0 ? (
                    cand.capability_tags.slice(0, 4).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700/60">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-500">Skills on profile</span>
                  )}
                  {cand.capability_tags && cand.capability_tags.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                      +{cand.capability_tags.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">#{cand.id}</span>
                <button
                  onClick={() => handleSelectCandidate(cand.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition border border-cyan-500/20"
                >
                  <Eye size={13} /> View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <span>
            Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{pages}</strong> ({total} candidates)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 font-semibold text-white">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              <ChevronRight size={16} />
            </button>
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
