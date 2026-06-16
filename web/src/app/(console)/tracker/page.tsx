'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

interface TrackedJob {
  id: string;
  jobId: string | null;
  company: string;
  role: string;
  location: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Funnel statuses map 1:1 to TrackedJob.status (Saved → Offer).
const STAGES = [
  { id: 'Saved', label: 'Saved', color: 'border-zinc-800 text-zinc-400 bg-zinc-900/10' },
  { id: 'Applied', label: 'Applied', color: 'border-blue-900/40 text-blue-400 bg-blue-500/5' },
  { id: 'Interview', label: 'Interview', color: 'border-purple-900/40 text-purple-400 bg-purple-500/5' },
  { id: 'Offer', label: 'Offer', color: 'border-emerald-900/40 text-emerald-400 bg-emerald-500/5' },
  { id: 'Rejected', label: 'Rejected', color: 'border-red-900/40 text-red-400 bg-red-500/5' },
];

export default function TrackerPage() {
  const [items, setItems] = useState<TrackedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<TrackedJob | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/tracker', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { tracked: [] }))
      .then((data) => setItems(data.tracked || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const persist = async (id: string, patch: { status?: string; notes?: string | null }) => {
    try {
      const res = await fetch(`/api/tracker/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) load();
    } catch {
      load();
    }
  };

  const moveTo = async (id: string, status: string) => {
    const prev = [...items];
    setItems((arr) => arr.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      const res = await fetch(`/api/tracker/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      if (!res.ok) setItems(prev);
    } catch {
      setItems(prev);
    } finally {
      setDraggingId(null);
    }
  };

  const remove = async (id: string) => {
    const prev = [...items];
    setItems((arr) => arr.filter((a) => a.id !== id));
    setSelected(null);
    try {
      const res = await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
      if (!res.ok) setItems(prev);
    } catch {
      setItems(prev);
    }
  };

  const openDetails = (a: TrackedJob) => {
    setSelected(a);
    setEditNotes(a.notes || '');
    setEditStatus(a.status);
  };

  const saveDetails = async () => {
    if (!selected) return;
    setItems((arr) => arr.map((a) => (a.id === selected.id ? { ...a, status: editStatus, notes: editNotes } : a)));
    await persist(selected.id, { status: editStatus, notes: editNotes });
    setSelected(null);
  };

  const filtered = items.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 h-full flex flex-col pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Job Tracker</h2>
          <p className="text-zinc-500 text-xs font-mono">Move saved jobs through your application funnel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Search saved roles..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs w-60 text-zinc-200 focus:outline-none focus:border-emerald-500/40" />
          </div>
          <button onClick={load} className="p-2 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors" title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-zinc-500 text-xs font-mono">Loading your tracker…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-zinc-500 text-xs space-y-2">
          <p>No tracked jobs yet.</p>
          <p>Head to <span className="text-emerald-400">Job Discovery</span> and save jobs to build your funnel.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 flex gap-4 min-h-[500px]">
          {STAGES.map((stage) => {
            const stageItems = filtered.filter((a) => a.status === stage.id);
            return (
              <div key={stage.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (draggingId) moveTo(draggingId, stage.id); }}
                className="w-72 shrink-0 flex flex-col bg-zinc-950/30 rounded-2xl border border-zinc-900/70 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3 select-none">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono border font-bold uppercase ${stage.color}`}>{stage.label}</span>
                  <span className="text-[10px] text-zinc-550 font-mono font-bold">{stageItems.length}</span>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-0.5">
                  {stageItems.length === 0 ? (
                    <div className="h-20 border border-dashed border-zinc-900 rounded-xl flex items-center justify-center text-zinc-700 text-[10px] font-mono">Drop here</div>
                  ) : (
                    stageItems.map((app) => (
                      <motion.div key={app.id} layoutId={`track-${app.id}`} draggable
                        onDragStart={() => setDraggingId(app.id)}
                        onClick={() => openDetails(app)}
                        whileHover={{ y: -3 }}
                        className={`p-4 rounded-xl border border-zinc-900 bg-zinc-950/45 hover:border-zinc-800 cursor-grab active:cursor-grabbing transition-all select-none space-y-2 ${draggingId === app.id ? 'opacity-30' : ''}`}>
                        <h4 className="font-bold text-xs text-zinc-200 line-clamp-1">{app.company}</h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{app.role}</p>
                        {app.location && <p className="text-[9px] text-zinc-600 font-mono">{app.location}</p>}
                        {app.notes && <p className="text-[10px] text-zinc-550 line-clamp-2 italic border-t border-zinc-900/60 pt-1.5">{app.notes}</p>}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)} className="fixed inset-0 bg-black/60 z-50 cursor-pointer backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[460px] bg-zinc-950 border-l border-zinc-900 p-6 sm:p-8 z-50 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">Tracked job</span>
                    <h3 className="font-extrabold text-sm text-zinc-200 mt-1">{selected.company}</h3>
                    <p className="text-[11px] text-zinc-500">{selected.role}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg border border-zinc-850 text-zinc-550 hover:text-zinc-200 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full p-3 bg-zinc-950 border border-zinc-900 focus:border-emerald-500/40 rounded-xl text-xs text-zinc-300 focus:outline-none">
                      {STAGES.map((s) => <option key={s.id} value={s.id} className="bg-zinc-950">{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">Notes</label>
                    <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={5}
                      placeholder="Interview details, contacts, salary quotes…"
                      className="w-full p-3 bg-zinc-950 border border-zinc-900 focus:border-emerald-500/40 rounded-xl text-xs text-zinc-300 focus:outline-none resize-none leading-relaxed" />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-900/60 pt-4 flex gap-3">
                <button onClick={() => remove(selected.id)}
                  className="py-2.5 px-4 bg-zinc-900 border border-zinc-850 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
                <button onClick={saveDetails}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 rounded-xl text-xs font-extrabold cursor-pointer">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
