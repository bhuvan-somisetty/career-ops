'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ArrowRight, Compass } from 'lucide-react';

// Entry gateway. Admin portal removed — this is a student-only career portal.
export default function PortalEntryPage() {
  return (
    <div className="flex-1 w-full min-h-[85vh] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#050507]">
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.24, 0.15] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-[140px] top-[10%] left-[10%] -z-10 pointer-events-none"
      />

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center relative z-10 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 max-w-xl"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono mx-auto uppercase tracking-wider">
            Career Operating System
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-none">
            Your <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Career Portal</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Upload your resume, build your profile, discover jobs across every company, track applications, and get personalized recommendations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/signup" className="group">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-900 hover:border-emerald-500/30 flex flex-col justify-between h-56 text-left backdrop-blur-xl transition-all"
            >
              <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-100 group-hover:text-emerald-400 transition-colors">New here?</h3>
                <p className="text-xs text-zinc-400 mt-1">Create an account and onboard with your resume.</p>
                <div className="flex items-center gap-1 text-xs font-bold text-zinc-300 group-hover:text-emerald-400 mt-3">
                  Get started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/login" className="group">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-900 hover:border-blue-500/30 flex flex-col justify-between h-56 text-left backdrop-blur-xl transition-all"
            >
              <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-zinc-950 transition-all">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-100 group-hover:text-blue-400 transition-colors">Returning?</h3>
                <p className="text-xs text-zinc-400 mt-1">Sign in to your workspace and continue.</p>
                <div className="flex items-center gap-1 text-xs font-bold text-zinc-300 group-hover:text-blue-400 mt-3">
                  Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono bg-zinc-950/60 border border-zinc-900/50 px-4 py-2 rounded-full">
          <Compass className="w-3.5 h-3.5 text-zinc-500" />
          <span>Student career intelligence — resume, jobs, tracker & recommendations</span>
        </div>
      </div>
    </div>
  );
}
