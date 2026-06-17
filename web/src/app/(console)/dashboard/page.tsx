'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Activity, FileCheck, CheckCircle2, Briefcase, Sparkles,
  ArrowUpRight, Compass, BookmarkCheck, ChevronRight, Brain, Zap,
  Star, User, FileText, Building2, MapPin, ExternalLink, ShieldAlert,
  ListTodo, CheckSquare, Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';
import RecommendedJobs from '@/components/RecommendedJobs';

interface Application {
  id: string;
  date: string;
  company: string;
  role: string;
  score: string;
  status: string;
  pdf: string;
  report: string;
  notes: string;
}

interface CompanySuggestion {
  name: string;
  overview: string;
  location: string;
  status: string;
  website: string;
}

const defaultActivityData = [
  { day: 'Mon', apps: 1 },
  { day: 'Tue', apps: 3 },
  { day: 'Wed', apps: 2 },
  { day: 'Thu', apps: 4 },
  { day: 'Fri', apps: 2 },
  { day: 'Sat', apps: 0 },
  { day: 'Sun', apps: 1 },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency, symbol } = useCurrency();
  const [rawTargetRange, setRawTargetRange] = useState<string>('₹12L - ₹25L');

  // Student and Match Engine states
  const [student, setStudent] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [recCompanies, setRecCompanies] = useState<CompanySuggestion[]>([]);

  // Animated counters
  const [countHealth, setCountHealth] = useState(0);
  const [countCallback, setCountCallback] = useState(0);
  const [countAvgScore, setCountAvgScore] = useState(0);
  const [countOffers, setCountOffers] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Fetch dashboard records
    const fetchData = async () => {
      try {
        const appsRes = await fetch('/api/applications');
        const appsData = await appsRes.json();
        setApplications(appsData);
        setLoading(false);

        const profileRes = await fetch('/api/profile');
        const profileData = await profileRes.json();
        if (profileData.compensation?.target_range) {
          setRawTargetRange(profileData.compensation.target_range);
        }

        // Fetch student & match engine info
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          const sid = meData.studentId;
          if (sid) {
            // Fetch student profile completeness
            const studRes = await fetch(`/api/students/${sid}`);
            if (studRes.ok) {
              const studData = await studRes.json();
              setStudent(studData.profile);
            }
            // Fetch resume match details
            const matchRes = await fetch(`/api/students/${sid}/match`);
            if (matchRes.ok) {
              const matchData = await matchRes.json();
              setMatch(matchData.match);
            }
          }
        }

        // Fetch saved jobs from tracker
        const trackerRes = await fetch('/api/tracker');
        if (trackerRes.ok) {
          const trackerData = await trackerRes.json();
          const tracked = trackerData.tracked || [];
          const saved = tracked.filter((t: any) => t.status === 'Saved');
          setSavedJobs(saved.slice(0, 3));
          setSavedJobsCount(saved.length);
        }

        // Compute targets for counters
        const totalApps = appsData.length;
        const interviewApps = appsData.filter((app: any) => ['Interview', 'Final Round'].includes(app.status)).length;
        const offerApps = appsData.filter((app: any) => app.status === 'Offer').length;
        const skipApps = appsData.filter((app: any) => app.status === 'SKIP').length;
        
        const targetCallback = totalApps > 0 ? Math.round((interviewApps / (totalApps - skipApps)) * 100) : 0;
        const targetOffers = offerApps;
        const computedAvg = appsData.length > 0
          ? parseFloat((appsData.reduce((acc: number, app: any) => {
              const val = parseFloat(app.score.split('/')[0]);
              return acc + (isNaN(val) ? 0 : val);
            }, 0) / appsData.length).toFixed(1))
          : 0.0;
        const targetHealth = Math.min(100, Math.round(computedAvg * 15 + targetCallback * 0.4 + targetOffers * 5));

        // Ticker counters animation
        const steps = 30;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          setCountHealth(Math.min(Math.round((targetHealth / steps) * step), targetHealth));
          setCountCallback(Math.min(Math.round((targetCallback / steps) * step), targetCallback));
          setCountAvgScore(parseFloat(Math.min((computedAvg / steps) * step, computedAvg).toFixed(1)));
          setCountOffers(Math.min(Math.round((targetOffers / steps) * step), targetOffers));
          if (step >= steps) clearInterval(timer);
        }, 30);

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Determine recommended companies based on matched domain
  useEffect(() => {
    if (match?.domain) {
      const domain = match.domain.toLowerCase();
      let suggestions: CompanySuggestion[] = [];
      if (domain.includes('machine learning') || domain.includes('ai')) {
        suggestions = [
          { name: 'Google', overview: 'Leading AI research, Gemini LLMs, and TPU hardware systems.', location: 'Mountain View, CA / Bangalore', status: 'Actively Hiring', website: 'https://careers.google.com' },
          { name: 'Microsoft', overview: 'Azure AI platform, OpenAI partnership, and Copilot tools.', location: 'Redmond, WA / Hyderabad', status: 'Actively Hiring', website: 'https://careers.microsoft.com' },
          { name: 'Razorpay', overview: 'Building smart fintech payment routing using local AI/ML models.', location: 'Bangalore, India', status: 'Actively Hiring', website: 'https://razorpay.com/jobs' }
        ];
      } else if (domain.includes('data') || domain.includes('analytics')) {
        suggestions = [
          { name: 'Amazon', overview: 'AWS Redshift, data pipelines, and petabyte-scale retail warehousing.', location: 'Seattle, WA / Bangalore', status: 'Actively Hiring', website: 'https://amazon.jobs' },
          { name: 'Google', overview: 'BigQuery, analytics suite, and cloud platform integrations.', location: 'Bangalore, India', status: 'Actively Hiring', website: 'https://careers.google.com' },
          { name: 'Swiggy', overview: 'Dynamic route optimization and demand prediction data systems.', location: 'Bangalore, India', status: 'Actively Hiring', website: 'https://careers.swiggy.com' }
        ];
      } else {
        suggestions = [
          { name: 'Google', overview: 'Pioneering search, cloud computing, and browser tech infrastructure.', location: 'Bangalore, India', status: 'Actively Hiring', website: 'https://careers.google.com' },
          { name: 'Flipkart', overview: 'India\'s leading e-commerce storefront scaling to millions of hits.', location: 'Bangalore, India', status: 'Actively Hiring', website: 'https://www.flipkartcareers.com' },
          { name: 'Zoho', overview: 'SaaS suite business services running on highly optimized server configurations.', location: 'Chennai, India', status: 'Actively Hiring', website: 'https://www.zoho.com/careers' }
        ];
      }
      setRecCompanies(suggestions);
    }
  }, [match]);

  if (!mounted) return null;

  const getLocalizedRange = (rangeStr: string, activeCurrency: string) => {
    const isSourceINR = rangeStr.includes('₹') || rangeStr.toLowerCase().includes('inr') || rangeStr.toLowerCase().includes('l');
    const numbers = rangeStr.replace(/,/g, '').match(/\d+/g);
    if (!numbers || numbers.length === 0) return rangeStr;

    let valMin = parseInt(numbers[0]);
    let valMax = numbers.length > 1 ? parseInt(numbers[1]) : valMin;

    const isLakhs = rangeStr.toLowerCase().includes('l') || (isSourceINR && valMin < 1000);
    const isK = rangeStr.toLowerCase().includes('k') || (!isSourceINR && valMin < 1000);

    if (isLakhs) {
      valMin *= 100000;
      valMax *= 100000;
    } else if (isK) {
      valMin *= 1000;
      valMax *= 1000;
    }

    let usdMin = valMin;
    let usdMax = valMax;
    if (isSourceINR) {
      usdMin = valMin / 83.5;
      usdMax = valMax / 83.5;
    }

    if (activeCurrency === 'INR') {
      const minLakhs = Math.round((usdMin * 83.5) / 100000);
      const maxLakhs = Math.round((usdMax * 83.5) / 100000);
      return minLakhs === maxLakhs ? `₹${minLakhs}L` : `₹${minLakhs}L - ₹${maxLakhs}L`;
    } else {
      const rate = activeCurrency === 'USD' ? 1.0 : activeCurrency === 'EUR' ? 0.92 : 0.78;
      const curSymbol = activeCurrency === 'USD' ? '$' : activeCurrency === 'EUR' ? '€' : '£';
      const minK = Math.round((usdMin * rate) / 1000);
      const maxK = Math.round((usdMax * rate) / 1000);
      return minK === maxK ? `${curSymbol}${minK}K` : `${curSymbol}${minK}K - ${curSymbol}${maxK}K`;
    }
  };

  const totalApps = applications.length;
  const activeApps = applications.filter((app) => !['SKIP', 'Discarded', 'Rejected'].includes(app.status)).length;

  const timelineEvents = [
    { text: 'AI matching report generated for Vercel', meta: 'Score: 94% — remote fit matched', date: 'Today, 2:14 PM', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/10' },
    { text: 'Updated Stripe pipeline status to Screening', meta: 'Recruiter reached out for coffee chat', date: 'Yesterday', icon: CheckCircle2, color: 'text-blue-400 bg-blue-500/10' },
    { text: 'Tailored CV PDF created for Linear', meta: 'Saved to output/Linear-CV.pdf', date: '2 days ago', icon: FileCheck, color: 'text-purple-400 bg-purple-500/10' },
  ];

  // Calculate dynamic stats for tracker widgets
  const statsByStatus = {
    Saved: applications.filter(a => a.status === 'Saved').length,
    Applied: applications.filter(a => a.status === 'Applied').length,
    Interview: applications.filter(a => ['Interview', 'Final Round'].includes(a.status)).length,
    Offer: applications.filter(a => a.status === 'Offer').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-zinc-950/45 border border-zinc-900 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-sm font-bold text-zinc-350 tracking-tight font-mono uppercase">Campaign Active</h2>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl">
            Welcome back. Your profile synchronization is complete. We are currently tracking <strong className="text-emerald-400">{activeApps} active cycles</strong>. Target comp: <strong className="text-emerald-400">{getLocalizedRange(rawTargetRange, currency)}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/tracker">
            <button className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-2">
              <Compass className="w-4 h-4 text-zinc-500" />
              Job Pipeline
            </button>
          </Link>
          <Link href="/resume">
            <button className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-4 h-4" />
              Resume Match
            </button>
          </Link>
        </div>
      </div>

      {/* Grid of Core metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Career Health */}
        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 flex justify-between items-center h-32 relative overflow-hidden shadow-lg backdrop-blur-md"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[10px] font-mono font-bold text-zinc-550 tracking-wider uppercase">Career Health</span>
            <div>
              <span className="text-3xl font-black tracking-tight text-zinc-100">{countHealth}</span>
              <span className="text-[9px] text-zinc-500 block mt-1 font-mono">Telemetry scale: 0-100</span>
            </div>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="#18181b" strokeWidth="3" fill="transparent" />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                stroke="#10b981"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - countHealth / 100)}
                className="transition-all duration-300"
              />
            </svg>
            <Activity className="w-4 h-4 text-emerald-400 absolute" />
          </div>
        </motion.div>

        {/* Metric 2: Callbacks rate */}
        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 flex flex-col justify-between h-32 relative overflow-hidden shadow-lg backdrop-blur-md"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-wider">Conversion Ratio</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-zinc-100 tracking-tight block">{countCallback}%</span>
            <span className="text-[9px] text-zinc-500 block mt-1 font-mono">Callback conversion index</span>
          </div>
        </motion.div>

        {/* Metric 3: Avg CV Match */}
        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 flex flex-col justify-between h-32 relative overflow-hidden shadow-lg backdrop-blur-md"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-wider">Avg CV Match</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-zinc-100 tracking-tight block">{countAvgScore} <span className="text-zinc-650 text-sm font-semibold">/ 5</span></span>
            <span className="text-[9px] text-zinc-550 block mt-1 font-mono">Tailored parsing fit</span>
          </div>
        </motion.div>

        {/* Metric 4: Offers */}
        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 flex flex-col justify-between h-32 relative overflow-hidden shadow-lg backdrop-blur-md"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-wider">Offer success</span>
            <BookmarkCheck className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <span className="text-3xl font-black text-zinc-100 tracking-tight block">{countOffers}</span>
            <span className="text-[9px] text-zinc-550 block mt-1 font-mono">Verified contracts received</span>
          </div>
        </motion.div>
      </div>

      {/* Profile Completion & Resume Score Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Completion Widget */}
        <div className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-xs text-zinc-300 uppercase tracking-wider font-mono">Profile Completion</h3>
              </div>
              <span className="text-emerald-400 font-mono text-sm font-bold">{student?.profileCompleteness || 0}%</span>
            </div>

            <p className="text-[10px] text-zinc-550 leading-relaxed font-mono">
              Fill in your experience, projects, and skills to unlock higher matching precision.
            </p>

            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${student?.profileCompleteness || 0}%` }}
              />
            </div>
          </div>

          <div className="pt-4 mt-2">
            <Link href="/profile" className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1">
              Edit Master Profile <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Resume Score Widget */}
        <div className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="font-extrabold text-xs text-zinc-300 uppercase tracking-wider font-mono">Resume Score</h3>
              </div>
              <span className="text-blue-400 font-mono text-sm font-bold">
                {match?.ats?.overall ? `${match.ats.overall}/100` : '—'}
              </span>
            </div>

            <p className="text-[10px] text-zinc-550 leading-relaxed font-mono">
              ATS structural scan of your uploaded CV files. Sector target matches: <span className="text-zinc-300">{match?.domain || 'General'}</span>.
            </p>

            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${match?.ats?.overall || 0}%` }}
              />
            </div>
          </div>

          <div className="pt-4 mt-2">
            <Link href="/resume" className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1">
              Run Resume Matcher <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Applications Funnel Quick Summary */}
        <div className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-xs text-zinc-300 uppercase tracking-wider font-mono">Applications Tracker</h3>
              </div>
              <span className="text-purple-400 font-mono text-xs font-bold">{applications.length} Total</span>
            </div>

            <div className="grid grid-cols-5 gap-1 pt-1 text-center font-mono">
              <div className="bg-zinc-900/40 p-1.5 rounded border border-zinc-900/60">
                <span className="block text-zinc-300 text-xs font-bold">{statsByStatus.Saved}</span>
                <span className="text-[7px] text-zinc-550 uppercase">Saved</span>
              </div>
              <div className="bg-zinc-900/40 p-1.5 rounded border border-zinc-900/60">
                <span className="block text-blue-450 text-xs font-bold">{statsByStatus.Applied}</span>
                <span className="text-[7px] text-zinc-550 uppercase">Sent</span>
              </div>
              <div className="bg-zinc-900/40 p-1.5 rounded border border-zinc-900/60">
                <span className="block text-amber-450 text-xs font-bold">{statsByStatus.Interview}</span>
                <span className="text-[7px] text-zinc-550 uppercase">Intw</span>
              </div>
              <div className="bg-zinc-900/40 p-1.5 rounded border border-zinc-900/60">
                <span className="block text-emerald-400 text-xs font-bold">{statsByStatus.Offer}</span>
                <span className="text-[7px] text-zinc-550 uppercase">Offer</span>
              </div>
              <div className="bg-zinc-900/40 p-1.5 rounded border border-zinc-900/60">
                <span className="block text-red-400/80 text-xs font-bold">{statsByStatus.Rejected}</span>
                <span className="text-[7px] text-zinc-550 uppercase">Rej</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <Link href="/tracker" className="text-[10px] font-bold text-purple-400 hover:underline flex items-center gap-1">
              Open Pipelines Board <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <RecommendedJobs limit={6} />

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Graph & Saved Jobs / Funnel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly progress chart */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/45 border border-zinc-900 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xs text-zinc-300 uppercase tracking-wider font-mono">Search Velocity</h3>
                <span className="text-[10px] text-zinc-550 block mt-0.5">Scanned cycles cadence over past 7 days</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 font-mono font-bold uppercase select-none">
                Live sync active
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={defaultActivityData}>
                  <XAxis dataKey="day" stroke="#52525b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#09090b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="apps"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Saved Jobs List Widget */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/45 border border-zinc-900 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xs text-zinc-350 uppercase tracking-wider font-mono">Saved Jobs ({savedJobsCount})</h3>
                <span className="text-[10px] text-zinc-550 block mt-0.5">Bookmarks queued for application outreach</span>
              </div>
              <Link href="/jobs" className="text-[10px] font-bold text-emerald-400 hover:text-emerald-350 flex items-center gap-0.5">
                Search More Jobs <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {savedJobs.length === 0 ? (
                <div className="text-zinc-550 text-center py-8 text-xs font-mono">No bookmarked jobs in pipeline.</div>
              ) : (
                savedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between hover:border-zinc-800 hover:bg-zinc-900/10 transition-all group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors">{job.company}</h4>
                        {job.location && (
                          <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {job.location}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500">{job.role}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href="/tracker">
                        <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-850 px-2 py-1 rounded hover:bg-zinc-800 transition-all cursor-pointer">
                          Go to pipeline
                        </span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Opportunities list */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/45 border border-zinc-900 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xs text-zinc-350 uppercase tracking-wider font-mono">Active Pipeline Funnel</h3>
                <span className="text-[10px] text-zinc-550 block mt-0.5">Real-time indicators from database sync</span>
              </div>
              <Link href="/tracker" className="text-[10px] font-bold text-emerald-400 hover:text-emerald-350 flex items-center gap-0.5">
                Full Funnel Board
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-zinc-600 text-center py-8 text-xs font-mono">Loading active profiles...</div>
              ) : applications.length === 0 ? (
                <div className="text-zinc-550 text-center py-8 text-xs font-mono">No active cycle profiles identified.</div>
              ) : (
                applications
                  .filter((app) => app.status !== 'SKIP' && app.status !== 'Saved')
                  .slice(0, 3)
                  .map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between hover:border-zinc-800 hover:bg-zinc-900/10 transition-all group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors">{app.company}</h4>
                          <span className="px-2 py-0.5 rounded text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-850 font-mono font-bold uppercase">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{app.role}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-xs font-extrabold text-emerald-400 font-mono">{app.score}</span>
                          <span className="text-[8px] text-zinc-550 block font-mono">Match Score</span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Recommended Companies & AI Career Insights */}
        <div className="space-y-8">
          {/* Recommended Companies */}
          <div className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-lg backdrop-blur-md space-y-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-xs text-zinc-300 uppercase tracking-wider font-mono">Recommended Companies</h3>
              </div>
              <Link href="/companies" className="text-[9px] font-mono text-zinc-500 hover:text-emerald-400">
                Explore All
              </Link>
            </div>

            <div className="space-y-3">
              {recCompanies.map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-900 space-y-2 hover:border-emerald-500/20 transition-all duration-350"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-[9px] font-bold text-zinc-300">
                        {c.name.slice(0, 2)}
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200">{c.name}</h4>
                    </div>
                    <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-405 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-550 leading-relaxed font-sans">{c.overview}</p>
                  <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 border-t border-zinc-900/60 pt-2 mt-1">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {c.location.split('/')[0].trim()}
                    </span>
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline flex items-center gap-0.5">
                      Careers <ExternalLink className="w-2 h-2" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Career Insights */}
          <div className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-lg backdrop-blur-md space-y-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center gap-2">
              <Brain className="w-4.5 h-4.5 text-emerald-400" />
              <h3 className="font-extrabold text-xs text-zinc-300 uppercase tracking-wider font-mono">AI Career Insights</h3>
            </div>

            <div className="space-y-5">
              {/* Skill Gap Analysis & Missing Skills */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-wider block">Skill Gap & Missing Skills</span>
                {match?.skillGaps && match.skillGaps.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {match.skillGaps.map((gap: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[8px] text-red-400 font-mono">
                          Missing: {gap.skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-normal">
                      Closing these gaps in your resume improves matching probability on ATS screeners.
                    </p>
                  </div>
                ) : (
                  <p className="text-[9px] text-zinc-500 leading-normal italic">
                    {match ? 'No major skill gaps identified for your matched domain!' : 'Upload a resume to analyze skill gaps.'}
                  </p>
                )}
              </div>

              {/* Career Suggestions */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-wider block">Career Path Suggestions</span>
                <div className="space-y-1.5 font-mono text-[9px]">
                  {match?.domain ? (
                    <>
                      <div className="flex items-center gap-1.5 text-zinc-300 bg-zinc-900/50 p-1.5 rounded border border-zinc-900">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Target Role: {match.domain} specialist</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-350 bg-zinc-900/50 p-1.5 rounded border border-zinc-900">
                        <TrendingUp className="w-3 h-3 text-blue-400" />
                        <span>Alternative path: Solutions Architect ({match.domain})</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[9px] text-zinc-500 leading-normal italic">Configure resume profile to see suggestions.</p>
                  )}
                </div>
              </div>

              {/* Resume Improvement Suggestions */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-wider block">Resume Improvement suggestions</span>
                <div className="space-y-2">
                  {match?.improvements ? (
                    match.improvements.slice(0, 3).map((imp: string, idx: number) => (
                      <div key={idx} className="flex gap-2 text-[9px] leading-relaxed text-zinc-450 bg-zinc-900/20 p-2 rounded border border-zinc-900/80">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[9px] text-zinc-500 leading-normal italic">Complete profile for suggestions.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Activity Log */}
          <div className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-lg backdrop-blur-md space-y-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <h3 className="font-extrabold text-xs text-zinc-350 uppercase tracking-wider font-mono">Telemetry Activity Log</h3>
            <div className="space-y-5 relative pl-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-900">
              {timelineEvents.map((ev, i) => (
                <div key={i} className="relative space-y-1">
                  <span className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-zinc-950" />
                  <h4 className="text-[10px] font-bold text-zinc-200 leading-tight">{ev.text}</h4>
                  <p className="text-[9px] text-zinc-500 leading-normal">{ev.meta}</p>
                  <span className="text-[8px] text-zinc-650 block font-mono">{ev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
