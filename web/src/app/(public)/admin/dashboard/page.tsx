'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Layers,
  Award,
  Search,
  Sparkles,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  LogOut,
  ChevronDown,
  User,
  Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StudentRow {
  id: string;
  name: string;
  degree: string;
  cgpa: string;
  resumeStatus: 'Processed' | 'Parsing' | 'Gaps Detected';
  topSkill: string;
  applications: number;
  offers: number;
}

const mockStudents: StudentRow[] = [
  { id: '1', name: 'Jane Smith', degree: 'B.Tech (CSE)', cgpa: '9.2', resumeStatus: 'Processed', topSkill: 'Go / Python / PyTorch', applications: 12, offers: 2 },
  { id: '2', name: 'Aarav Sharma', degree: 'B.Tech (IT)', cgpa: '8.8', resumeStatus: 'Processed', topSkill: 'Next.js / React / Node', applications: 8, offers: 1 },
  { id: '3', name: 'Rohan Gupta', degree: 'M.Tech (AI)', cgpa: '9.5', resumeStatus: 'Parsing', topSkill: 'PyTorch / CUDA / Triton', applications: 4, offers: 0 },
  { id: '4', name: 'Priya Patel', degree: 'B.Tech (ECE)', cgpa: '8.5', resumeStatus: 'Gaps Detected', topSkill: 'Python / C++ / OpenCV', applications: 7, offers: 0 },
  { id: '5', name: 'Kunal Sen', degree: 'B.Tech (CSE)', cgpa: '9.0', resumeStatus: 'Processed', topSkill: 'Java / Kubernetes / AWS', applications: 9, offers: 1 }
];

const placementStatsByBranch = [
  { branch: 'CSE', rate: 94, placed: 188, total: 200, status: 'Excellent', color: '#10b981' },
  { branch: 'AI/ML', rate: 91, placed: 91, total: 100, status: 'Excellent', color: '#06b6d4' },
  { branch: 'IT', rate: 88, placed: 88, total: 100, status: 'Good', color: '#3b82f6' },
  { branch: 'ECE', rate: 76, placed: 76, total: 100, status: 'Good', color: '#8b5cf6' },
  { branch: 'Mechanical', rate: 65, placed: 65, total: 100, status: 'Average', color: '#f97316' },
  { branch: 'Civil', rate: 58, placed: 58, total: 100, status: 'Average', color: '#ef4444' }
];

