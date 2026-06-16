import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────
// Recommendation foundation (Zippia-style). Scores Job rows against per-user
// signals, all keyed to userId:
//   • resume skills      (Skill table on the user's Student profile)  — weight 3
//   • search history     (SearchHistory queries)                      — weight 2
//   • saved-job context  (TrackedJob titles/categories)              — weight 2
//   • viewed-job context (ViewedJob titles/categories)               — weight 1
// Already-tracked jobs are excluded. Returns ranked jobs + a short "why".
// ─────────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'engineer', 'senior', 'staff', 'lead', 'junior', 'intern',
  'remote', 'hybrid', 'inc', 'ltd', 'team', 'jobs', 'job',
]);

function tokenize(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

export interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  category: string | null;
  atsUrl: string | null;
  score: number;
  why: string[];
}

interface WeightedToken {
  token: string;
  weight: number;
  label: string; // which signal it came from (for the "why")
}

export async function recommendJobs(userId: string, limit = 12): Promise<RecommendedJob[]> {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true, skills: { select: { name: true } } },
  });

  const [searches, tracked, viewed] = await Promise.all([
    prisma.searchHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.trackedJob.findMany({ where: { userId }, select: { jobId: true, role: true, job: { select: { category: true } } } }),
    prisma.viewedJob.findMany({ where: { userId }, take: 30, select: { job: { select: { title: true, category: true } } } }),
  ]);

  // Build the weighted signal vocabulary.
  const weights = new Map<string, WeightedToken>();
  const add = (tokens: string[], weight: number, label: string) => {
    for (const t of tokens) {
      const prev = weights.get(t);
      if (!prev || prev.weight < weight) weights.set(t, { token: t, weight, label });
    }
  };
  add((student?.skills ?? []).flatMap((s) => tokenize(s.name)), 3, 'your skills');
  add(searches.flatMap((s) => tokenize(s.query)), 2, 'your searches');
  add(tracked.flatMap((t) => [...tokenize(t.role), ...tokenize(t.job?.category)]), 2, 'jobs you saved');
  add(viewed.flatMap((v) => [...tokenize(v.job?.title), ...tokenize(v.job?.category)]), 1, 'jobs you viewed');

  if (weights.size === 0) {
    // Cold start: no signals yet → surface the most recent postings.
    const recent = await prisma.job.findMany({ orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }], take: limit });
    return recent.map((j) => ({
      id: j.id, title: j.title, company: j.company, location: j.location, category: j.category,
      atsUrl: j.atsUrl, score: 0, why: ['Latest postings — add skills or search to personalize'],
    }));
  }

  const trackedJobIds = new Set(tracked.map((t) => t.jobId).filter(Boolean) as string[]);

  // Candidate pool: recent jobs (bounded). Score each by token overlap.
  const candidates = await prisma.job.findMany({ orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }], take: 400 });

  const scored = candidates
    .filter((j) => !trackedJobIds.has(j.id))
    .map((j) => {
      const haystack = new Set([...tokenize(j.title), ...tokenize(j.category), ...tokenize(j.description)]);
      let score = 0;
      const reasons = new Map<string, number>(); // label → hits
      for (const tok of haystack) {
        const w = weights.get(tok);
        if (w) {
          score += w.weight;
          reasons.set(w.label, (reasons.get(w.label) ?? 0) + 1);
        }
      }
      const why = [...reasons.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([label, hits]) => `Matches ${label} (${hits})`);
      return {
        id: j.id, title: j.title, company: j.company, location: j.location, category: j.category,
        atsUrl: j.atsUrl, score, why,
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
