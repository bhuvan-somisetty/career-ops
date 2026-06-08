'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Sparkles,
  Bookmark,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  X,
  Cpu,
  BookmarkCheck,
  TrendingUp
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryUSDMin: number;
  salaryUSDMax: number;
  matchScore: number;
  archetype: string;
  description: string;
  requirements: string[];
  strengths: string[];
  gaps: string[];
  trending?: boolean;
}

const mockJobOpportunities: JobOpportunity[] = [
  {
    id: 'job-1',
    title: 'Staff LLMOps Platform Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA (Hybrid)',
    salaryUSDMin: 190000,
    salaryUSDMax: 240000,
    matchScore: 96,
    archetype: 'Platform / LLMOps',
    description: 'We are looking for a Staff Engineer to lead the design and implementation of Stripe\'s internal LLM developer platform and execution endpoints.',
    requirements: [
      'Experience scaling high-throughput APIs (Go/Python)',
      'Expertise in LLM orchestration frameworks (LangChain, LlamaIndex)',
      'Familiarity with model caching, batching, and quantization techniques',
      'Track record in platform engineering and Kubernetes orchestration'
    ],
    strengths: [
      'Matches your Go microservices scaling background at ScaleSaaS Corp',
      'Strong overlap with LLM caching optimizations (built 38% cost reduction pipeline)',
      'High alignment on target salary comp targets'
    ],
    gaps: [
      'Stripe prefers hybrid work (3 days/week in SF). Check if location policy matches.'
    ],
    trending: true
  },
  {
    id: 'job-2',
    title: 'AI Solutions Architect',
    company: 'Vercel',
    location: 'Remote (US)',
    salaryUSDMin: 170000,
    salaryUSDMax: 210000,
    matchScore: 94,
    archetype: 'Solutions Architect',
    description: 'Help Vercel\'s enterprise clients architect, deploy, and optimize AI-native web applications on our global frontend cloud network.',
    requirements: [
      'Deep expertise in frontend frameworks (Next.js, React)',
      'Familiarity with vector databases (Pinecone, pgvector) and semantic search architectures',
      'Client-facing or consulting experience in technical product delivery'
    ],
    strengths: [
      'Deep alignment on Next.js/React technical foundations',
      'Prior consulting/client experience building visual SaaS dashboards',
      'Strong communication skills and cross-functional exit narrative'
    ],
    gaps: [
      'Requires vector database production experience. Highlight pgvector knowledge in cv.md.'
    ]
  },
  {
    id: 'job-3',
    title: 'Technical Product Manager, GenAI Platforms',
    company: 'Notion',
    location: 'San Francisco, CA (Hybrid)',
    salaryUSDMin: 180000,
    salaryUSDMax: 220000,
    matchScore: 88,
    archetype: 'Technical AI PM',
    description: 'Define the roadmap for Notion\'s next-generation AI features, workspaces, and multi-agent workflow systems.',
    requirements: [
      'Background as a technical engineer or developer turned PM',
      'Experience writing PRDs, mapping user journeys, and setting up product analytics',
      'Deep understanding of generative AI models and multi-agent HITL interfaces'
    ],
    strengths: [
      'Perfect match for your exit headline: "ML Engineer turned AI product builder"',
      'Candidate has experience running SaaS product scaling end-to-end'
    ],
    gaps: [
      'Requires formal product management metrics experience. Highlight telemetry setups.'
    ],
    trending: true
  },
  {
    id: 'job-4',
    title: 'AI Forward Deployed Engineer',
    company: 'Cohere',
    location: 'New York, NY (Hybrid)',
    salaryUSDMin: 160000,
    salaryUSDMax: 190000,
    matchScore: 85,
    archetype: 'Forward Deployed Engineer',
    description: 'Work directly with Cohere\'s largest enterprise clients to prototype, test, and productionize custom NLP and RAG installations.',
    requirements: [
      'Expertise in Python, PyTorch, and transformer models',
      'Familiarity with enterprise security protocols and hybrid cloud installations',
      'Fast prototyper who loves shipping code'
    ],
    strengths: [
      'Strong python/NLP capabilities',
      'Proven capacity to prototype fast (idea to production in 2 weeks)'
    ],
    gaps: [
      'Cohere requires hybrid presence in NYC. Location match is low (SF preferred).'
    ]
  },
  {
    id: 'job-5',
    title: 'Senior Machine Learning Platform Developer',
    company: 'Linear',
    location: 'Remote (Global)',
    salaryUSDMin: 150000,
    salaryUSDMax: 180000,
    matchScore: 92,
    archetype: 'Platform / LLMOps',
    description: 'Help build Linear\'s internal AI platform that fuels issues categorization, triage intelligence, and predictive scheduling.',
    requirements: [
      'Strong foundation in Go or Rust backend platform engineering',
      'Familiarity with offline evaluation systems, pipeline scoring, and model safety parameters',
      'Obsessed with layout, speed, and premium terminal UI quality'
    ],
    strengths: [
      'Matches Go backend platform skills and Bubble Tea CLI styling interests',
      'Proven expertise in telemetry, latency optimization, and reliability caching'
    ],
    gaps: [
      'None. Perfect role fit.'
    ]
  }
];

