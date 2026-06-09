'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface BranchStat {
  branch: string;
  rate: number;
  placed: number;
  total: number;
  status: string;
  color: string;
}

export const placementStatsByBranch: BranchStat[] = [
  { branch: 'CSE', rate: 94, placed: 188, total: 200, status: 'Excellent', color: '#10b981' },
  { branch: 'AI/ML', rate: 91, placed: 91, total: 100, status: 'Excellent', color: '#06b6d4' },
  { branch: 'IT', rate: 88, placed: 88, total: 100, status: 'Good', color: '#3b82f6' },
  { branch: 'ECE', rate: 76, placed: 76, total: 100, status: 'Good', color: '#8b5cf6' },
  { branch: 'Mechanical', rate: 65, placed: 65, total: 100, status: 'Average', color: '#f97316' },
  { branch: 'Civil', rate: 58, placed: 58, total: 100, status: 'Average', color: '#ef4444' }
];

const branchFullNames: Record<string, string> = {
  'CSE': 'Computer Science Engineering',
  'AI/ML': 'Artificial Intelligence & Machine Learning',
  'IT': 'Information Technology',
  'ECE': 'Electronics & Communication Engineering',
  'Mechanical': 'Mechanical Engineering',
  'Civil': 'Civil Engineering'
};

// Stripe-grade dark-theme tooltip. Recharts v3 reliably passes `active`/`payload`
// to a render-function `content`, so we use that form (an element clone can drop
// the injected props in v3 — the root cause of the "hover shows nothing" bug).
interface TooltipPayloadItem { payload: BranchStat }
function BranchTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  const fullName = branchFullNames[data.branch] || data.branch;
  return (
    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl font-sans text-xs space-y-1.5 min-w-[200px]">
      <span className="font-extrabold text-zinc-200 block border-b border-zinc-800 pb-1">{fullName}</span>
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
        <div className="flex justify-between border-t border-zinc-800 pt-1 mt-1 font-sans">
          <span className="text-zinc-500">Status:</span>
          <span className={`font-bold ${data.status === 'Excellent' ? 'text-emerald-400' : data.status === 'Good' ? 'text-blue-400' : 'text-amber-500'}`}>
            {data.status}
          </span>
        </div>
      </div>
    </div>
  );
}

const hoverGlowClasses: Record<string, string> = {
  '#10b981': 'hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]',
  '#06b6d4': 'hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]',
  '#3b82f6': 'hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]',
  '#8b5cf6': 'hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]',
  '#f97316': 'hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]',
  '#ef4444': 'hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]'
};

export default function AdminBranchChart() {
  return (
    <div className="h-56 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={placementStatsByBranch} margin={{ bottom: 20 }}>
          <XAxis dataKey="branch" stroke="#a1a1aa" fontSize={12} fontWeight={700} tickLine={false} />
          <YAxis stroke="#a1a1aa" fontSize={12} fontWeight={700} tickLine={false} />
          <Tooltip
            content={(props) => <BranchTooltip {...(props as unknown as { active?: boolean; payload?: TooltipPayloadItem[] })} />}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            wrapperStyle={{ outline: 'none', zIndex: 50 }}
          />
          <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={34} isAnimationActive animationBegin={0} animationDuration={1000}>
            {placementStatsByBranch.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={0.8}
                className={`transition-all duration-300 hover:fill-opacity-100 origin-bottom cursor-pointer ${hoverGlowClasses[entry.color] || ''}`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
