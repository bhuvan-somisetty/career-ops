'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, AlertTriangle, ArrowLeft, CheckCircle2, Copy, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  const resetLink = resetToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password?token=${resetToken}`
    : '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Request failed. Please try again.');
        return;
      }
      // token is returned because no email service is configured
      if (data.token) {
        setResetToken(data.token);
      } else {
        // Email not found — show success anyway (no enumeration)
        setResetToken('not-found');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (resetToken) {
    return (
      <div className="flex-1 w-full min-h-[80vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-zinc-950/50 border border-zinc-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6"
        >
          <div className="space-y-1.5 text-center">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-zinc-100">Reset link ready</h1>
            <p className="text-xs text-zinc-500">
              {resetToken === 'not-found'
                ? 'If that email is registered, a reset link would be shown here.'
                : 'Use the link below to set a new password. It expires in 1 hour.'}
            </p>
          </div>

          {resetToken !== 'not-found' && (
            <div className="space-y-3">
              <div className="px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-mono break-all leading-relaxed">
                {resetLink}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <Link
                  href={resetLink}
                  className="flex-1 flex items-center justify-center py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold transition-colors"
                >
                  Reset now
                </Link>
              </div>
              <p className="text-[10px] text-zinc-600 text-center">
                Email delivery is not configured. Share this link with the account owner.
              </p>
            </div>
          )}

          <Link href="/login" className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-zinc-950/50 border border-zinc-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6"
      >
        <div className="space-y-1.5 text-center">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-zinc-100">Forgot password</h1>
          <p className="text-xs text-zinc-500">Enter your account email to generate a reset link.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate reset link'}
          </button>
        </form>

        <Link href="/login" className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
