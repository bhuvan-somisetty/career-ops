'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useMotionTemplate,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import {
  Sparkles,
  Search,
  TrendingUp,
  Brain,
  ArrowRight,
  CheckCircle2,
  FileText,
  Zap,
  Target,
  UserCheck,
  Upload,
  Cpu,
  Gauge,
  Layers,
  Award,
  Star,
  Quote,
  Users,
  Briefcase,
  Building2,
  ChevronDown,
} from 'lucide-react';
import SmoothScroll from '@/components/SmoothScroll';
import {
  siGoogle, siMeta, siNetflix, siAtlassian, siStripe, siUber, siAirbnb,
  siSpotify, siIntel, siNvidia, siCisco, siAccenture, siInfosys, siWipro,
} from 'simple-icons';

/* ────────────────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────────────────── */

// Enterprise trust logos. `icon` carries an authentic monochrome SVG path
// (simple-icons) where available; the rest render as clean wordmark lockups.
const trustLogos: { name: string; path?: string }[] = [
  { name: 'Google', path: siGoogle.path },
  { name: 'Microsoft' },
  { name: 'Amazon' },
  { name: 'Meta', path: siMeta.path },
  { name: 'Netflix', path: siNetflix.path },
  { name: 'Adobe' },
  { name: 'Salesforce' },
  { name: 'Atlassian', path: siAtlassian.path },
  { name: 'Stripe', path: siStripe.path },
  { name: 'Uber', path: siUber.path },
  { name: 'Airbnb', path: siAirbnb.path },
  { name: 'Spotify', path: siSpotify.path },
  { name: 'LinkedIn' },
  { name: 'Oracle' },
  { name: 'Intel', path: siIntel.path },
  { name: 'NVIDIA', path: siNvidia.path },
  { name: 'IBM' },
  { name: 'PayPal' },
  { name: 'Cisco', path: siCisco.path },
  { name: 'Accenture', path: siAccenture.path },
  { name: 'TCS' },
  { name: 'Infosys', path: siInfosys.path },
  { name: 'Wipro', path: siWipro.path },
  { name: 'Goldman Sachs' },
  { name: 'JPMorgan' },
  { name: 'Morgan Stanley' },
];

const liveStats = [
  { to: 740, suffix: '+', label: 'Offers evaluated' },
  { to: 100, suffix: '+', label: 'Tailored CVs generated' },
  { to: 92, suffix: '%', label: 'Avg ATS parse score' },
  { to: 38, suffix: '%', label: 'Peak callback rate' },
];

const steps = [
  { icon: Upload, title: 'Upload Resume', desc: 'Drop your CV in any format. We parse experience, skills, and metrics in seconds.', accent: 'emerald' },
  { icon: Brain, title: 'AI Analysis', desc: 'Models audit ATS parsability, verb strength, and keyword coverage against live roles.', accent: 'teal' },
  { icon: Cpu, title: 'Career Intelligence', desc: 'Skill-gap mapping, health scoring, and trajectory modelling — computed for you.', accent: 'sky' },
  { icon: Target, title: 'Get Matched', desc: 'Ranked, fit-scored opportunities land in your pipeline. Apply with one tailored click.', accent: 'violet' },
];

const features = [
  { icon: FileText, title: 'Resume Analysis', desc: 'Deep structural read of every CV block with rewrite suggestions for weak phrasing.', accent: 'emerald', wide: true },
  { icon: Gauge, title: 'ATS Optimization', desc: 'Validate against Greenhouse, Ashby & Lever parsers before a recruiter sees it.', accent: 'teal' },
  { icon: Layers, title: 'Skill Gap Detection', desc: 'Isolate the exact frameworks a role needs that your profile is missing.', accent: 'sky' },
  { icon: Award, title: 'Career Health Score', desc: 'One composite metric tracking how market-ready your profile is, week over week.', accent: 'amber' },
  { icon: Search, title: 'Job Matching', desc: 'Real-time fit percentages across thousands of roles, ranked to your strengths.', accent: 'violet' },
  { icon: Zap, title: 'AI Recommendations', desc: 'Personalised next-best-actions: which courses, which roles, which edits move the needle.', accent: 'rose', wide: true },
];

