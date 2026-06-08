'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles,
  Search,
  FileCheck,
  TrendingUp,
  Activity,
  Layers,
  Award,
  Cpu,
  Brain,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  BookmarkCheck,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Zap,
  Target,
  UserCheck,
  Play
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const placeholderBrands = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Stripe', 
  'Atlassian', 'Adobe', 'Netflix', 'Salesforce', 'Uber'
];

const mockAnalyticsData = [
  { week: 'Wk 1', rate: 10 },
  { week: 'Wk 2', rate: 16 },
  { week: 'Wk 3', rate: 14 },
  { week: 'Wk 4', rate: 22 },
  { week: 'Wk 5', rate: 29 },
  { week: 'Wk 6', rate: 35 }
];

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse coordinates for dynamic radial spotlight glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax Scroll Effects
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div 
      ref={containerRef}
      className="w-full relative overflow-hidden bg-[#030305] text-zinc-100 flex flex-col items-center select-none"
      style={{
        // Inject cursor tracking variables into custom styles
        ['--mouse-x' as any]: `${mousePos.x}px`,
        ['--mouse-y' as any]: `${mousePos.y}px`,
      }}
    >
      {/* Dynamic Cursor Spotlight Light rays */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500 opacity-60"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(16, 185, 129, 0.04), transparent 80%)`
        }}
      />

      {/* 1. CINEMATIC AURORA BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Neon Blob 1 - Top Center */}
        <motion.div
          animate={{
            scale: [1, 1.2, 0.85, 1.05, 1],
            x: [-50, 40, -20, 30, -50],
            y: [-40, 30, -10, 20, -40],
            opacity: [0.15, 0.25, 0.12, 0.2, 0.15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[800px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-[140px] left-1/4 -top-60"
        />
        {/* Neon Blob 2 - Center Right */}
        <motion.div
          animate={{
            scale: [0.9, 1.15, 0.95, 1.1, 0.9],
            x: [30, -40, 20, -10, 30],
            y: [50, -20, 30, -40, 50],
            opacity: [0.1, 0.2, 0.15, 0.18, 0.1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-500/8 via-indigo-500/4 to-transparent blur-[140px] -right-32 top-1/4"
        />
      </div>

      {/* 2. FLOATING PARTICLES */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 1400 - 100,
              y: Math.random() * 1000 + 400,
              opacity: Math.random() * 0.3 + 0.1,
              scale: Math.random() * 0.7 + 0.3
            }}
            animate={{
              y: -200,
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 18 + 12,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500/20 blur-[1px]"
          />
        ))}
      </div>

      {/* 3. FULL-SCREEN CINEMATIC HERO */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 lg:pt-36 pb-32 min-h-screen flex flex-col lg:flex-row items-center gap-16 xl:gap-24">
        {/* Left: Content Block */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="flex-1 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start max-w-2xl mx-auto lg:mx-0"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            Introducing Career Officer v2.0
          </motion.div>

          <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.05] text-zinc-100">
            Your AI Career <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
              Operating System
            </span>
          </h1>

          <div className="space-y-2.5 text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg font-mono text-left">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Upload your resume.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: '200ms' }} />
              <span>Discover matching jobs.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '400ms' }} />
              <span>Track applications.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '600ms' }} />
              <span>Identify skill gaps.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '800ms' }} />
              <span>Accelerate your career.</span>
            </div>
          </div>

          {/* Premium Magnetic Button layout */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-4">
            <Link href="/portal" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black text-xs cursor-pointer shadow-[0_0_30px_0_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_0_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 group w-full sm:w-56"
              >
                Student Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </motion.button>
            </Link>
            <Link href="/admin/login" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/50 text-zinc-300 hover:text-zinc-150 font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2 w-full sm:w-56"
              >
                Admin Portal
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Right: Premium Interactive Dashboard Visuals */}
        <div className="flex-1 w-full relative h-[500px] lg:h-[600px] flex items-center justify-center">
          {/* Radar Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-30">
            <div className="w-[500px] h-[500px] border border-emerald-500/10 rounded-full relative overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 origin-center bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent"
              />
            </div>
          </div>

          {/* Card 1: Resume Analysis Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -50, y: -50 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="absolute top-4 left-4 sm:left-12 p-6 rounded-2xl bg-zinc-950/50 border border-zinc-900/80 backdrop-blur-xl w-64 shadow-[0_0_50px_0_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_0_rgba(16,185,129,0.1)] transition-all duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Resume ATS Metric</span>
              </div>
              <span className="text-[11px] font-mono font-black text-emerald-400">92%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-3">
              <div className="w-[92%] h-full bg-emerald-500" />
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Parsed 18/22 keywords successfully. missing <strong>Distributed DB</strong> context.
            </p>
          </motion.div>

          {/* Card 2: Job Match Fit Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50, y: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.25 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="absolute top-44 right-2 sm:right-10 p-6 rounded-2xl bg-zinc-950/50 border border-zinc-900/80 backdrop-blur-xl w-72 shadow-[0_0_50px_0_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_0_rgba(59,130,246,0.1)] transition-all duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-extrabold text-xs text-zinc-200">Staff LLMOps Engineer</h4>
                <span className="text-[9px] text-zinc-500 block mt-0.5 font-mono">Ashby — Bangalore (Hybrid)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                96% Match
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              "Strong alignment found with distributed systems design and Python model orchestrations."
            </p>
          </motion.div>

          {/* Card 3: Application Funnel Tracker Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -30, y: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="absolute bottom-6 left-2 sm:left-14 p-6 rounded-2xl bg-zinc-950/50 border border-zinc-900/80 backdrop-blur-xl w-80 shadow-[0_0_50px_0_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_0_rgba(168,85,247,0.1)] transition-all duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Search pipeline</span>
              <span className="text-[9px] font-mono text-zinc-550">Active campaign</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-900">
                <span className="text-sm font-black text-zinc-200 block">12</span>
                <span className="text-[8px] font-mono text-zinc-550 block uppercase">Inbox</span>
              </div>
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-900">
                <span className="text-sm font-black text-zinc-200 block">8</span>
                <span className="text-[8px] font-mono text-zinc-550 block uppercase">Applied</span>
              </div>
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-900">
                <span className="text-sm font-black text-zinc-200 block">4</span>
                <span className="text-[8px] font-mono text-emerald-400 block uppercase">Interv.</span>
              </div>
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-900">
                <span className="text-sm font-black text-emerald-400 block">2</span>
                <span className="text-[8px] font-mono text-emerald-500 block uppercase">Offers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. INFINITE BRAND MARQUEE */}
      <section className="relative z-10 w-full border-y border-zinc-950 bg-zinc-950/40 py-8 overflow-hidden select-none">
        <div className="w-full flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-6">
            Candidates secured placements and offers at world-class technology brands
          </span>
          <div className="w-full relative flex overflow-x-hidden pt-2">
            <div className="flex gap-16 py-2 animate-marquee whitespace-nowrap">
              {[...placeholderBrands, ...placeholderBrands, ...placeholderBrands].map((brand, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-450 transition-colors tracking-widest font-mono px-4 uppercase"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI RESUME ANALYSIS SECTION (SCROLL TRIGGERED) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            ATS Core Resume Audits
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
            Scan your CV blocks dynamically against target job descriptions. Audits technical frequency indices, parsing vulnerabilities, and highlights metric deficiencies.
          </p>
          <ul className="space-y-3.5 text-xs text-zinc-500 font-mono">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span>Full compliance check against Greenhouse and Ashby parsing pipelines</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span>Contextual replacement suggestions for weak verb descriptions</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-950/45 border border-zinc-900 shadow-2xl relative overflow-hidden backdrop-blur-md group hover:border-zinc-800 transition-colors"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-4">Parser Sync Diagnostic</span>
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900/60 space-y-4 font-mono text-xs shadow-inner">
            <div className="flex justify-between items-center text-zinc-300">
              <span>ATS Parsability Score</span>
              <span className="font-bold text-emerald-400">92% (Excellent)</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[92%]" />
            </div>
            <div className="p-3 rounded bg-zinc-900/40 border border-zinc-900/50 text-zinc-400 text-[11px] leading-relaxed">
              💡 <strong>CV Recommendation:</strong> Replace "managed model deployments" with "architected Triton Inference server orchestrations" for ML engineering profiles.
            </div>
          </div>
        </motion.div>
      </section>

      {/* 6. SMART JOB MATCHING SECTION (SCROLL TRIGGERED) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="lg:order-2 space-y-6"
        >
          <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg">
            <Search className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            Match Engine & Gap Audit
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
            Compare target requirements with CV blocks in real-time. Automatically isolates missing framework skills (e.g. Pinecone, Triton) and designs solutions.
          </p>
          <ul className="space-y-3.5 text-xs text-zinc-500 font-mono">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-400 shrink-0" />
              <span>Recommends relevant course modules for missing criteria</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-400 shrink-0" />
              <span>Real-time match percentages against local target profiles</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-950/45 border border-zinc-900 shadow-2xl relative overflow-hidden backdrop-blur-md group hover:border-zinc-800 transition-colors lg:order-1"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-4">Competency Map Matches</span>
          <div className="space-y-3">
            {[
              { skill: 'Vector Databases', desc: 'Required by Stripe (Pinecone, pgvector)', status: 'Missing' },
              { skill: 'Kubernetes Orchestration', desc: 'Required by Ashby Solutions', status: 'Matched' }
            ].map((g, idx) => (
              <div key={idx} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-300 block">{g.skill}</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">{g.desc}</span>
                </div>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                  g.status === 'Matched' 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 7. SEARCH VELOCITY TELEMETRY SECTION (SCROLL TRIGGERED) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-lg">
            <TrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            Campaign Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
            Review callback rates, interview success velocity, and pipeline volumes. Analytics help you understand search blocks and focus campaigns on high-response archetypes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-950/45 border border-zinc-900 shadow-2xl relative overflow-hidden backdrop-blur-md group hover:border-zinc-800 transition-colors"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-4">Callback Rate Growth (%)</span>
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAnalyticsData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#52525b" fontSize={9} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}
                />
                <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">User Feedback</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-150 tracking-tight">Vouched by Tech Directors & Candidates</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Landing my Head of Applied AI role was only possible by monitoring keyword gaps and tracking offers systematically in one local operating system.",
              author: "Santiago F.",
              role: "Head of Applied AI"
            },
            {
              quote: "The drag-and-drop pipeline helped me organize 8 concurrent interview cycles. The ATS parser caught 3 missing PyTorch requirements in time.",
              author: "Amit R.",
              role: "Staff ML Engineer"
            },
            {
              quote: "Admin desks helped our college placement cell process 400+ student profiles in days. Recruiters loved the structured skill mappings.",
              author: "Dr. Robert Carter",
              role: "Placement Director"
            }
          ].map((t, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 flex flex-col justify-between h-52 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-zinc-800 transition-colors">
              <p className="text-xs text-zinc-400 italic leading-relaxed">"{t.quote}"</p>
              <div className="border-t border-zinc-900/60 pt-4 flex justify-between items-center text-[10px] font-mono mt-2">
                <span className="font-semibold text-zinc-350">{t.author}</span>
                <span className="text-zinc-500">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
