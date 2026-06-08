'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  BookOpen,
  Check
} from 'lucide-react';

interface CvData {
  content: string;
  isMock: boolean;
}

export default function ResumeMatchPage() {
  const [cv, setCv] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchCv = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cv');
      const data = await res.json();
      setCv(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchCv();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await fetchCv();
    setTimeout(() => {
      setSyncing(false);
    }, 700);
  };

  const skillGaps = [
    { skill: 'Vector Databases', context: 'Required in 80% of Solutions Architect roles (Pinecone, Milvus, pgvector)' },
    { skill: 'Distributed PyTorch', context: 'Required for OpenAI and Cohere Research Engineering JDs' },
    { skill: 'Product Telemetry', context: 'Required for Notion Technical AI PM roles' }
  ];

  const missingKeywords = [
    'semantic search', 'RAG evaluation', 'vector indexing', 'agent orchestration', 'modelSafety parameters'
  ];

  const improvements = [
    'State the total latency drop in milliseconds (e.g., "reduced latency from 140ms to 85ms") in your Lead AI role.',
    'Add Pinecone or pgvector to your "AI/ML Skills" block to resolve the Vector Database gap.',
    'Embed your "Built and sold SaaS" Exit Story directly in the Resume Professional Summary.'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Resume Match Engine</h2>
          <p className="text-zinc-500 text-xs font-mono">Verify and align resume properties against targeting metrics</p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-800 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync cv.md Source'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (2/5): Beautiful CV Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Source: cv.md</span>
            {cv?.isMock && (
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                Mock Fallback
              </span>
            )}
          </div>

          <div className="p-6 rounded-xl glass-panel min-h-[500px] max-h-[680px] overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-300 space-y-4 border border-zinc-900/80">
            {loading ? (
              <div className="text-zinc-600 text-center py-24">Loading resume source...</div>
            ) : cv ? (
              <pre className="whitespace-pre-wrap font-sans text-xs prose prose-invert max-w-none">
                {cv.content}
              </pre>
            ) : (
              <div className="text-zinc-650 text-center py-24 font-mono">cv.md empty. Add resume.</div>
            )}
          </div>
        </div>

        {/* Right Column (3/5): Alignment Metrics & Gaps */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main Dial */}
          <div className="p-6 rounded-xl glass-panel grid grid-cols-1 sm:grid-cols-3 gap-6 items-center border border-zinc-900">
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl relative">
              <span className="text-4xl font-extrabold text-emerald-400 tracking-tight">92%</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Goal Alignment</span>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Resume Fit: Staff LLMOps / AI Engineer
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Your resume has exceptional matching strength for AI Platform/LLMOps roles. It contains strong metrics for inference cost reduction and pipeline orchestration.
              </p>
              <div className="pt-1 flex items-center gap-4 text-[9px] text-zinc-500 font-mono">
                <span>Total Words: 384</span>
                <span>ATS Pass Probability: High</span>
              </div>
            </div>
          </div>

          {/* ATS Compatibility */}
          <div className="p-6 rounded-xl glass-panel space-y-3 border border-zinc-900">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono">ATS Compatibility Index</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Structural Score (formatting)</span>
                <span className="font-mono font-bold text-emerald-400">95%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '95%' }} />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Semantic Keyword Density</span>
                <span className="font-mono font-bold text-emerald-400">88%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="p-6 rounded-xl glass-panel space-y-3 border border-zinc-900">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Detected Skill Gaps
            </h3>
            <div className="space-y-2">
              {skillGaps.map((gap, i) => (
                <div key={i} className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">{gap.skill}</span>
                    <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                      Moderate Impact
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-550">{gap.context}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="p-6 rounded-xl glass-panel space-y-3 border border-zinc-900">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              Missing JDs Keywords
            </h3>
            <p className="text-[10px] text-zinc-500">
              Adding these keywords into your experience blocks will increase your ATS pass rates for Solutions Architect roles:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors font-mono cursor-pointer"
                >
                  + {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Actionable suggestions */}
          <div className="p-6 rounded-xl glass-panel space-y-3 border border-zinc-900">
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-zinc-550" />
              Actionable Recommendations
            </h3>
            <ul className="space-y-2">
              {improvements.map((imp, i) => (
                <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center font-mono text-[9px] text-zinc-500 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
