'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, ArrowUpRight, Loader2, Tag } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  company: string;
  location: string | null;
  category: string | null;
  atsUrl: string | null;
  score: number;
  why: string[];
}

// Dashboard widget: ranked jobs from the user's skills + activity.
export default function RecommendedJobs({ limit = 6 }: { limit?: number }) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recommendations?limit=${limit}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { recommendations: [] }))
      .then((d) => setRecs(d.recommendations || []))
      .catch(() => setRecs([]))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-zinc-100">Recommended for you</h3>
        </div>
        <Link href="/jobs" className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          See all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-zinc-500 text-xs font-mono gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Computing recommendations…
        </div>
      ) : recs.length === 0 ? (
        <p className="text-[11px] text-zinc-500 py-6 text-center">
          Add skills to your profile and search a few jobs to unlock personalized recommendations.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recs.map((r) => (
            <Link key={r.id} href="/jobs" className="block p-4 rounded-xl bg-zinc-900/30 border border-zinc-900 hover:border-emerald-500/30 transition-colors group">
              <h4 className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors line-clamp-1">{r.title}</h4>
              <span className="text-[10px] text-zinc-500 font-mono">{r.company}</span>
              {r.location && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                  <MapPin className="w-3 h-3 text-zinc-600" />{r.location}
                </div>
              )}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-900/60">
                <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{r.category || 'Other'}</span>
                {r.score > 0 && <span className="text-[9px] font-mono text-emerald-400">match {r.score}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
