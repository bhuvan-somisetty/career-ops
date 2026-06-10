'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import StudentProfileEditor from '@/app/(public)/admin/students/StudentProfileEditor';
import { emptyProfile, type StudentProfileInput, type ResumeMeta, type AvatarMeta } from '@/types/student';

// The logged-in student's master-profile record id is kept in localStorage
// (student auth is a mock, so there is no server session to derive it from).
// This keeps the SAME record across refresh / reopen for this browser.
const STUDENT_ID_KEY = 'career_officer_student_id';

export default function ProfilePage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfileInput | null>(null);
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [avatar, setAvatar] = useState<AvatarMeta | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function resolveStudent() {
      try {
        // 1) Reuse the existing record for this browser if it still exists.
        const existing = localStorage.getItem(STUDENT_ID_KEY);
        if (existing) {
          const res = await fetch(`/api/students/${existing}`);
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              setStudentId(existing);
              setProfile(data.profile as StudentProfileInput);
              setResume((data.resume as ResumeMeta) ?? null);
              setAvatar((data.avatar as AvatarMeta) ?? null);
              setState('ready');
            }
            return;
          }
          localStorage.removeItem(STUDENT_ID_KEY); // stale id → recreate below
        }

        // 2) First visit: create the student's record via the SAME API.
        //    Required fields get editable placeholders the student replaces.
        const seed: StudentProfileInput = {
          ...emptyProfile(),
          firstName: 'New',
          lastName: 'Student',
          email: `student-${Date.now()}@careerofficer.local`,
        };
        const created = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seed),
        });
        const cj = await created.json();
        if (!created.ok) throw new Error(cj.error || 'Could not initialize your profile.');
        localStorage.setItem(STUDENT_ID_KEY, cj.id);
        if (!cancelled) {
          setStudentId(cj.id);
          setProfile(seed);
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
      backHref="/dashboard"
      backLabel="Dashboard"
      title="My Profile"
    />
  );
}
