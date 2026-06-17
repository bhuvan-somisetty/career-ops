'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, UploadCloud, ChevronRight, AlertTriangle, FileText,
  User, CheckCircle2, PenLine, Save,
} from 'lucide-react';
import StudentProfileEditor from '@/components/StudentProfileEditor';
import { type StudentProfileInput, type ResumeMeta, type AvatarMeta } from '@/types/student';

const STUDENT_ID_KEY = 'career_ops_student_id';

type Phase = 'loading' | 'welcome' | 'phase1' | 'phase2' | 'error';
type Phase2Mode = 'choice' | 'manual' | 'resume';

/* ── tiny shared primitives (matching StudentProfileEditor style) ── */
function Field({ label, value, onChange, type = 'text', required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
        {label}{required && <span className="text-emerald-400"> *</span>}
      </span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-sm text-zinc-200 transition-all"
      />
    </label>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
      <h3 className="font-extrabold text-sm text-zinc-200">{title}</h3>
      {desc && <p className="text-[11px] text-zinc-500 mt-0.5 mb-4">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ── main component ── */
export default function StudentOnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [phase2Mode, setPhase2Mode] = useState<Phase2Mode>('choice');

  // full profile (used by Phase 2 editor)
  const [studentId, setStudentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfileInput | null>(null);
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [avatar, setAvatar] = useState<AvatarMeta | null>(null);
  const [displayId, setDisplayId] = useState<string | null>(null);
  const [err, setErr] = useState('');

  // Phase 1 local form state — only student-info fields
  const [p1, setP1] = useState({
    firstName: '', middleName: '', lastName: '',
    aadhaarNumber: '', gender: '', nationality: '', dateOfBirth: '',
    address1: '', address2: '', city: '', state: '', district: '', pinCode: '', country: '',
    email: '', phone: '', altPhone: '',
  });
  const set1 = (k: keyof typeof p1, v: string) => setP1(prev => ({ ...prev, [k]: v }));

  const [saving1, setSaving1] = useState(false);
  const [error1, setError1] = useState('');

  async function fetchProfile(sid: string) {
    const res = await fetch(`/api/students/${sid}`);
    if (!res.ok) throw new Error('Could not load your profile.');
    return res.json();
  }

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!meRes.ok) {
          if (!cancelled) {
            setErr('Not authenticated.');
            setPhase('error');
            router.replace('/login');
          }
          return;
        }
        const me = await meRes.json();
        if (!me?.studentId) {
          if (!cancelled) {
            setErr('No student profile linked to your account.');
            setPhase('error');
          }
          return;
        }
        localStorage.setItem(STUDENT_ID_KEY, me.studentId);

        const data = await fetchProfile(me.studentId);
        if (cancelled) return;

        setStudentId(me.studentId);
        setProfile(data.profile as StudentProfileInput);
        setResume((data.resume as ResumeMeta) ?? null);
        setAvatar((data.avatar as AvatarMeta) ?? null);
        setDisplayId((data.studentId as string) ?? null);

        if (me.onboardingCompleted) {
          router.replace('/dashboard');
          return;
        }
        setPhase('phase1'); // Go straight to Phase 1: Student Information Form ONLY
      } catch (e) {
        if (!cancelled) { setErr((e as Error).message || 'Failed to resolve profile.'); setPhase('error'); }
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  // Pre-fill Phase 1 form from loaded profile (email from signup etc.)
  useEffect(() => {
    if (profile) {
      setP1({
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        aadhaarNumber: profile.aadhaarNumber || '',
        gender: profile.gender || '',
        nationality: profile.nationality || '',
        dateOfBirth: profile.dateOfBirth || '',
        address1: profile.address1 || '',
        address2: profile.address2 || '',
        city: profile.city || '',
        state: profile.state || '',
        district: profile.district || '',
        pinCode: profile.pinCode || '',
        country: profile.country || '',
        email: profile.email || '',
        phone: profile.phone || '',
        altPhone: profile.altPhone || '',
      });
    }
  }, [profile]);

  async function savePhase1() {
    if (!p1.firstName.trim() || !p1.lastName.trim() || !p1.email.trim()) {
      setError1('First name, last name and email are required.');
      return;
    }
    setSaving1(true);
    setError1('');
    try {
      // Merge Phase 1 scalars into the existing full profile (preserves any
      // professional data already stored) and save to the server.
      const body: StudentProfileInput = { ...profile!, ...p1 };
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError1(d.error || 'Failed to save. Please try again.');
        return;
      }
      // Reload the full profile so Phase 2 editor has fresh data
      const data = await fetchProfile(studentId!);
      setProfile(data.profile as StudentProfileInput);
      setResume((data.resume as ResumeMeta) ?? null);
      setPhase('phase2');
      setPhase2Mode('choice');
    } catch {
      setError1('Network error. Please try again.');
    } finally {
      setSaving1(false);
    }
  }

  async function finishOnboarding() {
    try {
      const res = await fetch('/api/auth/complete-onboarding', { method: 'POST' });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const d = await res.json().catch(() => ({}));
        setError1(d.error || 'Failed to complete onboarding on server.');
      }
    } catch {
      setError1('Network error while completing onboarding.');
    }
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
      <div className="max-w-md mx-auto mt-16 p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {err}
        </div>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer text-center transition-colors border border-zinc-800"
        >
          Try Again / Refresh
        </button>
      </div>
    );
  }

  /* ── Phase 1: Student Information ── */
  if (phase === 'phase1') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Step banner */}
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-3">
          <User className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-bold block mb-0.5">
              Step 1 of 2
            </span>
            <h2 className="text-sm font-bold text-zinc-100">Student Information</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Fill in your personal details, address, and contact information.
              Professional details (skills, experience, education) come in the next step.
            </p>
          </div>
        </div>

        {error1 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error1}
          </div>
        )}

        {/* Personal Information */}
        <Section title="Personal Information" desc="Your basic identity details.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="First Name" value={p1.firstName} onChange={v => set1('firstName', v)} required />
            <Field label="Middle Name" value={p1.middleName} onChange={v => set1('middleName', v)} />
            <Field label="Last Name" value={p1.lastName} onChange={v => set1('lastName', v)} required />
            <Field label="Aadhaar Number" value={p1.aadhaarNumber} onChange={v => set1('aadhaarNumber', v)} placeholder="12-digit number" />
            <Field label="Gender" value={p1.gender} onChange={v => set1('gender', v)} placeholder="Male / Female / Other" />
            <Field label="Nationality" value={p1.nationality} onChange={v => set1('nationality', v)} placeholder="e.g. Indian" />
            <Field label="Date of Birth" value={p1.dateOfBirth} onChange={v => set1('dateOfBirth', v)} placeholder="YYYY-MM-DD" />
          </div>
        </Section>

        {/* Address Information */}
        <Section title="Address Information" desc="Your current residential address.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address Line 1" value={p1.address1} onChange={v => set1('address1', v)} />
            <Field label="Address Line 2" value={p1.address2} onChange={v => set1('address2', v)} />
            <Field label="City" value={p1.city} onChange={v => set1('city', v)} />
            <Field label="District" value={p1.district} onChange={v => set1('district', v)} />
            <Field label="State" value={p1.state} onChange={v => set1('state', v)} />
            <Field label="Pin Code" value={p1.pinCode} onChange={v => set1('pinCode', v)} />
            <Field label="Country" value={p1.country} onChange={v => set1('country', v)} placeholder="e.g. India" />
          </div>
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information" desc="How we (and employers) can reach you.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Email" value={p1.email} onChange={v => set1('email', v)} type="email" required />
            <Field label="Phone Number" value={p1.phone} onChange={v => set1('phone', v)} placeholder="+91 XXXXX XXXXX" />
            <Field label="Alternate Phone" value={p1.altPhone} onChange={v => set1('altPhone', v)} />
          </div>
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Skip to Dashboard
          </button>
          <button
            onClick={savePhase1}
            disabled={saving1}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving1
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />}
            Save & Continue
          </button>
        </div>
      </div>
    );
  }

  /* ── Phase 2 ── */
  if (phase === 'phase2') {

    /* Choice screen */
    if (phase2Mode === 'choice') {
      return (
        <div className="flex-1 w-full min-h-[70vh] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl space-y-6"
          >
            {/* Banner */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold block mb-0.5">
                  Step 1 Complete · Step 2 of 2
                </span>
                <h2 className="text-sm font-bold text-zinc-100">Build Your Professional Profile</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Add your skills, experience, education, projects, and certifications.
                  Choose how you&rsquo;d like to proceed — you can always do this later from your Profile.
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPhase2Mode('manual')}
                className="group text-left p-6 rounded-2xl bg-zinc-950/45 border border-zinc-800 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <PenLine className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mb-1">Option A: Manual Entry</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Fill in your professional details directly — experience, education, skills,
                  projects, and more. Full control over every field.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold">
                  Fill manually <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                onClick={() => setPhase2Mode('resume')}
                className="group text-left p-6 rounded-2xl bg-zinc-950/45 border border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 mb-1">Option B: Upload Resume</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Upload a PDF or DOCX — AI extracts your professional details automatically.
                  Review, edit, and accept before saving. Personal info is never overwritten.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  Upload & extract <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={finishOnboarding}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Skip — I&rsquo;ll do this later
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    /* Manual entry OR Resume upload → both use the professional editor */
    const isResumeMode = phase2Mode === 'resume';
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Step 2 banner */}
        <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 ${isResumeMode ? 'bg-emerald-500/5 border border-emerald-500/15' : 'bg-blue-500/5 border border-blue-500/15'}`}>
          {isResumeMode
            ? <UploadCloud className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            : <PenLine className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`text-[9px] font-mono uppercase tracking-widest font-bold block mb-0.5 ${isResumeMode ? 'text-emerald-400' : 'text-blue-400'}`}>
                  Step 2 of 2 — {isResumeMode ? 'Resume Upload' : 'Manual Entry'}
                </span>
                <h2 className="text-sm font-bold text-zinc-100">Professional Profile</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isResumeMode
                    ? 'Upload your resume — AI fills in the professional fields below. Review every value before saving. Your personal info from Step 1 is never touched.'
                    : 'Fill in your professional details. All sections are editable anytime from your Profile page.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPhase2Mode('choice')}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={finishOnboarding}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> Skip
                </button>
              </div>
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
          title="Professional Profile"
          professionalOnly
          hideResume={!isResumeMode}
          onSaveSuccess={finishOnboarding}
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
            Let&rsquo;s set up your career profile
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We&rsquo;ll guide you through two quick steps. First, your basic student information.
            Then, your professional profile — which you can fill manually or let AI extract
            from your resume.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/60 flex items-start gap-3">
            <User className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Step 1: Student Info</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Personal details, address, and contact information.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/60 flex items-start gap-3">
            <UploadCloud className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-200">
                Step 2: Professional Profile{' '}
                <span className="text-zinc-600 font-normal">(Optional)</span>
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Manual entry or AI resume extraction.
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
            Start Setup <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
