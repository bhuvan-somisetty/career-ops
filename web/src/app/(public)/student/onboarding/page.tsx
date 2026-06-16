'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, UploadCloud, ChevronRight, AlertTriangle, FileText,
  User, CheckCircle2,
} from 'lucide-react';
import StudentProfileEditor from '@/components/StudentProfileEditor';
import { type StudentProfileInput, type ResumeMeta, type AvatarMeta } from '@/types/student';

const STUDENT_ID_KEY = 'career_ops_student_id';

type Phase = 'loading' | 'welcome' | 'phase1' | 'phase2' | 'error';

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfileInput | null>(null);
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [avatar, setAvatar] = useState<AvatarMeta | null>(null);
  const [displayId, setDisplayId] = useState<string | null>(null);
  const [err, setErr] = useState('');

  async function fetchProfile(sid: string) {
    const res = await fetch(`/api/students/${sid}`);
    if (!res.ok) throw new Error('Could not load your profile.');
    return res.json();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!meRes.ok) { router.replace('/login'); return; }
        const me = await meRes.json();
        if (!me?.studentId) throw new Error('No profile linked to your account.');
        localStorage.setItem(STUDENT_ID_KEY, me.studentId);

        const data = await fetchProfile(me.studentId);
        if (cancelled) return;

        setStudentId(me.studentId);
        setProfile(data.profile as StudentProfileInput);
        setResume((data.resume as ResumeMeta) ?? null);
        setAvatar((data.avatar as AvatarMeta) ?? null);
        setDisplayId((data.studentId as string) ?? null);

        // If already completed onboarding, skip straight to dashboard.
        if (localStorage.getItem('career_ops_onboarded') === 'true') {
          router.replace('/dashboard');
          return;
        }

        setPhase('welcome');
      } catch (e) {
        if (!cancelled) { setErr((e as Error).message); setPhase('error'); }
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  // Called by StudentProfileEditor after a successful Phase 1 save.
  // Reload the profile from the server so Phase 2 has up-to-date data.
  async function advanceToPhase2() {
    if (studentId) {
      try {
        const data = await fetchProfile(studentId);
        setProfile(data.profile as StudentProfileInput);
        setResume((data.resume as ResumeMeta) ?? null);
      } catch { /* proceed with existing state */ }
    }
    setPhase('phase2');
  }

  function finishOnboarding() {
    localStorage.setItem('career_ops_onboarded', 'true');
    router.push('/dashboard');
  }

  /* ── Loading ── */
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center py-32 text-zinc-500 text-xs font-mono gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Preparing your workspace…
      </div>
    );
  }

  /* ── Error ── */
  if (phase === 'error') {
    return (
      <div className="max-w-md mx-auto mt-16 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0" /> {err}
      </div>
    );
  }

  /* ── Phase 1: Manual Profile Setup ── */
  if (phase === 'phase1') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-3">
          <User className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-bold block mb-0.5">
              Step 1 of 2
            </span>
            <h2 className="text-sm font-bold text-zinc-100">Set Up Your Profile</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Fill in your personal, address, contact, and professional information. All fields are editable
              anytime. Click <span className="text-zinc-200">Save Changes</span> to continue to the optional
              resume upload step.
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
          title="Step 1: Your Profile"
          hideResume
          onSaveSuccess={advanceToPhase2}
        />
      </div>
    );
  }

  /* ── Phase 2: Optional Resume Upload ── */
  if (phase === 'phase2') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
          <UploadCloud className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    Step 2 of 2 — Optional
                  </span>
                </div>
                <h2 className="text-sm font-bold text-zinc-100">
                  Upload Your Resume{' '}
                  <span className="text-zinc-500 font-normal text-xs">(Optional)</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Upload a PDF or DOCX — AI extracts your skills, education, and experience into your profile.
                  Review every field before saving. You can always do this later from your Profile.
                </p>
              </div>
              <button
                onClick={finishOnboarding}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Skip to Dashboard
              </button>
            </div>
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
          title="Step 2: Add Resume (Optional)"
        />
      </div>
    );
  }

  /* ── Welcome ── */
  return (
    <div className="flex-1 w-full min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-zinc-950/45 border border-zinc-900 rounded-3xl p-8 sm:p-10 backdrop-blur-xl space-y-6"
      >
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
            Welcome aboard
          </span>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
            Let&rsquo;s build your career profile
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Set up your profile in two simple steps. First, enter your personal and professional
            information. Then optionally upload your resume — AI will extract and pre-fill your details
            for you to review.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/60 flex items-start gap-3">
            <User className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Step 1: Your Profile</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Personal info, address, contact, skills, experience, education, projects, and more.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/60 flex items-start gap-3">
            <UploadCloud className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-200">
                Step 2: Resume{' '}
                <span className="text-zinc-600 font-normal">(Optional)</span>
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Upload PDF/DOCX — AI extracts your details automatically.
              </p>
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
            onClick={() => setPhase('phase1')}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            Set Up Profile <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
