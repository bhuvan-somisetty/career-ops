'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Sparkles,
  FileText,
  DollarSign,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  RefreshCw,
  Layers
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface Application {
  id: string;
  date: string;
  company: string;
  role: string;
  score: string;
  status: string;
  pdf: string;
  report: string;
  notes: string;
}

const STAGES = [
  { id: 'Saved Jobs', label: 'Saved Jobs', canonical: 'Evaluated', color: 'border-zinc-800 text-zinc-400 bg-zinc-900/10', glow: 'group-hover:border-zinc-800' },
  { id: 'Applied', label: 'Applied', canonical: 'Applied', color: 'border-blue-900/40 text-blue-400 bg-blue-500/5', glow: 'group-hover:border-blue-500/20' },
  { id: 'Screening', label: 'Screening', canonical: 'Responded', color: 'border-amber-900/40 text-amber-400 bg-amber-500/5', glow: 'group-hover:border-amber-500/20' },
  { id: 'Interview', label: 'Interview', canonical: 'Interview', color: 'border-purple-900/40 text-purple-400 bg-purple-500/5', glow: 'group-hover:border-purple-500/20' },
  { id: 'Final Round', label: 'Final Round', canonical: 'Interview', color: 'border-pink-900/40 text-pink-400 bg-pink-500/5', glow: 'group-hover:border-pink-500/20' },
  { id: 'Offer', label: 'Offer', canonical: 'Offer', color: 'border-emerald-900/40 text-emerald-400 bg-emerald-500/5', glow: 'group-hover:border-emerald-500/20' },
  { id: 'Rejected', label: 'Rejected', canonical: 'Rejected', color: 'border-red-900/40 text-red-400 bg-red-500/5', glow: 'group-hover:border-red-500/20' }
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const { symbol } = useCurrency();

  const loadApps = () => {
    setLoading(true);
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getCanonicalStatus = (uiStageId: string) => {
    const stage = STAGES.find(s => s.id === uiStageId);
    return stage ? stage.canonical : 'Evaluated';
  };

  const getUiStageId = (canonicalStatus: string, notes: string = '') => {
    if (canonicalStatus.toLowerCase() === 'interview' && notes.toLowerCase().includes('final round')) {
      return 'Final Round';
    }
    const stage = STAGES.find(s => s.canonical.toLowerCase() === canonicalStatus.toLowerCase());
    return stage ? stage.id : 'Saved Jobs';
  };

  const adjustNotesForStage = (notes: string, stageId: string) => {
    let newNotes = notes || '';
    if (stageId === 'Final Round') {
      if (!newNotes.toLowerCase().includes('final round')) {
        newNotes = newNotes ? `[Final Round] ${newNotes}` : 'Final Round interview scheduled.';
      }
    } else if (stageId === 'Interview') {
      newNotes = newNotes.replace(/\[Final Round\]\s*/gi, '').replace(/Final Round\s*/gi, '').trim();
    }
    return newNotes;
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (!draggingId) return;

    const draggingApp = applications.find(a => a.id === draggingId);
    if (!draggingApp) return;

    const targetCanonical = getCanonicalStatus(targetStageId);
    const prevApps = [...applications];
    const newNotes = adjustNotesForStage(draggingApp.notes, targetStageId);

    // Optimistic UI update
    setApplications(apps =>
      apps.map(app => (app.id === draggingId ? { ...app, status: targetCanonical, notes: newNotes } : app))
    );

    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggingId, status: targetCanonical, notes: newNotes })
      });

      if (!res.ok) {
        setApplications(prevApps);
      }
    } catch {
      setApplications(prevApps);
    } finally {
      setDraggingId(null);
    }
  };

  const openAppDetails = (app: Application) => {
    setSelectedApp(app);
    setEditNotes(app.notes);
    setEditStatus(getUiStageId(app.status, app.notes));
  };

  const saveAppDetails = async () => {
    if (!selectedApp) return;

    const targetCanonical = getCanonicalStatus(editStatus);
    const newNotes = adjustNotesForStage(editNotes, editStatus);

    setApplications(apps =>
      apps.map(app =>
        app.id === selectedApp.id ? { ...app, status: targetCanonical, notes: newNotes } : app
      )
    );

    try {
      await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedApp.id, status: targetCanonical, notes: newNotes })
      });
    } catch {
      loadApps();
    } finally {
      setSelectedApp(null);
    }
  };

  const filteredApps = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    if (app.status === 'SKIP') return false;
    return app.company.toLowerCase().includes(q) || app.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 h-full flex flex-col pb-6">
      {/* Tracker Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Applications Funnel</h2>
          <p className="text-zinc-500 text-xs font-mono">Orchestrate and coordinate your active interview pipelines</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search active roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-lg glass-input text-xs w-60"
            />
          </div>
          <button
            onClick={() => loadApps()}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
            title="Refresh database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Kanban Board columns wrapper */}
      <div className="flex-1 overflow-x-auto pb-4 flex gap-4 min-h-[500px]">
        {STAGES.map(stage => {
          const stageApps = filteredApps.filter(app => getUiStageId(app.status, app.notes) === stage.id);
          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-72 shrink-0 flex flex-col bg-zinc-950/30 rounded-2xl border border-zinc-900/70 p-4 space-y-4 group"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3 select-none">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono border font-bold uppercase ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-zinc-550 font-mono font-bold">{stageApps.length}</span>
                </div>
              </div>

              {/* Card List (Ashby-like design) */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-0.5 scrollbar-thin">
                {stageApps.length === 0 ? (
                  <div className={`h-24 border border-dashed border-zinc-900 rounded-xl flex items-center justify-center text-zinc-700 text-[10px] font-mono transition-colors duration-200 ${stage.glow}`}>
                    Drop opportunity here
                  </div>
                ) : (
                  stageApps.map(app => (
                    <motion.div
                      key={app.id}
                      layoutId={`pipeline-card-${app.id}`}
                      draggable
                      onDragStart={() => handleDragStart(app.id)}
                      onClick={() => openAppDetails(app)}
                      whileHover={{ y: -3, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`p-4 rounded-xl border border-zinc-900 bg-zinc-950/45 hover:border-zinc-800 hover:shadow-[0_4px_25px_rgba(0,0,0,0.4)] cursor-grab active:cursor-grabbing transition-all select-none space-y-3 relative overflow-hidden ${
                        draggingId === app.id ? 'opacity-30 scale-95' : ''
                      }`}
                    >
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                      
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-zinc-200 line-clamp-1 group-hover:text-emerald-400 transition-colors">{app.company}</h4>
                          <span className="text-[10px] font-mono font-black text-emerald-450">
                            {app.score}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{app.role}</p>
                      </div>

                      {app.notes && (
                        <p className="text-[10px] text-zinc-550 line-clamp-2 italic leading-relaxed border-t border-zinc-900/60 pt-2 font-sans">
                          {app.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[9px] text-zinc-600 font-mono pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-650" />
                          <span>{app.date}</span>
                        </div>
                        {app.pdf === '✅' && (
                          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono">PDF Tailored</span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Side-Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/60 z-50 cursor-pointer backdrop-blur-sm"
            />
            {/* Slideout Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-900 p-6 sm:p-8 z-50 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-0 inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4 select-none">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">Opportunity specs</span>
                    <h3 className="font-extrabold text-sm text-zinc-200 mt-1">{selectedApp.company}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-1.5 rounded-lg border border-zinc-850 text-zinc-550 hover:text-zinc-200 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">Target Position</label>
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-300">
                      {selectedApp.role}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">AI Match score</label>
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs font-bold text-emerald-450 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        {selectedApp.score} Match
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">Scanned Date</label>
                      <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-300 font-mono">
                        {selectedApp.date}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">Funnels Phase Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full p-3 bg-zinc-950 border border-zinc-900 focus:border-emerald-500/40 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                    >
                      {STAGES.map(s => (
                        <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-300">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">Pipeline Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={5}
                      placeholder="Add conversation updates, interview details, salary quotes..."
                      className="w-full p-3 bg-zinc-950 border border-zinc-900 focus:border-emerald-500/40 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 resize-none font-sans leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-900/60 pt-4 flex gap-3">
                {selectedApp.report && (
                  <Link href={`/reports/${selectedApp.report}`} className="flex-1">
                    <button className="w-full py-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5">
                      <FileText className="w-4 h-4 text-zinc-400" />
                      Open AI Report
                    </button>
                  </Link>
                )}
                <button
                  onClick={saveAppDetails}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 rounded-xl text-xs font-extrabold cursor-pointer shadow-lg shadow-emerald-500/10"
                >
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
