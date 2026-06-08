'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  MapPin,
  Cpu
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';

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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#71717a'];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { symbol, formatPrice } = useCurrency();

  useEffect(() => {
    setMounted(true);
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!mounted) return null;

  // Compute funnel stats mapping backend statuses to frontend stages
  const total = applications.length;
  const skipCount = applications.filter(a => a.status === 'SKIP').length;
  const netTotal = total - skipCount; // active evaluations

  // Backend statuses mapping:
  // Evaluated -> Saved Jobs
  // Applied -> Applied
  // Responded -> Screening
  // Interview -> Interview
  // Offer -> Offer
  // Rejected -> Rejected
  // Discarded -> Rejected (or Discarded)
  
  const savedJobs = applications.filter(a => a.status === 'Evaluated').length;
  const applied = applications.filter(a => a.status === 'Applied').length;
  const screening = applications.filter(a => a.status === 'Responded').length;
  const interview = applications.filter(a => ['Interview', 'Final Round'].includes(a.status)).length;
  const offer = applications.filter(a => a.status === 'Offer').length;
  const rejected = applications.filter(a => a.status === 'Rejected' || a.status === 'Discarded').length;

  const funnelData = [
    { name: 'Saved Jobs', value: savedJobs + applied + screening + interview + offer },
    { name: 'Applied', value: applied + screening + interview + offer },
    { name: 'Screening', value: screening + interview + offer },
    { name: 'Interview', value: interview + offer },
    { name: 'Offer', value: offer }
  ];

  // Distribution of scores
  const scoreDistribution = [
    { score: '5.0', count: 0 },
    { score: '4.5 - 4.9', count: 0 },
    { score: '4.0 - 4.4', count: 0 },
    { score: '3.5 - 3.9', count: 0 },
    { score: '3.0 - 3.4', count: 0 },
    { score: '< 3.0', count: 0 }
  ];

  applications.forEach(app => {
    const val = parseFloat(app.score.split('/')[0]);
    if (isNaN(val)) return;
    if (val === 5.0) scoreDistribution[0].count++;
    else if (val >= 4.5) scoreDistribution[1].count++;
    else if (val >= 4.0) scoreDistribution[2].count++;
    else if (val >= 3.5) scoreDistribution[3].count++;
    else if (val >= 3.0) scoreDistribution[4].count++;
    else scoreDistribution[5].count++;
  });

  // Archetype metrics
  const archetypeDistribution = [
    { name: 'Platform / LLMOps', value: applications.filter(a => a.role.toLowerCase().includes('platform') || a.role.toLowerCase().includes('ops')).length },
    { name: 'Solutions Architect', value: applications.filter(a => a.role.toLowerCase().includes('architect') || a.role.toLowerCase().includes('solutions')).length },
    { name: 'Technical AI PM', value: applications.filter(a => a.role.toLowerCase().includes('product') || a.role.toLowerCase().includes('pm')).length },
    { name: 'Adjacent Specialities', value: applications.filter(a => !a.role.toLowerCase().includes('platform') && !a.role.toLowerCase().includes('ops') && !a.role.toLowerCase().includes('architect') && !a.role.toLowerCase().includes('solutions') && !a.role.toLowerCase().includes('product') && !a.role.toLowerCase().includes('pm')).length }
  ].filter(arch => arch.value > 0);

  // Conversion Calculations
  const interviewRate = netTotal > 0 ? Math.round(((interview + offer) / netTotal) * 100) : 0;
  const responseRate = netTotal > 0 ? Math.round(((screening + interview + offer) / netTotal) * 100) : 0;
  const offerRate = (applied + screening + interview + offer) > 0 ? Math.round((offer / (applied + screening + interview + offer)) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div>
        <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Search Analytics</h2>
        <p className="text-zinc-500 text-xs font-mono">Funnel conversion performance metrics</p>
      </div>

      {/* Grid of conversion stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl glass-card flex flex-col justify-between h-28 border border-zinc-900">
          <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">Total Scraped JDs</span>
          <div>
            <span className="text-2xl font-extrabold text-zinc-100">{total}</span>
            <span className="text-[9px] text-zinc-550 block mt-0.5">{skipCount} marked as SKIP</span>
          </div>
        </div>

        <div className="p-5 rounded-xl glass-card flex flex-col justify-between h-28 border border-zinc-900">
          <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">Response Rate</span>
          <div>
            <span className="text-2xl font-extrabold text-zinc-100">{responseRate}%</span>
            <span className="text-[9px] text-zinc-550 block mt-0.5">Recruiter callback ratio</span>
          </div>
        </div>

        <div className="p-5 rounded-xl glass-card flex flex-col justify-between h-28 border border-zinc-900">
          <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">Interview Conversion</span>
          <div>
            <span className="text-2xl font-extrabold text-zinc-100">{interviewRate}%</span>
            <span className="text-[9px] text-zinc-550 block mt-0.5">Screening success rate</span>
          </div>
        </div>

        <div className="p-5 rounded-xl glass-card flex flex-col justify-between h-28 border border-zinc-900">
          <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">Offer Conversion</span>
          <div>
            <span className="text-2xl font-extrabold text-zinc-100">{offerRate}%</span>
            <span className="text-[9px] text-zinc-550 block mt-0.5">Offer-to-applied ratio</span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Graph */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
          <div>
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono">Job Pipeline funnel</h3>
            <span className="text-[10px] text-zinc-550 block">Application volume across Pipeline stages</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" stroke="#52525b" fontSize={9} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
          <div>
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono">Evaluation Score Distribution</h3>
            <span className="text-[10px] text-zinc-550 block">Density of JD alignment ratings</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <XAxis dataKey="score" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Archetype Breakdown */}
        {archetypeDistribution.length > 0 && (
          <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
            <div>
              <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono">Target Archetypes density</h3>
              <span className="text-[10px] text-zinc-550 block">Density of opportunities by core roles</span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={archetypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {archetypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#09090b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-1/2 space-y-2.5">
                {archetypeDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-start gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <span className="text-[10px] text-zinc-300 block leading-tight">{entry.name}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {entry.value} jobs ({Math.round((entry.value / total) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Operational velocity */}
        <div className="p-6 rounded-xl glass-panel space-y-4 flex flex-col justify-between border border-zinc-900">
          <div className="space-y-1">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono">Campaign recommendations</h3>
            <span className="text-[10px] text-zinc-550 block">Operational suggestions from AI matching</span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-semibold text-zinc-200">Scale Solutions Architect pipeline</h4>
                <p className="text-[9px] text-zinc-500 leading-normal">
                  Your Solutions Architect pipeline has a 45% response rate but represents only 15% of total evaluations. Focus more scans on this archetype.
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-semibold text-zinc-200">Review Rejected Scans</h4>
                <p className="text-[9px] text-zinc-500 leading-normal">
                  3 applications were rejected within 7 days. Analysis points to location policy blockers. Review geographic settings in yml.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
