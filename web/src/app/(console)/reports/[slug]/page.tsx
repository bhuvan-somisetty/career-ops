'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Clipboard,
  CheckCircle,
  Cpu,
  AlertTriangle
} from 'lucide-react';

interface ReportDetails {
  content: string;
  isMock: boolean;
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Parse header info from markdown text (fallback extraction if file exists)
  const getHeaderInfo = () => {
    if (!report) return { company: 'Unknown', role: 'Unknown', score: 'N/A', date: '', legitimacy: '' };
    const content = report.content;

    const companyMatch = content.match(/# Evaluation:\s*([^\u2014—\n]*)/);
    const roleMatch = content.match(/# Evaluation:\s*[^\u2014—]*\u2014\s*(.*)/) || content.match(/# Evaluation:\s*[^\u2014—]*\s*—\s*(.*)/);
    const dateMatch = content.match(/\*\*Date:\*\*\s*(.*)/);
    const scoreMatch = content.match(/\*\*Score:\*\*\s*(.*)/);
    const legitimacyMatch = content.match(/\*\*Legitimacy:\*\*\s*(.*)/);

    return {
      company: companyMatch ? companyMatch[1].trim() : 'Company Profile',
      role: roleMatch ? roleMatch[1].trim() : 'Evaluated Position',
      score: scoreMatch ? scoreMatch[1].trim() : 'Evaluated',
      date: dateMatch ? dateMatch[1].trim() : '',
      legitimacy: legitimacyMatch ? legitimacyMatch[1].trim() : 'High Confidence'
    };
  };

  const info = getHeaderInfo();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link href="/reports" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors w-fit">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Reports Directory
      </Link>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-xs">Loading report analysis...</div>
      ) : report ? (
        <div className="space-y-6">
          {/* Summary Banner Card */}
          <div className="p-6 rounded-xl glass-panel relative overflow-hidden border border-zinc-900">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{info.company}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{info.role}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-xl font-extrabold text-emerald-400 tracking-tight">{info.score}</span>
                    <span className="text-[9px] text-zinc-500 font-mono block">AI Alignment score</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-900/50 text-[10px] text-zinc-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Evaluated: {info.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Legitimacy: {info.legitimacy}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                  <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Source: LLM-Core Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-8 rounded-xl glass-panel border border-zinc-900/80">
            <article className="prose prose-invert prose-xs max-w-none text-zinc-300 leading-relaxed space-y-6">
              {/* Output markdown by rendering it or preformatted */}
              <pre className="whitespace-pre-wrap font-sans text-xs select-text prose prose-invert">
                {report.content.replace(/# Evaluation:[\s\S]*?---/, '').trim()}
              </pre>
            </article>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500 font-mono text-xs border border-zinc-900 rounded-xl">
          Report could not be retrieved
        </div>
      )}
    </div>
  );
}