export default function JobDiscoveryPage() {
  const [jobs] = useState<JobOpportunity[]>(mockJobOpportunities);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState('All');
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const { formatPrice } = useCurrency();

  const handleSaveJob = async (job: JobOpportunity) => {
    const newSaved = new Set(savedJobIds);
    if (newSaved.has(job.id)) {
      newSaved.delete(job.id);
    } else {
      newSaved.add(job.id);

      try {
        const today = new Date().toISOString().split('T')[0];
        const scoreOutOfFive = (job.matchScore / 20).toFixed(1) + '/5';

        await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: job.company,
            role: job.title,
            date: today,
            score: scoreOutOfFive,
            status: 'Evaluated',
            pdf: '❌',
            notes: `Discovered from Portal Scanner. AI recommendations: ${job.strengths[0]}`
          })
        });
      } catch {}
    }
    setSavedJobIds(newSaved);
  };

  const filteredJobs = jobs.filter(job => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = job.company.toLowerCase().includes(q) ||
      job.title.toLowerCase().includes(q) ||
      job.archetype.toLowerCase().includes(q);

    const matchesArchetype = selectedArchetype === 'All' || job.archetype === selectedArchetype;

    return matchesQuery && matchesArchetype;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Portals Scanner</h2>
          <p className="text-zinc-500 text-xs font-mono">Aggregated matching roles across 45+ monitored platforms</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search positions or archetypes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-lg glass-input text-xs w-60"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 rounded-lg p-0.5">
            {['All', 'Platform / LLMOps', 'Solutions Architect', 'Technical AI PM'].map(arch => (
              <button
                key={arch}
                onClick={() => setSelectedArchetype(arch)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  selectedArchetype === arch
                    ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {arch === 'All' ? 'All Roles' : arch.replace(' / ', '/')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Jobs Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map(job => {
          const isSaved = savedJobIds.has(job.id);
          return (
            <motion.div
              key={job.id}
              layoutId={`discovery-job-${job.id}`}
              className="p-5 rounded-xl glass-card flex flex-col justify-between h-64 border border-zinc-900 relative group cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      {job.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{job.company}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveJob(job);
                    }}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      isSaved
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-zinc-650" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <span>{formatPrice(job.salaryUSDMin)} - {formatPrice(job.salaryUSDMax)}</span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-550 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="border-t border-zinc-900/50 pt-3 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">{job.matchScore}% Match</span>
                </div>
                {job.trending && (
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-500/20">
                    <TrendingUp className="w-2.5 h-2.5" />
                    Trending
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Details Side-Drawer */}
      <AnimatePresence>
        {selectedJob && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 bg-black/60 z-50 cursor-pointer"
            />
            {/* Slideout Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[540px] bg-zinc-950 border-l border-zinc-900 p-6 z-50 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">AI Match Report</span>
                    <h3 className="font-bold text-sm text-zinc-100 mt-1">{selectedJob.title}</h3>
                    <p className="text-[10px] text-zinc-500">{selectedJob.company} — {selectedJob.location}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-1 rounded-lg border border-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Match dial */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="w-14 h-14 rounded-full border-2 border-emerald-500 flex items-center justify-center font-mono font-bold text-sm text-emerald-400">
                      {selectedJob.matchScore}%
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">Alignment Score: Excellent</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        High fit against your exit narrative and primary **{selectedJob.archetype}** archetype targets.
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-zinc-200 font-mono tracking-wide">JD Highlights</h4>
                    <ul className="space-y-1.5">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-2 leading-relaxed">
                          <Cpu className="w-3.5 h-3.5 text-zinc-650 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Strengths */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-emerald-400 font-mono tracking-wide flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Strengths & Fit Points
                    </h4>
                    <ul className="space-y-1.5 bg-zinc-900/10 border border-zinc-900 rounded-lg p-3">
                      {selectedJob.strengths.map((str, i) => (
                        <li key={i} className="text-[10px] text-zinc-300 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Gaps */}
                  {selectedJob.gaps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-amber-500 font-mono tracking-wide flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Skill Gaps & Risks
                      </h4>
                      <ul className="space-y-1.5 bg-zinc-900/10 border border-zinc-900 rounded-lg p-3">
                        {selectedJob.gaps.map((gap, i) => (
                          <li key={i} className="text-[10px] text-zinc-300 flex items-start gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex gap-3 mt-6">
                <button
                  onClick={() => handleSaveJob(selectedJob)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                    savedJobIds.has(selectedJob.id)
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 border-transparent'
                  }`}
                >
                  {savedJobIds.has(selectedJob.id) ? 'Saved to Pipeline' : 'Add to Pipeline'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