const testimonials = [
  { quote: 'Landing my Head of Applied AI role only happened because I could track keyword gaps and offers in one operating system. It felt like having a recruiter on staff.', author: 'Santiago F.', role: 'Head of Applied AI', rating: 5 },
  { quote: 'The pipeline kept 8 concurrent interview cycles organised, and the ATS parser caught 3 missing PyTorch requirements before I submitted. It changed my hit rate.', author: 'Amit R.', role: 'Staff ML Engineer', rating: 5 },
  { quote: 'Our placement cell processed 400+ student profiles in days, not weeks. Recruiters loved the structured skill mappings — it made shortlisting effortless.', author: 'Dr. Robert Carter', role: 'Placement Director', rating: 5 },
];

const benefits = [
  { icon: Users, audience: 'Students', points: ['A market-ready resume tuned for every application', 'Honest fit scores so you spend effort where it counts', 'A clear, guided path to close skill gaps'], accent: 'emerald' },
  { icon: Briefcase, audience: 'Placement Officers', points: ['Process hundreds of student profiles in one console', 'Spot cohort-wide skill gaps before recruiters do', 'Track placement velocity with live analytics'], accent: 'sky' },
  { icon: Building2, audience: 'Recruiters', points: ['Structured, comparable candidate skill maps', 'Pre-validated, ATS-clean resumes only', 'Faster shortlisting with ranked match data'], accent: 'violet' },
];

const accentMap: Record<string, { text: string; bg: string; border: string; glow: string; ring: string }> = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'rgba(16,185,129,0.20)', ring: 'group-hover:border-emerald-500/40' },
  teal:    { text: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    glow: 'rgba(20,184,166,0.20)', ring: 'group-hover:border-teal-500/40' },
  sky:     { text: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     glow: 'rgba(56,189,248,0.20)', ring: 'group-hover:border-sky-500/40' },
  violet:  { text: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  glow: 'rgba(139,92,246,0.20)', ring: 'group-hover:border-violet-500/40' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   glow: 'rgba(245,158,11,0.20)', ring: 'group-hover:border-amber-500/40' },
  rose:    { text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    glow: 'rgba(244,63,94,0.20)',  ring: 'group-hover:border-rose-500/40' },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

/* ────────────────────────────────────────────────────────────
   PRIMITIVES
   ──────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-[0.2em]">
      {children}
    </span>
  );
}

/* count-up that fires when scrolled into view */
function Counter({ to, suffix = '', className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref} className={className}>{Math.round(val).toLocaleString()}{suffix}</span>;
}

