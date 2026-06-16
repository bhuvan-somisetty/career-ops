'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Sign up failed.');
        return;
      }
      localStorage.setItem('career_ops_logged_in', 'true');
      if (data.studentId) localStorage.setItem('career_ops_student_id', data.studentId);
      // New accounts go through resume → profile onboarding next.
      router.push('/student/onboarding');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-zinc-950/50 border border-zinc-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6"
      >
        <div className="space-y-1.5 text-center">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-zinc-100">Create your account</h1>
          <p className="text-xs text-zinc-500">Start building your career profile</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">First name</label>
              <input required value={form.firstName} onChange={set('firstName')}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Last name</label>
              <input required value={form.lastName} onChange={set('lastName')}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Email</label>
            <input type="email" required value={form.email} onChange={set('email')}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
              placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={set('password')}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
              placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-[11px] text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
