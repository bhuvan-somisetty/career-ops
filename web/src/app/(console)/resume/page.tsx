'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles, AlertTriangle, RefreshCw, Search, BookOpen, FileText, Eye, Download, UserPlus, Loader2,
} from 'lucide-react';
import type { ResumeMatch } from '@/lib/resumeMatch';

const STUDENT_ID_KEY = 'career_ops_student_id';

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ResumeMatchPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [match, setMatch] = useState<ResumeMatch | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'no-profile'>('loading');
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async (id: string, isSync = false) => {
    if (isSync) setSyncing(true); else setState('loading');
    try {
      const res = await fetch(`/api/students/${id}/match`, { cache: 'no-store' });
      if (!res.ok) { setState('no-profile'); return; }
      const data = await res.json();
      setMatch(data.match as ResumeMatch);
      setState('ready');
    } catch {
      setState('no-profile');
    } finally {
      if (isSync) setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const id = localStorage.getItem(STUDENT_ID_KEY);
    if (!id) { setState('no-profile'); return; }
    setStudentId(id);
    load(id);
  }, [load]);

  // ── No profile yet ──
  if (state === 'no-profile') {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6 text-blue-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-100">No resume to analyze yet</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            The Resume Match Engine analyzes <span className="text-zinc-300">your</span> saved profile and uploaded resume.
            Head to your Profile, upload a resume to auto-populate your details, and Save — then come back here.
          </p>
        </div>
        <Link href="/profile" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors">
          <UserPlus className="w-4 h-4" /> Go to My Profile
        </Link>
      </div>
    );
  }

  if (state === 'loading' || !match) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-500 text-xs font-mono gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your resume…
      </div>
    );
  }

  const ats = match.ats;
  const ringColor = ats.overall >= 80 ? 'text-emerald-400' : ats.overall >= 60 ? 'text-amber-400' : 'text-red-400';
  const barColor = (v: number) => (v >= 80 ? 'bg-emerald-500' : v >= 60 ? 'bg-amber-500' : 'bg-red-500');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Resume Match Engine</h2>
          <p className="text-zinc-500 text-xs font-mono">
            Live analysis of <span className="text-zinc-300">{match.name}</span>&rsquo;s profile · {match.domain}
          </p>
        </div>
        <button
          onClick={() => studentId && load(studentId, true)}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-800 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
          {syncing ? 'Syncing…' : 'Sync from Profile'}
        </button>
      </div>

      {!match.hasContent && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {match.fitSummary}
          <Link href="/profile" className="ml-auto underline whitespace-nowrap">Edit profile →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: actual resume content from the student's profile */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Source: Student Profile{match.resume.source ? ` · ${match.resume.source}` : ''}
            </span>
            {match.resume.hasFile && studentId && (
              <div className="flex items-center gap-1.5">
                <a href={`/api/students/${studentId}/resume`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <Eye className="w-3 h-3" /> View
                </a>
                <a href={`/api/students/${studentId}/resume?download=1`} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-300 hover:bg-zinc-800 transition-colors">
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
            )}
          </div>

          {match.resume.fileName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-950/60 border border-zinc-900 text-[10px] font-mono text-zinc-500">
              <FileText className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span className="truncate text-zinc-300">{match.resume.fileName}</span>
              <span className="ml-auto shrink-0">Updated {fmtDate(match.resume.uploadedAt)}</span>
            </div>
          )}

          <div className="p-6 rounded-xl glass-panel min-h-[480px] max-h-[680px] overflow-y-auto border border-zinc-900/80">
            {match.resumeText ? (
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-zinc-300">{match.resumeText}</pre>
            ) : (
              <div className="text-zinc-600 text-center py-24 font-mono text-[11px]">
                Your profile is empty. Add details on the Profile page.
              </div>
            )}
          </div>
        </div>

        {/* Right: metrics computed from the actual resume */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main Dial */}
          <div className="p-6 rounded-xl glass-panel grid grid-cols-1 sm:grid-cols-3 gap-6 items-center border border-zinc-900">
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl">
              <span className={`text-4xl font-extrabold tracking-tight ${match.goalAlignment >= 80 ? 'text-emerald-400' : match.goalAlignment >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {match.goalAlignment}%
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Goal Alignment</span>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Resume Fit: {match.fitTitle}
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">{match.fitSummary}</p>
              <div className="pt-1 flex flex-wrap items-center gap-4 text-[9px] text-zinc-500 font-mono">
                <span>Total Words: {match.wordCount}</span>
                <span>Profile: {match.completeness}% complete</span>
                <span>ATS Pass: {ats.passProbability}</span>
              </div>
            </div>
          </div>

          {/* Profile snapshot counts */}
          <div className="p-6 rounded-xl glass-panel border border-zinc-900">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono mb-3">Profile Snapshot</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {([
                ['Experience', match.counts.experience], ['Education', match.counts.education],
                ['Skills', match.counts.skills], ['Projects', match.counts.projects],
                ['Certifications', match.counts.certifications], ['Soft Skills', match.counts.softSkills],
                ['Achievements', match.counts.achievements], ['Awards', match.counts.awards],
              ] as [string, number][]).map(([label, n]) => (
                <div key={label} className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-900 text-center">
                  <div className="text-lg font-extrabold text-zinc-100">{n}</div>
                  <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ATS Compatibility */}
          <div className="p-6 rounded-xl glass-panel space-y-3 border border-zinc-900">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>ATS Compatibility Index</span>
              <span className={`font-bold ${ringColor}`}>{ats.overall}%</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Structural Score (sections &amp; formatting)</span>
                <span className="font-mono font-bold text-zinc-200">{ats.structural}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5"><div className={`${barColor(ats.structural)} h-1.5 rounded-full`} style={{ width: `${ats.structural}%` }} /></div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Keyword Alignment ({match.domain})</span>
                <span className="font-mono font-bold text-zinc-200">{ats.keyword}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5"><div className={`${barColor(ats.keyword)} h-1.5 rounded-full`} style={{ width: `${ats.keyword}%` }} /></div>
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="p-6 rounded-xl glass-panel space-y-3 border border-zinc-900">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Detected Skill Gaps
            </h3>
            {match.skillGaps.length === 0 ? (
              <p className="text-[10px] text-emerald-400 font-mono">No major gaps detected for {match.domain} roles. 🎯</p>
            ) : (
              <div className="space-y-2">
                {match.skillGaps.map((gap, i) => (
                  <div key={i} className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">{gap.skill}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${gap.impact === 'High' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                        {gap.impact} Impact
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-550">{gap.context}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Keywords */}
          {match.missingKeywords.length > 0 && (
            <div className="p-6 rounded-xl glass-panel space-y-3 border border-zinc-900">
              <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-zinc-500" /> Missing ATS Keywords
              </h3>
              <p className="text-[10px] text-zinc-500">
                Weaving these {match.domain} keywords into your experience and summary can raise your ATS pass rate:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {match.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">+ {kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable suggestions */}
          <div className="p-6 rounded-xl glass-panel space-y-3 border border-zinc-900">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-zinc-550" /> Actionable Recommendations
            </h3>
            <ul className="space-y-2">
              {match.improvements.map((imp, i) => (
                <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center font-mono text-[9px] text-zinc-500 shrink-0 mt-0.5">{i + 1}</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