/* self-drawing career trajectory */
function CareerGraph() {
  return (
    <svg viewBox="0 0 240 120" className="w-full h-full" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="cg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d="M0,100 C40,92 60,70 100,64 C140,58 160,30 240,14 L240,120 L0,120 Z" fill="url(#cg-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.1 }} />
      <motion.path d="M0,100 C40,92 60,70 100,64 C140,58 160,30 240,14" stroke="url(#cg-stroke)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.6, ease: 'easeInOut' }} />
      {[[100, 64], [240, 14]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="3.5" fill="#0a0a0a" stroke="#34d399" strokeWidth="2" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.2 + i * 0.25, type: 'spring', stiffness: 300 }} />
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   CURSOR-PROXIMITY REACTIVITY
   Returns a spring 0→1 value based on how close the cursor (viewport
   coords) is to an element. 1 = cursor over/at the element.
   ──────────────────────────────────────────────────────────── */
function useProximity(
  cvx: MotionValue<number>,
  cvy: MotionValue<number>,
  ref: React.RefObject<HTMLElement | null>,
  radius = 310,
) {
  const raw = useMotionValue(0);
  const val = useSpring(raw, { stiffness: 170, damping: 24, mass: 0.4, restDelta: 0.001 });
  useEffect(() => {
    let rect: DOMRect | null = null;
    const measure = () => { rect = ref.current?.getBoundingClientRect() ?? null; };
    measure();
    const compute = () => {
      if (!rect) return;
      const x = cvx.get(), y = cvy.get();
      // distance to the nearest edge (0 when cursor is inside the element)
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const d = Math.hypot(dx, dy);
      raw.set(Math.max(0, Math.min(1, 1 - d / radius)));
    };
    const u1 = cvx.on('change', compute);
    const u2 = cvy.on('change', compute);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => { u1(); u2(); window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [cvx, cvy, ref, radius]);
  return val;
}

/* Derived reactive styles for a glass card. `rgb` is the accent as "r,g,b". */
function useCardReact(
  cvx: MotionValue<number>,
  cvy: MotionValue<number>,
  ref: React.RefObject<HTMLElement | null>,
  rgb: string,
  radius = 310,
) {
  const p = useProximity(cvx, cvy, ref, radius);
  const borderColor = useTransform(p, [0, 1], ['rgba(255,255,255,0.10)', `rgba(${rgb},0.6)`]);
  const boxShadow = useTransform(
    p, [0, 1],
    ['0 20px 60px -15px rgba(0,0,0,0.9)', `0 30px 90px -16px rgba(0,0,0,0.95), 0 0 44px -4px rgba(${rgb},0.6)`],
  );
  const scale = useTransform(p, [0, 1], [1, 1.045]);
  const glow = useTransform(p, [0, 1], [0, 0.95]);
  return { borderColor, boxShadow, scale, glow };
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */

function Landing() {
  const [particles, setParticles] = useState<{ x: number; y: number; o: number; s: number; d: number; delay: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // ── Cursor as spring-smoothed motion values (viewport coords) ──
  const cvx = useMotionValue(-1000);
  const cvy = useMotionValue(-1000);
  const sx = useSpring(cvx, { stiffness: 130, damping: 20, mass: 0.45 });
  const sy = useSpring(cvy, { stiffness: 130, damping: 20, mass: 0.45 });
  // Big, soft, aurora-style spotlight (two layered radials, emerald → cyan).
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${sx}px ${sy}px, rgba(16,185,129,0.22), transparent 58%), radial-gradient(340px circle at ${sx}px ${sy}px, rgba(34,211,238,0.10), transparent 72%)`;

  // headline-local cursor coords for the illuminated text overlay
  const hx = useMotionValue(-9999);
  const hy = useMotionValue(-9999);
  const hsx = useSpring(hx, { stiffness: 250, damping: 28, mass: 0.3 });
  const hsy = useSpring(hy, { stiffness: 250, damping: 28, mass: 0.3 });
  const headlineMask = useMotionTemplate`radial-gradient(280px circle at ${hsx}px ${hsy}px, #000 0%, #000 26%, transparent 66%)`;

  useEffect(() => {
    setParticles(Array.from({ length: 34 }).map(() => ({
      x: Math.random() * 100, y: Math.random() * 100,
      o: Math.random() * 0.5 + 0.25, s: Math.random() * 0.8 + 0.4,
      d: Math.random() * 14 + 10, delay: Math.random() * 6,
    })));
  }, []);

  useEffect(() => {
    // seed the glow near the hero so it's visible before the first move
    cvx.set(window.innerWidth * 0.6);
    cvy.set(window.innerHeight * 0.42);
    let h1rect: DOMRect | null = null;
    const measure = () => { h1rect = h1Ref.current?.getBoundingClientRect() ?? null; };
    measure();
    const onMove = (e: MouseEvent) => {
      cvx.set(e.clientX);
      cvy.set(e.clientY);
      if (h1rect) { hx.set(e.clientX - h1rect.left); hy.set(e.clientY - h1rect.top); }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [cvx, cvy, hx, hy]);

  // ── Proximity reactivity for hero elements ──
  const atsRef = useRef<HTMLDivElement>(null);
  const matchRef = useRef<HTMLDivElement>(null);
  const trajRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const studentRef = useRef<HTMLButtonElement>(null);
  const adminRef = useRef<HTMLButtonElement>(null);

  const ats = useCardReact(cvx, cvy, atsRef, '16,185,129', 300);
  const match = useCardReact(cvx, cvy, matchRef, '56,189,248', 320);
  const traj = useCardReact(cvx, cvy, trajRef, '45,212,191', 320);
  const chip = useCardReact(cvx, cvy, chipRef, '245,158,11', 230);

  const studentP = useProximity(cvx, cvy, studentRef, 250);
  const studentShadow = useTransform(studentP, [0, 1], ['0 0 40px -6px rgba(16,185,129,0.45)', '0 0 64px 2px rgba(16,185,129,0.9)']);
  const adminP = useProximity(cvx, cvy, adminRef, 250);
  const adminBorder = useTransform(adminP, [0, 1], ['rgba(255,255,255,0.10)', 'rgba(52,211,153,0.6)']);
  const adminGlow = useTransform(adminP, [0, 1], [0, 0.85]);

  // ── Product screenshot lighting sweep (cursor-local) ──
  const imgx = useMotionValue(50);
  const imgy = useMotionValue(38);
  const isx = useSpring(imgx, { stiffness: 120, damping: 20 });
  const isy = useSpring(imgy, { stiffness: 120, damping: 20 });
  const imgLight = useMotionTemplate`radial-gradient(440px circle at ${isx}% ${isy}%, rgba(255,255,255,0.16), transparent 60%)`;
  const sheenLeft = useTransform(isx, [0, 100], ['-25%', '115%']);

  // page scroll progress bar
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // hero parallax
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 110]);
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0]);
  const visualY = useTransform(scrollY, [0, 600], [0, -50]);

  // showcase parallax
  const { scrollYProgress: showP } = useScroll({ target: showcaseRef, offset: ['start end', 'end start'] });
  const showFloatA = useSpring(useTransform(showP, [0, 1], [70, -70]), { stiffness: 60, damping: 20 });
  const showFloatB = useSpring(useTransform(showP, [0, 1], [-50, 60]), { stiffness: 60, damping: 20 });
  const showImgY = useTransform(showP, [0, 1], [40, -40]);

  return (
    <div
      ref={containerRef}
      className="bg-grain w-full relative bg-[#030305] text-zinc-100 flex flex-col items-center select-none overflow-x-clip"
    >
      {/* SCROLL PROGRESS BAR */}
      <motion.div
        style={{ scaleX: progressX }}
        className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400"
      />

      {/* ═══ PERSISTENT AMBIENT FIELD (fixed → no dark voids between sections) ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* dot grid with top mask */}
        <div className="absolute inset-0 grid-bg-dense opacity-70" />
        {/* aurora blobs — clearly visible now */}
        <motion.div
          animate={{ scale: [1, 1.2, 0.9, 1.05, 1], x: [-40, 40, -10, 30, -40], y: [-20, 30, 0, 20, -20], opacity: [0.4, 0.55, 0.35, 0.5, 0.4] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[700px] h-[480px] rounded-full bg-gradient-to-tr from-emerald-500/30 via-teal-500/15 to-transparent blur-[120px] left-1/4 -top-40"
        />
        <motion.div
          animate={{ scale: [0.9, 1.15, 0.95, 1.1, 0.9], x: [30, -40, 20, -10, 30], y: [40, -10, 30, -30, 40], opacity: [0.3, 0.45, 0.3, 0.4, 0.3] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-sky-500/25 via-indigo-500/12 to-transparent blur-[130px] -right-24 top-1/3"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 0.9, 1], opacity: [0.18, 0.3, 0.2, 0.18] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute w-[640px] h-[420px] rounded-full bg-gradient-to-t from-violet-600/22 to-transparent blur-[140px] left-1/3 top-2/3"
        />
        {/* gentle vignette to keep edges cinematic, not flat-black */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#020203_100%)]" />
      </div>

      {/* Premium cursor-reactive aurora spotlight (spring-smoothed, screen blend) */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[1] mix-blend-screen"
        style={{ background: spotlight }}
      />

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ y: [-10, -200], opacity: [0, p.o, 0] }}
            transition={{ duration: p.d, repeat: Infinity, ease: 'linear', delay: p.delay }}
            className="absolute rounded-full bg-emerald-300/60 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.s * 4}px`, height: `${p.s * 4}px` }}
          />
        ))}
      </div>

      {/* ════════ SECTION 1 — HERO ════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 lg:pt-24 pb-16 min-h-[88vh] flex flex-col lg:flex-row items-center gap-12 xl:gap-16">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} initial="hidden" animate="show" variants={stagger} className="flex-1 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start max-w-2xl mx-auto lg:mx-0">
          <motion.div variants={fadeUp}>
            <SectionLabel><Sparkles className="w-3.5 h-3.5 animate-pulse" /> Introducing Career Officer</SectionLabel>
          </motion.div>
          <motion.h1 ref={h1Ref} variants={fadeUp} className="relative text-5xl sm:text-7xl font-black tracking-tight leading-[1.02] text-zinc-50">
            {/* resting layer */}
            <span className="relative z-[1]">
              Your AI Career{' '}
              <span className="animate-gradient bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">Operating System</span>
            </span>
            {/* cursor-illuminated layer — only visible within the spotlight mask */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[2] text-white [text-shadow:0_0_24px_rgba(94,234,212,0.55)]"
              style={{ WebkitMaskImage: headlineMask, maskImage: headlineMask }}
            >
              Your AI Career{' '}
              <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-200 bg-clip-text text-transparent [filter:drop-shadow(0_0_18px_rgba(45,212,191,0.7))]">Operating System</span>
            </motion.span>
          </motion.h1>
          <motion.div variants={fadeUp} className="space-y-2.5 text-zinc-400 text-sm leading-relaxed font-mono text-left">
            {[['bg-emerald-400', 'Upload your resume.'], ['bg-teal-300', 'Discover matching jobs.'], ['bg-sky-400', 'Track applications.'], ['bg-violet-400', 'Identify skill gaps.'], ['bg-rose-400', 'Accelerate your career.']].map(([dot, text], i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} style={{ animationDelay: `${i * 180}ms` }} />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
            <Link href="/portal" className="w-full sm:w-auto">
              <motion.button ref={studentRef} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ boxShadow: studentShadow }} className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 group w-full sm:w-52">
                Student Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            </Link>
            <Link href="/admin/login" className="w-full sm:w-auto">
              <motion.button ref={adminRef} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ borderColor: adminBorder }} className="relative overflow-hidden px-8 py-4 rounded-xl bg-white/[0.03] border text-zinc-200 font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 w-full sm:w-52 backdrop-blur-sm">
                <motion.span aria-hidden style={{ opacity: adminGlow }} className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(45,212,191,0.22),transparent_70%)]" />
                <span className="relative">Admin Portal</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* visual cluster */}
        <motion.div style={{ y: visualY }} className="flex-1 w-full relative h-[460px] lg:h-[540px] flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-50">
            <div className="w-[440px] h-[440px] border border-emerald-500/15 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 origin-center bg-gradient-to-tr from-emerald-500/15 via-transparent to-transparent animate-spin-slow" />
            </div>
            <div className="absolute w-[300px] h-[300px] border border-sky-500/15 rounded-full" />
          </div>

          <div className="animate-float-slow absolute top-0 left-0 sm:left-4 z-20 w-60">
            <motion.div ref={atsRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.2 }} style={{ borderColor: ats.borderColor, boxShadow: ats.boxShadow, scale: ats.scale }} className="relative w-full p-5 rounded-2xl bg-zinc-950/70 border backdrop-blur-xl">
              <motion.div aria-hidden style={{ opacity: ats.glow }} className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.22),transparent_70%)]" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="relative flex justify-between items-center mb-3">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /><span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 uppercase">ATS Score</span></div>
                <span className="text-xs font-mono font-black text-emerald-400">92%</span>
              </div>
              <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" />
              </div>
              <p className="relative text-[10px] text-zinc-500 leading-relaxed">18/22 keywords parsed. Missing <strong className="text-zinc-300">Distributed DB</strong> context.</p>
            </motion.div>
          </div>

          <div className="animate-float-mid absolute top-32 right-0 sm:right-2 z-20 w-72">
            <motion.div ref={matchRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.35 }} style={{ borderColor: match.borderColor, boxShadow: match.boxShadow, scale: match.scale }} className="relative w-full p-5 rounded-2xl bg-zinc-950/70 border backdrop-blur-xl">
              <motion.div aria-hidden style={{ opacity: match.glow }} className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.22),transparent_70%)]" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
              <div className="relative flex justify-between items-start mb-2.5">
                <div><h4 className="font-extrabold text-xs text-zinc-100">Staff LLMOps Engineer</h4><span className="text-[9px] text-zinc-500 block mt-0.5 font-mono">Ashby · Bangalore (Hybrid)</span></div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">96% Match</span>
              </div>
              <p className="relative text-[10px] text-zinc-400 leading-relaxed">Strong alignment with distributed systems design and Python model orchestration.</p>
            </motion.div>
          </div>

          <div className="animate-float-slow absolute bottom-0 left-2 sm:left-8 z-20 w-72">
            <motion.div ref={trajRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.5 }} style={{ borderColor: traj.borderColor, boxShadow: traj.boxShadow, scale: traj.scale }} className="relative w-full p-5 rounded-2xl bg-zinc-950/70 border backdrop-blur-xl">
              <motion.div aria-hidden style={{ opacity: traj.glow }} className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.22),transparent_70%)]" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />
              <div className="relative flex justify-between items-center mb-2">
                <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Career Trajectory</span>
                <span className="text-[10px] font-mono font-black text-teal-300 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +280%</span>
              </div>
              <div className="relative h-20 w-full"><CareerGraph /></div>
            </motion.div>
          </div>

          <div className="absolute bottom-24 right-2 sm:right-6 z-30 animate-float-mid">
            <motion.div ref={chipRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.7 }} style={{ borderColor: chip.borderColor, boxShadow: chip.boxShadow, scale: chip.scale }} className="relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-950/80 border backdrop-blur-xl">
              <motion.div aria-hidden style={{ opacity: chip.glow }} className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.25),transparent_70%)]" />
              <Award className="relative w-5 h-5 text-amber-400" />
              <div className="relative"><span className="block text-base font-black text-zinc-50 leading-none">8.7</span><span className="text-[8px] font-mono uppercase text-zinc-500">Health Score</span></div>
            </motion.div>
          </div>
        </motion.div>

        {/* scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-zinc-600">
          <span className="text-[9px] font-mono uppercase tracking-[0.3em]">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════ SECTION 2 — TRUST (logo lockups) ════════ */}
      <section className="relative z-10 w-full py-8 overflow-hidden">
        <div className="w-full flex flex-col items-center gap-5 text-center">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.25em] px-6">Trusted by students preparing for careers at</span>
          <div className="marquee-group w-full relative overflow-hidden edge-fade-x">
            <div className="flex w-max animate-marquee items-center">
              {[...trustLogos, ...trustLogos].map((b, i) => (
                <div key={i} className="mx-7 inline-flex items-center gap-2.5 text-zinc-500 hover:text-zinc-100 transition-colors duration-300 whitespace-nowrap">
                  {b.path && (
                    <svg viewBox="0 0 24 24" aria-hidden className="w-5 h-5 fill-current shrink-0">
                      <path d={b.path} />
                    </svg>
                  )}
                  <span className="text-lg font-semibold tracking-tight">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ SECTION 3 — LIVE STATS (counters; breaks the pattern) ════════ */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.03] backdrop-blur-md">
          {liveStats.map((s) => (
            <div key={s.label} className="bg-[#040406]/60 p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-1">
              <Counter to={s.to} suffix={s.suffix} className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-500">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ SECTION 4 — HOW IT WORKS (timeline) ════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="text-center space-y-3 mb-14">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-50 tracking-tight">From resume to offer in four steps</h2>
        </motion.div>
        <div className="relative">
          <div className="hidden lg:block absolute top-9 left-[12%] right-[12%] h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-sky-500/0 overflow-hidden">
            <motion.div initial={{ x: '-120%' }} whileInView={{ x: '120%' }} viewport={{ once: true }} transition={{ duration: 2, ease: 'easeInOut', delay: 0.4 }} className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => {
              const a = accentMap[s.accent];
              return (
                <motion.div key={s.title} variants={fadeUp}>
                  <div className="group relative p-6 rounded-2xl bg-zinc-950/40 border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-md transition-all duration-300 h-full">
                    <div className={`relative w-14 h-14 rounded-2xl ${a.bg} border ${a.border} flex items-center justify-center mb-5`}>
                      <s.icon className={`w-6 h-6 ${a.text}`} />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-black text-zinc-300 flex items-center justify-center">{i + 1}</span>
                    </div>
                    <h3 className="font-bold text-zinc-100 mb-2">{s.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ════════ SECTION 5 — PRODUCT SHOWCASE (real screenshots; centerpiece) ════════ */}
      <section ref={showcaseRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* left copy */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="lg:col-span-4 space-y-5">
            <SectionLabel>The product</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-black text-zinc-50 tracking-tight leading-[1.05]">A console built for serious job seekers</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">Every signal in one place — live pipeline, ATS audits, and analytics that tell you exactly where to push next.</p>
            <ul className="space-y-3 pt-1">
              {['Real-time application pipeline', 'ATS-graded resume matching', 'Placement-cell analytics'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{t}</li>
              ))}
            </ul>
            <Link href="/portal"><motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 text-zinc-100 font-bold text-sm cursor-pointer transition-colors flex items-center gap-2 group">Explore the console <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></motion.button></Link>
          </motion.div>

          {/* right: browser-framed real screenshot + floating secondary shots */}
          <div className="lg:col-span-8 relative">
            <motion.div
              style={{ y: showImgY }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                imgx.set(((e.clientX - r.left) / r.width) * 100);
                imgy.set(((e.clientY - r.top) / r.height) * 100);
              }}
              onMouseLeave={() => { imgx.set(50); imgy.set(38); }}
              className="animate-breathe relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]"
            >
              {/* browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-zinc-950/80">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" /><span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-[10px] font-mono text-zinc-500">career-officer.app/dashboard</span>
              </div>
              <Image src="/showcase/dashboard.png" alt="Career Officer dashboard" width={1600} height={1000} className="w-full h-auto" priority />
              {/* cursor-follow soft light */}
              <motion.div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: imgLight }} />
              {/* diagonal reflection sweep */}
              <motion.div aria-hidden className="pointer-events-none absolute inset-y-[-20%] w-1/4 -skew-x-12 mix-blend-overlay bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ left: sheenLeft }} />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-2xl pointer-events-none" />
            </motion.div>

            {/* floating analytics shot */}
            <motion.div style={{ y: showFloatA }} className="hidden md:block absolute -left-10 -bottom-10 w-56 rounded-xl overflow-hidden border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] z-20">
              <Image src="/showcase/analytics.png" alt="Analytics" width={900} height={560} className="w-full h-auto" />
            </motion.div>
            {/* floating resume shot */}
            <motion.div style={{ y: showFloatB }} className="hidden md:block absolute -right-8 -top-10 w-52 rounded-xl overflow-hidden border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] z-20">
              <Image src="/showcase/resume.png" alt="Resume match" width={900} height={560} className="w-full h-auto" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ SECTION 6 — AI FEATURES (bento, varied tiles) ════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="text-center space-y-3 mb-12">
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-50 tracking-tight">Intelligence at every layer</h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const a = accentMap[f.accent];
            return (
              <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -6 }} className={`group relative p-7 rounded-2xl bg-zinc-950/40 border border-white/[0.06] ${a.ring} backdrop-blur-md transition-all duration-300 overflow-hidden ${f.wide ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(400px circle at 50% 0%, ${a.glow}, transparent 70%)` }} />
                <div className={`relative w-12 h-12 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}><f.icon className={`w-5 h-5 ${a.text}`} /></div>
                <h3 className="relative font-bold text-zinc-100 mb-2">{f.title}</h3>
                <p className="relative text-xs text-zinc-400 leading-relaxed max-w-md">{f.desc}</p>
                <ArrowRight className="relative mt-4 w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ════════ SECTION 7 — STUDENT SUCCESS ════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="text-center space-y-3 mb-12">
          <SectionLabel>Student success</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-50 tracking-tight">Careers, accelerated</h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <motion.div key={t.author} variants={fadeUp} whileHover={{ y: -6 }} className="relative p-7 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)] flex flex-col h-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <Quote className="relative w-7 h-7 text-emerald-500/40 mb-4" />
              <div className="relative flex gap-1 mb-4">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />))}</div>
              <p className="relative text-sm text-zinc-300 leading-relaxed flex-1">{t.quote}</p>
              <div className="relative flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-sky-500/30 border border-white/10 flex items-center justify-center text-xs font-black text-zinc-100">{t.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                <div><span className="block text-sm font-bold text-zinc-100">{t.author}</span><span className="block text-[11px] font-mono text-zinc-500">{t.role}</span></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════ SECTION 8 — BENEFITS ════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="text-center space-y-3 mb-12">
          <SectionLabel>One platform, three wins</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-50 tracking-tight">Built for the whole placement ecosystem</h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const a = accentMap[b.accent];
            return (
              <motion.div key={b.audience} variants={fadeUp} whileHover={{ y: -6 }} className="group relative p-8 rounded-2xl bg-zinc-950/40 border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-md transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${a.bg} border ${a.border} flex items-center justify-center mb-6`}><b.icon className={`w-6 h-6 ${a.text}`} /></div>
                <h3 className="text-lg font-bold text-zinc-100 mb-5">{b.audience}</h3>
                <ul className="space-y-3.5">{b.points.map((pt) => (<li key={pt} className="flex items-start gap-2.5 text-sm text-zinc-400 leading-relaxed"><UserCheck className={`w-4 h-4 ${a.text} shrink-0 mt-0.5`} /><span>{pt}</span></li>))}</ul>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ════════ SECTION 9 — FINAL CTA ════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 backdrop-blur-xl px-8 py-16 sm:py-24 text-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3], x: [-40, 40, -40] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-20 left-1/4 w-[500px] h-[400px] rounded-full bg-emerald-500/25 blur-[110px]" />
            <motion.div animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.4, 0.2], x: [30, -30, 30] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute -bottom-20 right-1/4 w-[460px] h-[360px] rounded-full bg-sky-500/25 blur-[110px]" />
          </div>
          <div className="relative space-y-7 max-w-2xl mx-auto">
            <SectionLabel><Sparkles className="w-3.5 h-3.5 animate-pulse" /> Get started</SectionLabel>
            <h2 className="text-4xl sm:text-6xl font-black text-zinc-50 tracking-tight leading-[1.05]">
              Start Building Your{' '}
              <span className="animate-gradient bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">Career With AI</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">Your resume, your matches, and your trajectory — all in one operating system. No setup, no noise, just signal.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
              <Link href="/portal" className="w-full sm:w-auto"><motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm cursor-pointer shadow-[0_0_40px_-4px_rgba(16,185,129,0.5)] transition-colors flex items-center justify-center gap-2 group w-full sm:w-60">Enter Student Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" /></motion.button></Link>
              <Link href="/admin/login" className="w-full sm:w-auto"><motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-8 py-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] text-zinc-200 font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 w-full sm:w-60 backdrop-blur-sm">Enter Admin Portal</motion.button></Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default function LandingPage() {
  return (
    <SmoothScroll>
      <Landing />
    </SmoothScroll>
  );
}
