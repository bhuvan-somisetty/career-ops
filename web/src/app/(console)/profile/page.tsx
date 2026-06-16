'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import StudentProfileEditor from '@/components/StudentProfileEditor';
import { type StudentProfileInput, type ResumeMeta, type AvatarMeta } from '@/types/student';

// The logged-in student's master-profile record id is kept in localStorage
// (student auth is a mock, so there is no server session to derive it from).
// This keeps the SAME record across refresh / reopen for this browser.
const STUDENT_ID_KEY = 'career_ops_student_id';

export default function ProfilePage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfileInput | null>(null);
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [avatar, setAvatar] = useState<AvatarMeta | null>(null);
  const [displayId, setDisplayId] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function resolveStudent() {
      try {
        // The owning Student.id comes from the session (set at signup). Resolve
        // it via /api/auth/me, falling back to the cached localStorage id.
        let id = localStorage.getItem(STUDENT_ID_KEY);
        try {
          const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
          if (meRes.ok) {
            const me = await meRes.json();
            if (me?.studentId) {
              id = me.studentId;
              localStorage.setItem(STUDENT_ID_KEY, me.studentId);
            }
          }
        } catch { /* offline — use cached id */ }

        if (!id) throw new Error('No profile is linked to your account yet.');

        const res = await fetch(`/api/students/${id}`);
        if (!res.ok) throw new Error('Could not load your profile.');
        const data = await res.json();
        if (!cancelled) {
          setStudentId(id);
          setProfile(data.profile as StudentProfileInput);
          setResume((data.resume as ResumeMeta) ?? null);
          setAvatar((data.avatar as AvatarMeta) ?? null);
          setDisplayId((data.studentId as string) ?? null);
          setState('ready');
        }
      } catch (e) {
        if (!cancelled) {
          setErr((e as Error).message || 'Failed to load your profile.');
          setState('error');
        }
      }
    }

    resolveStudent();
    return () => { cancelled = true; };
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-500 text-xs font-mono gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your profile…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="max-w-md mx-auto mt-10 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0" /> {err}
      </div>
    );
  }

  // Always edit-mode (studentId present): the editor PUTs to /api/students/[id]
  // and stays on the page — every Part 1 + Part 2 field, all multi-entry
  // sections, and resume extraction are reused exactly as on the admin side.
  return (
    <StudentProfileEditor
      initial={profile!}
      studentId={studentId!}
      resumeMeta={resume}
      avatarMeta={avatar}
      displayId={displayId}
      backHref="/dashboard"
      backLabel="Dashboard"
      title="My Profile"
    />
  );
}
