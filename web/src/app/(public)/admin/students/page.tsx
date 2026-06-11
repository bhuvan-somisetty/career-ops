'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Plus, Pencil, Trash2, Eye, RefreshCw, Users, Loader2, AlertTriangle,
} from 'lucide-react';
import { useAdminAuth } from '../useAdminAuth';
import type { StudentSummary } from '@/types/student';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'complete', label: 'Complete (80%+)' },
  { key: 'partial', label: 'Partial (40–79%)' },
  { key: 'incomplete', label: 'Incomplete (<40%)' },
];

export default function AdminStudentsPage() {
  const { authorized, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StudentSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filter) params.set('completeness', filter);
      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch { /* keep prior list */ } finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { if (authorized) { const t = setTimeout(load, 250); return () => clearTimeout(t); } }, [authorized, load]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/students/${deleteTarget.id}`, { method: 'DELETE' });
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  }

  if (authLoading) return <div className="min-h-screen bg-[#050507] text-zinc-500 font-mono text-[10px] flex items-center justify-center">Verifying administration credentials...</div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 py-10 relative overflow-clip">
      <div className="space-y-8 px-6 max-w-7xl mx-auto relative z-10 w-full">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900/60 pb-6 gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono uppercase tracking-wider">
              <Users className="w-3 h-3 text-blue-400" /> Student Master Records
            </span>
            <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Manage Students</h2>
          </div>
          <Link href="/admin/students/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shrink-0">
            <Plus className="w-4 h-4" /> Create Student
          </Link>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Student ID, name, email, or skill…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs text-zinc-200 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                  filter === f.key ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-500 text-xs font-mono gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading students…</div>
          ) : students.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-zinc-400">No students found.</p>
              <Link href="/admin/students/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer">
                <Plus className="w-4 h-4" /> Create the first student
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                    <th className="py-3 pr-2">Student ID</th>
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Program</th>
                    <th className="py-3 px-2">Skills</th>
                    <th className="py-3 px-2">Completeness</th>
                    <th className="py-3 pl-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="py-4 pr-2 font-mono text-[10px] text-emerald-300">{s.studentId || '—'}</td>
                      <td className="py-4 px-2 font-bold text-zinc-200">{s.firstName} {s.lastName}</td>
                      <td className="py-4 px-2 text-zinc-400 font-mono text-[10px]">{s.email}</td>
                      <td className="py-4 px-2 text-zinc-400">{s.topDegree || '—'}{s.topInstitution ? <span className="text-zinc-600"> · {s.topInstitution}</span> : null}</td>
                      <td className="py-4 px-2 text-zinc-400 font-mono">{s.skillCount}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-1.5 rounded-full ${s.profileCompleteness >= 80 ? 'bg-emerald-500' : s.profileCompleteness >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${s.profileCompleteness}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">{s.profileCompleteness}%</span>
                        </div>
                      </td>
                      <td className="py-4 pl-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/students/${s.id}`} title="View / Edit" className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:text-blue-400 hover:bg-blue-500/5 transition-colors cursor-pointer"><Eye className="w-3.5 h-3.5" /></Link>
                          <Link href={`/admin/students/${s.id}`} title="Edit" className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></Link>
                          <button onClick={() => router.push(`/admin/students/${s.id}?reprocess=1`)} title="Reprocess resume" className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:text-blue-400 hover:bg-blue-500/5 transition-colors cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(s)} title="Delete" className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: 'spring', duration: 0.3 }} className="relative bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl z-50 space-y-5">
              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-3"><AlertTriangle className="w-5 h-5" /></div>
                <h3 className="font-extrabold text-sm text-zinc-200 uppercase tracking-wider font-mono">Delete Student?</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">Permanently remove <span className="text-zinc-300 font-bold">{deleteTarget.firstName} {deleteTarget.lastName}</span> and all related records. This cannot be undone.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-bold transition-colors cursor-pointer">Cancel</button>
                <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-zinc-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
