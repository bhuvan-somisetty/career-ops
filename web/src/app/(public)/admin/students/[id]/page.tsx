'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import StudentProfileEditor from '../StudentProfileEditor';
import { useAdminAuth } from '../../useAdminAuth';
import type { StudentProfileInput } from '@/types/student';

export default function EditStudentPage() {
  const { authorized, loading: authLoading } = useAdminAuth();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [profile, setProfile] = useState<StudentProfileInput | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    if (!authorized || !id) return;
    fetch(`/api/students/${id}`)
      .then(async (res) => {
        if (!res.ok) { setState('notfound'); return; }
        const data = await res.json();
        setProfile(data.profile);
        setState('ready');
      })
      .catch(() => setState('notfound'));
  }, [authorized, id]);

  if (authLoading) return <div className="min-h-screen bg-[#050507] text-zinc-500 font-mono text-[10px] flex items-center justify-center">Verifying administration credentials...</div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 py-10 px-6">
      {state === 'loading' && (
        <div className="flex items-center justify-center py-24 text-zinc-500 text-xs font-mono gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading profile…</div>
      )}
      {state === 'notfound' && (
        <div className="max-w-4xl mx-auto text-center py-24 space-y-4">
          <p className="text-sm text-zinc-400">Student not found.</p>
          <Link href="/admin/students" className="inline-block text-[11px] font-mono text-blue-400 hover:text-blue-300">← Back to all students</Link>
        </div>
      )}
      {state === 'ready' && profile && id && <StudentProfileEditor initial={profile} studentId={id} />}
    </div>
  );
}
