'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings as SettingsIcon, Bell, Moon, ShieldCheck, Database } from 'lucide-react';

interface ToggleSetting {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  default: boolean;
}

const SETTINGS: ToggleSetting[] = [
  { key: 'email_alerts', label: 'Email Notifications', desc: 'Receive placement and recruiter activity alerts by email.', icon: Bell, default: true },
  { key: 'dark_theme', label: 'Dark Theme', desc: 'Use the dark command-center interface (recommended).', icon: Moon, default: true },
  { key: 'two_factor', label: 'Two-Factor Authentication', desc: 'Require an additional verification step at admin login.', icon: ShieldCheck, default: false },
  { key: 'auto_reprocess', label: 'Auto Resume Reprocessing', desc: 'Automatically re-parse resumes when extraction models update.', icon: Database, default: true }
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(SETTINGS.map((s) => [s.key, s.default]))
  );

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

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 py-10 relative overflow-clip">
      <div className="space-y-8 px-6 max-w-4xl mx-auto relative z-10 w-full">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900/60 pb-6 gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono uppercase tracking-wider">
              <SettingsIcon className="w-3 h-3 text-blue-400" /> Platform Settings
            </span>
            <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Administration Preferences</h2>
          </div>
        </div>

        <div className="space-y-4">
          {SETTINGS.map((s) => {
            const Icon = s.icon;
            const on = toggles[s.key];
            return (
              <div key={s.key} className="p-5 rounded-2xl bg-zinc-950/45 border border-zinc-900 backdrop-blur-md flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">{s.label}</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={on}
                  aria-label={s.label}
                  onClick={() => setToggles((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer ${on ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-zinc-100 transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
