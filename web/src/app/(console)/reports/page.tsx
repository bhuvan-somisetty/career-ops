'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface ReportSummary {
  id: string;
  company: string;
  role: string;
  date: string;
  score: string;
  archetype: string;
  legitimacy: string;
  slug: string;
}

export default function ReportsListPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredReports = reports.filter(r => {
    const q = searchQuery.toLowerCase();
    return r.company.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q) ||
      r.archetype.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">AI Evaluation Reports</h2>
          <p className="text-zinc-500 text-xs font-mono">Detailed fit assessments (Blocks A-G) for each job</p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-1.5 rounded-lg glass-input text-xs w-60"
          />
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-xs">Loading evaluation reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-xs border border-dashed border-zinc-900 rounded-xl">
          No matching reports found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <Link key={report.slug} href={`/reports/${report.slug}`}>
              <div className="p-5 rounded-xl glass-card flex flex-col justify-between h-56 border border-zinc-900 cursor-pointer group">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      Report #{report.id}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      {report.company}
                    </h4>
                    <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{report.role}</p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-900/40 border border-zinc-900 rounded-lg p-2">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                    <div>
                      <span className="text-[9px] text-zinc-500 block leading-none uppercase tracking-wide">archetype</span>
                      <span className="text-[10px] text-zinc-300 font-medium block mt-1">{report.archetype}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900/50 pt-3 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 font-mono">{report.score}/5 Match</span>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1 group-hover:text-zinc-200 transition-colors">
                    Read Report
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