// Stripe-grade custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const branchFullNames: Record<string, string> = {
      'CSE': 'Computer Science Engineering',
      'AI/ML': 'Artificial Intelligence & Machine Learning',
      'IT': 'Information Technology',
      'ECE': 'Electronics & Communication Engineering',
      'Mechanical': 'Mechanical Engineering',
      'Civil': 'Civil Engineering'
    };
    const fullName = branchFullNames[data.branch] || data.branch;
    return (
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 shadow-2xl font-sans text-xs space-y-1.5 min-w-[200px]">
        <span className="font-extrabold text-zinc-200 block border-b border-zinc-900 pb-1">{fullName}</span>
        <div className="space-y-1 pt-1 font-mono text-[10px]">
          <div className="flex justify-between">
            <span className="text-zinc-500">Placement Rate:</span>
            <span className="text-emerald-400 font-bold">{data.rate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Placed Students:</span>
            <span className="text-zinc-300 font-bold">{data.placed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Total Students:</span>
            <span className="text-zinc-300">{data.total}</span>
          </div>
          <div className="flex justify-between border-t border-zinc-900/60 pt-1 mt-1 font-sans">
            <span className="text-zinc-500">Status:</span>
            <span className={`font-bold ${data.status === 'Excellent' ? 'text-emerald-400' : data.status === 'Good' ? 'text-blue-400' : 'text-amber-500'}`}>
              {data.status}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [students] = useState<StudentRow[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin Dropdown / Logout states
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Animated metrics states
  const [totalStudents, setTotalStudents] = useState(0);
  const [resumesExtracted, setResumesExtracted] = useState(0);
  const [scannedJobs, setScannedJobs] = useState(0);
  const [placementRatio, setPlacementRatio] = useState(0);

  // Route protection
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('career_officer_admin_logged_in');
    if (adminLoggedIn !== 'true') {
      router.replace('/admin/login');
    } else {
      setAuthorized(true);
    }
    setLoadingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    // Smooth counter animation simulation
    const duration = 1000;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setTotalStudents(Math.min(Math.round((458 / steps) * step), 458));
      setResumesExtracted(Math.min(Math.round((412 / steps) * step), 412));
      setScannedJobs(Math.min(Math.round((1894 / steps) * step), 1894));
      setPlacementRatio(Math.min(Math.round((89 / steps) * step), 89));

      if (step >= steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [authorized]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topSkill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmLogout = () => {
    localStorage.removeItem('career_officer_admin_logged_in');
    localStorage.removeItem('career_officer_admin_token');
    router.push('/admin/login');
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#050507] text-zinc-550 font-mono text-[10px] flex items-center justify-center">
        Verifying administration credentials...
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 py-10 relative overflow-hidden select-none">
      {/* Background Auroras */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 0.95, 1],
            opacity: [0.08, 0.15, 0.1, 0.08]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[600px] h-[400px] rounded-full bg-blue-500/10 blur-[130px] -top-24 left-1/4 -z-10"
        />
        <motion.div
          animate={{
            scale: [0.9, 1.05, 1.1, 0.9],
            opacity: [0.06, 0.12, 0.08, 0.06]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute w-[500px] h-[400px] rounded-full bg-emerald-500/8 blur-[130px] bottom-0 right-1/4 -z-10"
        />
      </div>

      <div className="space-y-10 px-6 max-w-7xl mx-auto relative z-10 w-full">
        {/* Top Banner / Header with Profile Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900/60 pb-6 gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              Administrative Command Center
            </span>
            <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Campus Placements Portal</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-550" />
              <input
                type="text"
                placeholder="Search candidates, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs w-64 transition-all"
              />
            </div>
            
            {/* Admin Avatar Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-900 bg-zinc-950/40 text-xs text-zinc-350 hover:text-zinc-200 hover:bg-zinc-900/40 transition-colors cursor-pointer font-mono"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] text-blue-455 shrink-0">
                  RC
                </div>
                <span>Dr. Carter</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-650" />
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1.5 w-48 bg-zinc-950 border border-zinc-900 rounded-xl shadow-xl py-1.5 z-50 font-mono text-[10px] text-zinc-400"
                    >
                      <div className="px-3 py-2 border-b border-zinc-900/60 font-sans">
                        <span className="font-bold text-zinc-250 block">Dr. Robert Carter</span>
                        <span className="text-[9px] text-zinc-550 block mt-0.5">Placement Cell Director</span>
                      </div>
                      <div className="py-1">
                        <button 
                          onClick={() => setProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2 hover:bg-zinc-900/60 hover:text-zinc-250 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Profile</span>
                        </button>
                        <button 
                          onClick={() => setProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2 hover:bg-zinc-900/60 hover:text-zinc-250 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Settings</span>
                        </button>
                      </div>
                      <div className="h-[1px] bg-zinc-900/60 my-1" />
                      <button 
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setLogoutModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-450" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Grid of Placement Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Registered', val: totalStudents, sub: '2026 Grad Batch', icon: Users, color: 'text-blue-400', glow: 'via-blue-500/30', active: true },
            { title: 'Profiles Extracted', val: resumesExtracted, sub: '90% Complete Rate', icon: FileText, color: 'text-emerald-400', glow: 'via-emerald-500/30', active: true },
            { title: 'Total Scanned JDs', val: scannedJobs, sub: 'Monitored Platforms', icon: Layers, color: 'text-purple-400', glow: 'via-purple-500/30', active: false },
            { title: 'Placement Ratio', val: `${placementRatio}%`, sub: '+4.2% Callback Rate', icon: Award, color: 'text-pink-400', glow: 'via-pink-500/30', active: true }
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 flex flex-col justify-between h-32 relative overflow-hidden shadow-lg backdrop-blur-md hover:border-zinc-800 transition-colors">
                <div className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${m.glow} to-transparent`} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-wider">{m.title}</span>
                  <div className="flex items-center gap-2">
                    {m.active && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-zinc-100 tracking-tight block">{m.val}</span>
                  <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">{m.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left/Middle (2/3): Students Grid & Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Students list */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              <div>
                <h3 className="font-extrabold text-xs text-zinc-350 uppercase tracking-wider font-mono">Student Placements Registry</h3>
                <span className="text-[10px] text-zinc-550 block mt-1">Overview of student profiles processed by localized resume extraction engine</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                      <th className="py-3 pr-2">Student Name</th>
                      <th className="py-3 px-2">Program</th>
                      <th className="py-3 px-2">CGPA</th>
                      <th className="py-3 px-2">Top Keywords</th>
                      <th className="py-3 px-2">Sync Status</th>
                      <th className="py-3 pl-2 text-right">Cycles (Offers)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/40">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-zinc-900/30 transition-colors group">
                        <td className="py-4 pr-2 font-bold text-zinc-200 group-hover:text-blue-450 transition-colors">{student.name}</td>
                        <td className="py-4 px-2 text-zinc-450">{student.degree}</td>
                        <td className="py-4 px-2 text-zinc-400 font-mono">{student.cgpa}</td>
                        <td className="py-4 px-2 text-zinc-400 font-mono text-[10px]">{student.topSkill}</td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                            student.resumeStatus === 'Processed'
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : student.resumeStatus === 'Parsing'
                              ? 'bg-blue-500/5 border-blue-500/20 text-blue-400 animate-pulse'
                              : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
                          }`}>
                            {student.resumeStatus}
                          </span>
                        </td>
                        <td className="py-4 pl-2 text-right font-mono text-zinc-200">
                          {student.applications} <span className="text-zinc-700">/</span> <span className="text-emerald-400 font-bold">{student.offers}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Placement Statistics by Branch with unique colors */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              <div>
                <h3 className="font-extrabold text-xs text-zinc-350 uppercase tracking-wider font-mono">Branch Placement Ratios (%)</h3>
                <span className="text-[10px] text-zinc-550 block mt-1">Specialization-wise callback conversion metric index</span>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={placementStatsByBranch} margin={{ bottom: 20 }}>
                    <XAxis dataKey="branch" stroke="#a1a1aa" fontSize={12} fontWeight={700} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={12} fontWeight={700} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }} />
                    <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={34} isAnimationActive={true} animationBegin={0} animationDuration={1000}>
                      {placementStatsByBranch.map((entry, index) => {
                        const hoverGlowClasses: Record<string, string> = {
                          '#10b981': 'hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]',
                          '#06b6d4': 'hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]',
                          '#3b82f6': 'hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]',
                          '#8b5cf6': 'hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]',
                          '#f97316': 'hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]',
                          '#ef4444': 'hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        };
                        const glowClass = hoverGlowClasses[entry.color] || '';
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            fillOpacity={0.8} 
                            className={`transition-all duration-300 hover:fill-opacity-100 hover:scale-y-[1.03] origin-bottom cursor-pointer ${glowClass}`}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right (1/3): Activity Log & Top Campus Skills */}
          <div className="space-y-8">
            {/* Top Skills Monitored */}
            <div className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-lg backdrop-blur-md space-y-5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              <h3 className="font-extrabold text-xs text-zinc-300 uppercase tracking-wider font-mono">Campus Competency Index</h3>
              <div className="space-y-4">
                {[
                  { name: 'Python & ML Core', count: 184, rate: 82, color: 'bg-emerald-500' },
                  { name: 'Go Microservices', count: 92, rate: 65, color: 'bg-blue-500' },
                  { name: 'Next.js & Frontend React', count: 124, rate: 74, color: 'bg-purple-500' },
                  { name: 'Cloud Infra (AWS/K8s)', count: 76, rate: 58, color: 'bg-pink-500' }
                ].map(skill => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span className="font-medium">{skill.name}</span>
                      <span className="font-mono text-zinc-550">{skill.count} candidates</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className={`${skill.color} h-1.5 rounded-full`} style={{ width: `${skill.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent placement updates logs */}
            <div className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 shadow-lg backdrop-blur-md space-y-5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              <h3 className="font-extrabold text-xs text-zinc-350 uppercase tracking-wider font-mono">Recruitment Activity Log</h3>
              <div className="space-y-5 relative pl-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-900 text-xs">
                {[
                  { text: 'Google recruiter scheduled interviews for B.Tech', meta: 'Selected 5 CSE resumes via parser match index', time: '10m ago' },
                  { text: 'Stripe offered Staff LLMOps position', meta: 'Offered comp ₹1.8Cr total package (Bangalore)', time: '1h ago' },
                  { text: '42 B.Tech student profiles parsed successfully', meta: 'Indexed education, CGPA, and portfolio links', time: '3h ago' }
                ].map((log, i) => (
                  <div key={i} className="relative space-y-1">
                    <span className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 ring-4 ring-zinc-950" />
                    <h4 className="font-bold text-zinc-200 leading-tight">{log.text}</h4>
                    <p className="text-[10px] text-zinc-505 leading-normal">{log.meta}</p>
                    <span className="text-[9px] text-zinc-650 block font-mono mt-0.5">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl z-50 space-y-5"
            >
              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-3">
                  <LogOut className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-200 uppercase tracking-wider font-mono">Logout Admin?</h3>
                <p className="text-[11px] text-zinc-550 leading-relaxed font-sans">
                  You will be signed out of the admin dashboard.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setLogoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-xl bg-red-650 hover:bg-red-650 text-zinc-950 hover:text-zinc-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
