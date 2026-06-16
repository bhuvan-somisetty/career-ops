'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Sparkles, Bookmark, BookmarkCheck, X, Building2, Tag,
  ExternalLink, Loader2, RefreshCw, Compass,
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

type SearchBy = 'title' | 'company';
type Tab = 'search' | 'recommended';

export default function JobDiscoveryPage() {
  const [tab, setTab] = useState<Tab>('search');
  const [searchBy, setSearchBy] = useState<SearchBy>('title');
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

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set(searchBy, query.trim());
      if (category !== 'All') params.set('category', category);
      const res = await fetch(`/api/jobs?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setJobs(data.jobs || []);
      if (data.categories) setCategories(data.categories);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [query, searchBy, category]);

  // Initial load + react to category changes.
  useEffect(() => { runSearch(); }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load existing tracked jobs so Save buttons reflect state.
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

  useEffect(() => { if (tab === 'recommended') loadRecs(); }, [tab, loadRecs]);

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
      setSavedIds((prev) => { const n = new Set(prev); n.delete(j.id); return n; });
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header + tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Job Discovery</h2>
          <p className="text-zinc-500 text-xs font-mono">Search the central job database by title or company</p>
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
            <RefreshCw className={`w-3 h-3 ${ingesting ? 'animate-spin text-emerald-400' : ''}`} />
            {ingesting ? 'Fetching live jobs…' : 'Fetch live ATS jobs'}
          </button>
        </div>
      </div>

      {tab === 'search' && (
        <>
          {/* Search controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 rounded-lg p-0.5 shrink-0">
              {(['title', 'company'] as SearchBy[]).map((s) => (
                <button key={s} onClick={() => setSearchBy(s)}
                  className={`px-3 py-1.5 rounded text-[10px] font-medium capitalize flex items-center gap-1 transition-colors cursor-pointer ${
                    searchBy === s ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}>
                  {s === 'title' ? <Search className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                  {s}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={searchBy === 'title' ? 'e.g. Software Engineer, Data Analyst, AI Engineer' : 'e.g. TCS, Google, Microsoft'}
                className="w-full pl-8 pr-24 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:border-emerald-500/40 focus:outline-none"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-[10px] font-bold cursor-pointer">
                Search
              </button>
            </form>
          </div>

          {/* Category chips */}
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
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[520px] bg-zinc-950 border-l border-zinc-900 p-6 z-50 overflow-y-auto">
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">{selected.title}</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{selected.company}{selected.location ? ` — ${selected.location}` : ''}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400">{selected.category || 'Other'} · via {selected.source}</span>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg border border-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              {selected.description && (
                <div className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap mb-6">{selected.description}</div>
              )}
              <div className="flex gap-3">
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
    <motion.div layout className="p-5 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-56 group cursor-pointer" onClick={onOpen}>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors">{job.title}</h4>
            <span className="text-[10px] text-zinc-500 font-mono">{job.company}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onSave(); }}
            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${saved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}>
            {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>
        {job.location && <div className="flex items-center gap-1.5 text-[10px] text-zinc-400"><MapPin className="w-3 h-3 text-zinc-600" />{job.location}</div>}
        {job.description && <p className="text-[10px] text-zinc-550 line-clamp-3 leading-relaxed">{job.description}</p>}
      </div>
      <div className="border-t border-zinc-900/50 pt-3 flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1"><Tag className="w-3 h-3" />{job.category || 'Other'}</span>
        {job.atsUrl && <a href={job.atsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-emerald-400 flex items-center gap-1 hover:underline">Apply <ExternalLink className="w-3 h-3" /></a>}
      </div>
    </motion.div>
  );
}
