'use client';

import React from 'react';
import StudentProfileEditor from '../StudentProfileEditor';
import { useAdminAuth } from '../../useAdminAuth';
import { emptyProfile } from '@/types/student';

export default function NewStudentPage() {
  const { authorized, loading } = useAdminAuth();
  if (loading) return <div className="min-h-screen bg-[#050507] text-zinc-500 font-mono text-[10px] flex items-center justify-center">Verifying administration credentials...</div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 py-10 px-6">
      <StudentProfileEditor initial={emptyProfile()} />
    </div>
  );
}
