'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, UploadCloud, Sparkles, ChevronRight, AlertTriangle, FileText, Target } from 'lucide-react';
import StudentProfileEditor from '@/components/StudentProfileEditor';
import { type StudentProfileInput, type ResumeMeta, type AvatarMeta } from '@/types/student';

const STUDENT_ID_KEY = 'career_ops_student_id';

type Phase = 'welcome' | 'editor';

// Real onboarding: resolve the session's linked Student, then drive the SAME
// profile editor used in the console — which already handles
// Upload Resume → Extraction API → populate fields → edit → Save.
export default function StudentOnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfileInput | null>(null);
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [avatar, setAvatar] = useState<AvatarMeta | null>(null);
  const [displayId, setDisplayId] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!meRes.ok) { router.replace('/login'); return; }
        const me = await meRes.json();
        if (!me?.studentId) throw new Error('No profile linked to your account.');
        localStorage.setItem(STUDENT_ID_KEY, me.studentId);

        const res = await fetch(`/api/students/${me.studentId}`);
        if (!res.ok) throw new Error('Could not load your profile.');
        const data = await res.json();
        if (cancelled) return;
        setStudentId(me.studentId);
        setProfile(data.profile as StudentProfileInput);
        setResume((data.resume as ResumeMeta) ?? null);
        setAvatar((data.avatar as AvatarMeta) ?? null);
        setDisplayId((data.studentId as string) ?? null);
        setState('ready');
      } catch (e) {
        if (!cancelled) { setErr((e as Error).message); setState('error'); }
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  // Mark onboarding complete the moment they reach the editor.
  useEffect(() => {
    if (phase === 'editor') localStorage.setItem('career_ops_onboarded', 'true');
  }, [phase]);

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center py-32 text-zinc-500 text-xs font-mono gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Preparing your workspace…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="max-w-md mx-auto mt-16 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0" /> {err}
      </div>
    );
  }

  if (phase === 'editor') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-zinc-100">Upload your resume to auto-fill your profile</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Use the <span className="text-zinc-200">Resume</span> section below to upload a PDF/DOCX — we extract your details into the form.
              Review, edit anything, then <span className="text-zinc-200">Save</span>. You can refine it anytime from your Profile.
            </p>
          </div>
        </div>
        <StudentProfileEditor
          initial={profile!}
          studentId={studentId!}
          resumeMeta={resume}
          avatarMeta={avatar}
          displayId={displayId}
          backHref="/dashboard"
          backLabel="Skip to Dashboard"
          title="Build Your Profile"
        />
      </div>
    );
  }

  // ── Welcome phase ──
  return (
    <div className="flex-1 w-full min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-zinc-950/45 border border-zinc-900 rounded-3xl p-8 sm:p-10 backdrop-blur-xl space-y-6"
      >
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Welcome aboard</span>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">Let&rsquo;s build your career profile</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Upload your resume and we&rsquo;ll extract your skills, education, experience, projects and certifications
            into an editable profile — then match you with jobs and track your applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/60 flex items-start gap-3">
            <UploadCloud className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Resume extraction</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">PDF/DOCX parsed into structured profile JSON.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/60 flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Job matching</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Recommendations from your skills & activity.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Skip for now
          </button>
          <button
            onClick={() => setPhase('editor')}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
