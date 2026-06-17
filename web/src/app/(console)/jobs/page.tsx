'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Sparkles, Bookmark, BookmarkCheck, X, Building2, Tag,
  ExternalLink, Loader2, RefreshCw, Compass, Filter, Calendar, DollarSign,
  Briefcase, Layers, Clock, Award, Plus, Trash2
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  category: string | null;
  atsUrl: string | null;
  careerPortalUrl: string | null;
  description: string | null;
  source: string;
  workMode: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string | null;
}

interface Recommendation {
  id: string;
  title: string;
  company: string;
  location: string | null;
  category: string | null;
  atsUrl: string | null;
  score: number;
  why: string[];
}

type Tab = 'search' | 'recommended';

export default function JobDiscoveryPage() {
  const [tab, setTab] = useState<Tab>('search');
  
  // Search state
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Job | null>(null);

  // Advanced Filters toggle
  const [showFilters, setShowFilters] = useState(false);

  // Advanced Filters state
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [company, setCompany] = useState('');
  const [datePosted, setDatePosted] = useState('all');
  const [skills, setSkills] = useState('');

  // Location autocomplete suggestion fetch
  useEffect(() => {
    if (locationInput.trim().length >= 2) {
      fetch(`/api/locations/autocomplete?q=${encodeURIComponent(locationInput)}`)
        .then((res) => (res.ok ? res.json() : { suggestions: [] }))
        .then((data) => setLocationSuggestions(data.suggestions || []))
        .catch(() => setLocationSuggestions([]));
    } else {
      setLocationSuggestions([]);
    }
  }, [locationInput]);

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (category !== 'All') params.set('category', category);
      if (selectedLocation.trim()) params.set('location', selectedLocation.trim());
      if (workModes.length > 0) params.set('workMode', workModes.join(','));
      if (employmentTypes.length > 0) params.set('employmentType', employmentTypes.join(','));
      if (experienceLevels.length > 0) params.set('experienceLevel', experienceLevels.join(','));
      if (salaryMin.trim()) params.set('salaryMin', salaryMin.trim());
      if (salaryMax.trim()) params.set('salaryMax', salaryMax.trim());
      if (company.trim()) params.set('company', company.trim());
      if (datePosted !== 'all') params.set('datePosted', datePosted);
      if (skills.trim()) params.set('skills', skills.trim());

      const res = await fetch(`/api/jobs?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setJobs(data.jobs || []);
      if (data.categories) setCategories(data.categories);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [
    query, category, selectedLocation, workModes, employmentTypes,
    experienceLevels, salaryMin, salaryMax, company, datePosted, skills
  ]);

  // Initial load + runSearch on dependencies
  useEffect(() => {
    runSearch();
  }, [category, selectedLocation, workModes, employmentTypes, experienceLevels, datePosted, runSearch]);

  // Load existing tracked jobs
  useEffect(() => {
    fetch('/api/tracker', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { tracked: [] }))
      .then((d) => setSavedIds(new Set((d.tracked || []).map((t: { jobId?: string }) => t.jobId).filter(Boolean))))
      .catch(() => {});
  }, []);

  const loadRecs = useCallback(async () => {
    setRecsLoading(true);
    try {
      const res = await fetch('/api/recommendations', { cache: 'no-store' });
      const data = await res.json();
      setRecs(data.recommendations || []);
    } catch {
      setRecs([]);
    } finally {
      setRecsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'recommended') loadRecs();
  }, [tab, loadRecs]);

  const saveJob = async (j: { id: string; title: string; company: string; location: string | null }) => {
    if (savedIds.has(j.id)) return;
    setSavedIds((prev) => new Set(prev).add(j.id));
    try {
      await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: j.id, company: j.company, role: j.title, location: j.location, status: 'Saved' }),
      });
    } catch {
      setSavedIds((prev) => {
        const n = new Set(prev);
        n.delete(j.id);
        return n;
      });
    }
  };

  const openJob = async (j: Job) => {
    setSelected(j);
    // Record the view (recommendation signal).
    fetch(`/api/jobs/${j.id}`, { cache: 'no-store' }).catch(() => {});
  };

  const ingest = async () => {
    setIngesting(true);
    try {
      await fetch('/api/jobs/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 25 }) });
      await runSearch();
    } catch {} finally {
      setIngesting(false);
    }
  };

  const handleWorkModeToggle = (mode: string) => {
    setWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleEmploymentTypeToggle = (type: string) => {
    setEmploymentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleExperienceLevelToggle = (level: string) => {
    setExperienceLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const resetFilters = () => {
    setLocationInput('');
    setSelectedLocation('');
    setWorkModes([]);
    setEmploymentTypes([]);
    setExperienceLevels([]);
    setSalaryMin('');
    setSalaryMax('');
    setCompany('');
    setDatePosted('all');
    setSkills('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header + tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Job Discovery</h2>
          <p className="text-zinc-500 text-xs font-mono">Search the central job database with advanced filters</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 rounded-lg p-0.5">
            {(['search', 'recommended'] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 rounded text-[10px] font-medium capitalize transition-colors cursor-pointer ${
                  tab === t ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
                {t === 'recommended' ? 'Recommended' : 'Search'}
              </button>
            ))}
          </div>
          <button onClick={ingest} disabled={ingesting}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] hover:bg-zinc-800 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${ingesting ? 'animate-spin text-emerald-400' : ''}`} />
            {ingesting ? 'Fetching live jobs…' : 'Fetch live ATS jobs'}
          </button>
        </div>
      </div>

      {tab === 'search' && (
        <>
          {/* Search controls */}
          <div className="flex flex-col gap-4 bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by job title, company, skills, or location (e.g. AI Engineer, Google)"
                  className="w-full pl-9 pr-24 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-250 focus:border-emerald-500/40 focus:outline-none"
                />
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-[10px] font-bold cursor-pointer">
                  Search
                </button>
              </form>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  showFilters ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Advanced Filters
              </button>
            </div>

            {/* Collapsible Advanced Filters Section */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-zinc-900/60 pt-4 mt-2 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Location Autocomplete */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">Location</label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-650" />
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => {
                            setLocationInput(e.target.value);
                            if (!e.target.value) setSelectedLocation('');
                          }}
                          placeholder="Search worldwide city, state, country..."
                          className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:border-emerald-500/40 focus:outline-none"
                        />
                        {selectedLocation && (
                          <button
                            onClick={() => {
                              setSelectedLocation('');
                              setLocationInput('');
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Location Suggestions Dropdown */}
                      {locationSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-zinc-950 border border-zinc-850 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                          {locationSuggestions.map((loc, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedLocation(loc.name);
                                setLocationInput(loc.name);
                                setLocationSuggestions([]);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-900 border-b border-zinc-900/50 last:border-none cursor-pointer flex justify-between items-center"
                            >
                              <span>{loc.name}</span>
                              <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                                {loc.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Company Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">Company</label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-650" />
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Google, Swiggy..."
                          className="w-full pl-9 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:border-emerald-500/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Skills Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">Required Skills</label>
                      <div className="relative">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-650" />
                        <input
                          type="text"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="e.g. React, Python, SQL"
                          className="w-full pl-9 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:border-emerald-500/40 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Work Mode */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Work Mode</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Remote', 'Hybrid', 'On-Site', 'Work From Home'].map((mode) => {
                          const selected = workModes.includes(mode);
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => handleWorkModeToggle(mode)}
                              className={`px-2.5 py-1 rounded-md text-[9px] font-mono border transition-colors cursor-pointer ${
                                selected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-350'
                              }`}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Employment Type */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Employment Type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Full-Time', 'Part-Time', 'Contract', 'Internship'].map((type) => {
                          const selected = employmentTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleEmploymentTypeToggle(type)}
                              className={`px-2.5 py-1 rounded-md text-[9px] font-mono border transition-colors cursor-pointer ${
                                selected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-350'
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Experience Level</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Fresher', 'Entry Level', 'Mid Level', 'Senior Level'].map((level) => {
                          const selected = experienceLevels.includes(level);
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => handleExperienceLevelToggle(level)}
                              className={`px-2.5 py-1 rounded-md text-[9px] font-mono border transition-colors cursor-pointer ${
                                selected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-350'
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Salary and Date Posted */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Salary & Date Posted</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-650" />
                          <input
                            type="number"
                            value={salaryMin}
                            onChange={(e) => setSalaryMin(e.target.value)}
                            placeholder="Min ($)"
                            className="w-full pl-7 pr-2 py-1 rounded-md bg-zinc-950 border border-zinc-900 text-[10px] text-zinc-200 focus:outline-none"
                          />
                        </div>
                        <div className="relative flex-1">
                          <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-650" />
                          <input
                            type="number"
                            value={salaryMax}
                            onChange={(e) => setSalaryMax(e.target.value)}
                            placeholder="Max ($)"
                            className="w-full pl-7 pr-2 py-1 rounded-md bg-zinc-950 border border-zinc-900 text-[10px] text-zinc-200 focus:outline-none"
                          />
                        </div>

                        <select
                          value={datePosted}
                          onChange={(e) => setDatePosted(e.target.value)}
                          className="px-2 py-1 rounded-md bg-zinc-950 border border-zinc-900 text-[10px] text-zinc-400 focus:outline-none cursor-pointer"
                        >
                          <option value="all">Date Posted</option>
                          <option value="24h">Last 24 hrs</option>
                          <option value="7d">Last 7 days</option>
                          <option value="30d">Last 30 days</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={resetFilters}
                      className="text-[10px] font-mono text-zinc-500 hover:text-red-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Reset Filters
                    </button>
                    <button
                      onClick={runSearch}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Facet chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', ...categories].map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                  category === c ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-zinc-500 text-xs font-mono gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs…
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-xs space-y-3">
              <Compass className="w-8 h-8 mx-auto text-zinc-700" />
              <p>No jobs found. Try a different search, or click <span className="text-emerald-400">Fetch live ATS jobs</span>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} saved={savedIds.has(job.id)} onSave={() => saveJob(job)} onOpen={() => openJob(job)} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'recommended' && (
        recsLoading ? (
          <div className="flex items-center justify-center py-24 text-zinc-500 text-xs font-mono gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Computing recommendations…
          </div>
        ) : recs.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-xs space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-zinc-700" />
            <p>No recommendations yet. Add skills to your profile, search jobs, and save a few — then check back.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recs.map((r) => (
              <div key={r.id} className="p-5 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-56">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-zinc-200">{r.title}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono">{r.company}</span>
                    </div>
                    <button onClick={() => saveJob(r)}
                      className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${savedIds.has(r.id) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>
                      {savedIds.has(r.id) ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {r.location && <div className="flex items-center gap-1.5 text-[10px] text-zinc-400"><MapPin className="w-3 h-3 text-zinc-600" />{r.location}</div>}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {r.why.map((w, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/15 text-[9px] text-emerald-400">{w}</span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-zinc-900/50 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1"><Tag className="w-3 h-3" />{r.category || 'Other'}</span>
                  {r.atsUrl && <a href={r.atsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-400 flex items-center gap-1 hover:underline">Apply <ExternalLink className="w-3 h-3" /></a>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)} className="fixed inset-0 bg-black/60 z-50 cursor-pointer" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[520px] bg-zinc-950 border-l border-zinc-900 p-6 z-50 overflow-y-auto flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100">{selected.title}</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{selected.company}{selected.location ? ` — ${selected.location}` : ''}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400">{selected.category || 'Other'}</span>
                      {selected.workMode && <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-emerald-400">{selected.workMode}</span>}
                      {selected.employmentType && <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400">{selected.employmentType}</span>}
                      {selected.experienceLevel && <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-blue-400">{selected.experienceLevel}</span>}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1 rounded-lg border border-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                {/* Meta block: Salary & Source */}
                <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-zinc-900/40 border border-zinc-900 text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-550 block uppercase">Est. Salary Range</span>
                    <span className="font-bold text-zinc-200">
                      {selected.salaryMin ? `$${(selected.salaryMin / 1000).toFixed(0)}k - $${(selected.salaryMax ? selected.salaryMax / 1000 : 0).toFixed(0)}k` : 'Not Specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-zinc-550 block uppercase">Ingestion Source</span>
                    <span className="font-bold text-zinc-350 capitalize">{selected.source}</span>
                  </div>
                </div>

                {/* Skills requirements */}
                {selected.skills && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-zinc-550 block uppercase">Desired Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.skills.split(',').map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[9px] text-emerald-400 font-mono">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.description && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-zinc-550 block uppercase">Job Details</span>
                    <div className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{selected.description}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 border-t border-zinc-900 pt-4 mt-6">
                <button onClick={() => saveJob(selected)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer border ${savedIds.has(selected.id) ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 border-transparent'}`}>
                  {savedIds.has(selected.id) ? 'Saved to Tracker' : 'Save to Tracker'}
                </button>
                {selected.atsUrl && (
                  <a href={selected.atsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 flex items-center justify-center gap-1.5">
                    Apply on ATS <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function JobCard({ job, saved, onSave, onOpen }: { job: Job; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return (
    <motion.div layout className="p-5 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-64 group cursor-pointer hover:border-zinc-800 transition-all duration-300" onClick={onOpen}>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors line-clamp-1">{job.title}</h4>
            <span className="text-[10px] text-zinc-500 font-mono">{job.company}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onSave(); }}
            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${saved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}>
            {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Location & Work Mode tags */}
        <div className="flex flex-wrap gap-1.5 items-center text-[9px] text-zinc-400">
          {job.location && (
            <span className="flex items-center gap-0.5 font-mono">
              <MapPin className="w-2.5 h-2.5 text-zinc-650" />
              {job.location.split(',')[0].trim()}
            </span>
          )}
          <span>·</span>
          {job.workMode && (
            <span className="flex items-center gap-0.5 text-emerald-400 font-mono">
              <Clock className="w-2.5 h-2.5 text-emerald-500/50" />
              {job.workMode}
            </span>
          )}
          {job.experienceLevel && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-blue-400 font-mono">
                <Layers className="w-2.5 h-2.5 text-blue-500/50" />
                {job.experienceLevel}
              </span>
            </>
          )}
        </div>

        {job.description && <p className="text-[10px] text-zinc-500 line-clamp-3 leading-relaxed">{job.description}</p>}
      </div>

      <div className="border-t border-zinc-900/50 pt-3 flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1"><Tag className="w-3 h-3" />{job.category || 'Other'}</span>
        {job.salaryMin && (
          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
            ${(job.salaryMin / 1000).toFixed(0)}k-${(job.salaryMax ? job.salaryMax / 1000 : 0).toFixed(0)}k
          </span>
        )}
      </div>
    </motion.div>
  );
}
