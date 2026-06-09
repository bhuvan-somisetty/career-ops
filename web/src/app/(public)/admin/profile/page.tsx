'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Mail, Building2, BadgeCheck, Calendar } from 'lucide-react';

export default function AdminProfilePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('career_officer_admin_logged_in');
    if (adminLoggedIn !== 'true') {
      router.replace('/admin/login');
    } else {
      setAuthorized(true);
    }
    setLoadingAuth(false);
  }, [router]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#050507] text-zinc-500 font-mono text-[10px] flex items-center justify-center">
        Verifying administration credentials...
      </div>
    );
  }
  if (!authorized) return null;

  const permissions = ['read:students', 'write:students', 'export:reports', 'manage:placements', 'reprocess:resumes'];

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 py-10 relative overflow-clip">
      <div className="space-y-8 px-6 max-w-4xl mx-auto relative z-10 w-full">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900/60 pb-6 gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-blue-400" /> Administrator Profile
            </span>
            <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Account Details</h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-black text-xl text-blue-400 shrink-0">
              RC
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-zinc-100">Dr. Robert Carter</h3>
              <p className="text-xs text-zinc-400 font-mono">Placement Cell Director</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
            {[
              { icon: Mail, label: 'Email', value: 'r.carter@careerofficer.edu' },
              { icon: Building2, label: 'Institution', value: 'Institute of Technology' },
              { icon: BadgeCheck, label: 'Department', value: 'Training & Placement Cell' },
              { icon: Calendar, label: 'Member Since', value: 'August 2023' }
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    <Icon className="w-3.5 h-3.5 text-zinc-400" /> {f.label}
                  </div>
                  <p className="text-sm text-zinc-200 mt-1.5 font-medium">{f.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">Permissions</span>
            <div className="flex flex-wrap gap-2">
              {permissions.map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
