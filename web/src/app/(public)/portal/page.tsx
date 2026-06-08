'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, ShieldAlert, ArrowRight, Brain, Sparkles, Compass, Terminal } from 'lucide-react';

export default function PortalSelectionPage() {
  const router = useRouter();
  const [onboarded, setOnboarded] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    setOnboarded(localStorage.getItem('career_officer_onboarded') === 'true');
  }, []);

  const handleStudentClick = (e: React.MouseEvent) => {
    if (onboarded) {
      e.preventDefault();
      setSigningIn(true);
      setTimeout(() => {
        localStorage.setItem('career_officer_logged_in', 'true');
        localStorage.setItem('career_officer_token', 'sess_token_student_active');
        router.push('/dashboard');
      }, 700);
    }
  };

  return (
    <div className="flex-1 w-full min-h-[85vh] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#050507]">
      {/* 1. Animated Background Auroras */}
      <motion.div
        animate={{
          scale: [1, 1.15, 0.9, 1.05, 1],
          x: [-20, 30, -10, 20, -20],
          y: [-10, 20, -30, 10, -10],
          opacity: [0.15, 0.25, 0.12, 0.2, 0.15]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-[140px] top-[10%] left-[10%] -z-10 pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [0.9, 1.1, 0.95, 1.05, 0.9],
          x: [30, -20, 15, -10, 30],
          y: [20, -10, 25, -20, 20],
          opacity: [0.12, 0.22, 0.15, 0.18, 0.12]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
        className="absolute w-[550px] h-[380px] bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-[140px] bottom-[10%] right-[10%] -z-10 pointer-events-none"
      />

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 space-y-12">
        {/* Title / Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-xl"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono mx-auto uppercase tracking-wider">
            <Sparkles className="w-3 h-3 animate-pulse text-emerald-400" />
            Gateway Interface Select
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-none">
            Choose Your <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Placement Portal</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed max-w-md mx-auto">
            Launch your localized career engine to audit target resumes, scan monitered job boards, or track placement metrics.
          </p>
        </motion.div>

        {/* 2. Double Premium Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl px-4">
          {/* Student Portal Card */}
          <Link href="/student/onboarding" onClick={handleStudentClick} className="group h-full">
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-900 hover:border-emerald-500/30 flex flex-col justify-between h-96 text-left relative overflow-hidden shadow-[0_0_50px_0_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_0_rgba(16,185,129,0.08)] backdrop-blur-xl transition-all duration-300"
            >
              {/* Top border glowing highlight */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Corner hover glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-300" />

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all duration-300">
                    {signingIn ? (
                      <Terminal className="w-6 h-6 animate-spin text-emerald-450" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase">
                    {signingIn ? 'Authenticating...' : 'Student / Candidate'}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-zinc-100 group-hover:text-emerald-400 transition-colors duration-250">
                    {onboarded ? (signingIn ? 'Restoring Workspace...' : 'Resume Workspace') : 'Student Workspace'}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {onboarded 
                      ? 'Onboarding completed. Click to enter your dashboard context and continue managing your active placements and CV maps.'
                      : 'Analyze your CV dynamically, extract missing ATS keywords, scan Greenhouse/Lever portals, and orchestrate interview preps.'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-900/60">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-zinc-900/60 text-[9px] font-mono text-zinc-500 uppercase">Resume Alignment</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900/60 text-[9px] font-mono text-zinc-500 uppercase">Board Sync</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900/60 text-[9px] font-mono text-zinc-500 uppercase">ATS Audit</span>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-zinc-350 group-hover:text-emerald-400 transition-colors duration-200">
                  <span>{onboarded ? (signingIn ? 'Accessing Command...' : 'Enter Student Workspace') : 'Enter Student Onboarding'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-250" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Admin Portal Card */}
          <Link href="/admin/login" className="group h-full">
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-900 hover:border-blue-500/30 flex flex-col justify-between h-96 text-left relative overflow-hidden shadow-[0_0_50px_0_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_0_rgba(59,130,246,0.08)] backdrop-blur-xl transition-all duration-300"
            >
              {/* Top border glowing highlight */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Corner hover glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-300" />

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-zinc-950 transition-all duration-300">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase">
                    Admin / Placements Desk
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-zinc-100 group-hover:text-blue-400 transition-colors duration-250">
                    Placements Command
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Monitor institutional resumes parsing tasks, aggregate metrics, analyze student CGPA tiers, and configure corporate outreach portals.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-900/60">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-zinc-900/60 text-[9px] font-mono text-zinc-500 uppercase">Batch Extraction</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900/60 text-[9px] font-mono text-zinc-500 uppercase">Stats Aggregates</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900/60 text-[9px] font-mono text-zinc-500 uppercase">CGPA Tiers</span>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-zinc-355 group-hover:text-blue-400 transition-colors duration-200">
                  <span>Authenticate Portal Desk</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-250" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Footer Synced Notification */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono bg-zinc-950/60 border border-zinc-900/50 px-4 py-2 rounded-full shadow-md backdrop-blur-sm"
        >
          <Compass className="w-3.5 h-3.5 text-zinc-500" />
          <span>Local Placements Intelligence Protocol active & synced</span>
        </motion.div>
      </div>
    </div>
  );
}
