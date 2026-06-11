'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Key, Mail, Lock, User, Sparkles, Loader2, ArrowRight, Compass } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AdminAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@placement.edu',
    password: 'password',
    name: 'Dr. Robert Carter',
    institution: 'National Institute of Technology'
  });
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    setTimeout(() => {
      setLoading(false);
      if (mode === 'forgot') {
        setMsg('Reset token sent. Please verify your institution mailbox.');
      } else {
        localStorage.setItem('career_ops_admin_logged_in', 'true');
        router.push('/admin/dashboard');
      }
    }, 1200);
  };

  return (
    <div className="flex-1 w-full min-h-[85vh] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#050507]">
      {/* Background Auroras */}
      <motion.div
        animate={{
          scale: [1, 1.15, 0.95, 1],
          x: [-20, 15, -10, -20],
          y: [15, -10, 20, 15],
          opacity: [0.1, 0.2, 0.12, 0.1]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-[140px] top-[10%] left-[10%] -z-10 pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.1, 0.9, 1.05, 1.1],
          x: [15, -20, 10, 15],
          y: [-15, 10, -20, -15],
          opacity: [0.12, 0.18, 0.15, 0.12]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute w-[500px] h-[350px] bg-gradient-to-bl from-teal-500/10 via-emerald-500/5 to-transparent rounded-full blur-[140px] bottom-[10%] right-[10%] -z-10 pointer-events-none"
      />

      <div className="w-full max-w-md mx-auto flex flex-col items-center relative z-10 space-y-8">
        {/* Title */}
        <div className="text-center space-y-3 max-w-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-450 text-[10px] font-mono mx-auto uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Security Gateway
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Placements Auth
          </h2>
          <p className="text-zinc-550 text-xs font-mono">
            Access secure admin desk pipelines & corporate outreach monitors.
          </p>
        </div>

        {/* Card Panel */}
        <div className="w-full bg-zinc-950/45 border border-zinc-900 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_0_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Message Banner */}
          {msg && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] text-blue-400 font-mono">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 block uppercase">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-550" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 block uppercase">College / Institution</label>
                    <div className="relative">
                      <Sparkles className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-550" />
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={e => setFormData({ ...formData, institution: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs transition-all"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 block uppercase">Work Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-550" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs font-mono transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              {mode !== 'forgot' && (
                <motion.div
                  key="pass-field"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase">Security Key</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[9px] font-mono text-zinc-500 hover:text-zinc-350 transition-colors uppercase"
                    >
                      Forgot Key?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-550" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs font-mono transition-all"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-zinc-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : mode === 'login' ? (
                <>
                  Enter Placements Command
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'signup' ? (
                'Create Administrator Account'
              ) : (
                'Reset Password Key'
              )}
            </button>
          </form>

          {/* Tab Selector Links */}
          <div className="border-t border-zinc-900/60 pt-4 flex items-center justify-between text-[9px] font-mono text-zinc-500 select-none">
            {mode === 'login' ? (
              <>
                <span>New placement partner?</span>
                <button onClick={() => setMode('signup')} className="text-blue-450 hover:text-blue-300 font-bold transition-colors">
                  Register Institution
                </button>
              </>
            ) : (
              <>
                <span>Back to credentials?</span>
                <button onClick={() => setMode('login')} className="text-blue-450 hover:text-blue-300 font-bold transition-colors">
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sync Info Footer */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
          <Compass className="w-3.5 h-3.5 text-zinc-500" />
          <span>Local Admin Placements authorization protocol active</span>
        </div>
      </div>
    </div>
  );
}
