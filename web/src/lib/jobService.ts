import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

// ── Category derivation ──────────────────────────────────────────────
// Lightweight keyword bucketing shared by seed data and live ingestion so the
// `category` facet is consistent regardless of source.
const CATEGORY_RULES: [string, string[]][] = [
  ['Data & Analytics', ['data analyst', 'data scientist', 'data engineer', 'analytics', 'bi ', 'business intelligence']],
  ['Machine Learning & AI', ['machine learning', 'ml ', 'ai ', 'artificial intelligence', 'llm', 'nlp', 'computer vision', 'deep learning']],
  ['Software Engineering', ['software engineer', 'developer', 'sde', 'backend', 'frontend', 'full stack', 'full-stack', 'platform engineer']],
  ['DevOps & Cloud', ['devops', 'sre', 'site reliability', 'cloud', 'infrastructure', 'kubernetes', 'platform reliability']],
  ['Product & Design', ['product manager', 'product designer', 'ux', 'ui ', 'designer']],
  ['QA & Testing', ['qa ', 'quality assurance', 'test engineer', 'sdet']],
  ['Security', ['security', 'infosec', 'appsec', 'penetration']],
  ['Mobile', ['android', 'ios', 'mobile', 'react native', 'flutter']],
];

export function categorize(title: string): string {
  const t = ` ${title.toLowerCase()} `;
  for (const [cat, kws] of CATEGORY_RULES) {
    if (kws.some((k) => t.includes(k))) return cat;
  }
  return 'Other';
}

export interface JobSearchOpts {
  q?: string;
  title?: string;
  company?: string;
  category?: string;
  location?: string;
  workMode?: string;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  datePosted?: string;
  skills?: string;
  limit?: number;
}

/**
 * Search the central Job DB with advanced filters and global search.
 */
export async function searchJobs(opts: JobSearchOpts) {
  const where: Prisma.JobWhereInput = {};
  const and: Prisma.JobWhereInput[] = [];

  // General search query q: matches title, company, location, or skills
  if (opts.q?.trim()) {
    const term = opts.q.trim();
    and.push({
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
        { skills: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  // Specific filters (AND logic)
  if (opts.title?.trim()) {
    and.push({ title: { contains: opts.title.trim(), mode: 'insensitive' } });
  }
  if (opts.company?.trim()) {
    and.push({ company: { contains: opts.company.trim(), mode: 'insensitive' } });
  }
  if (opts.category?.trim() && opts.category !== 'All') {
    and.push({ category: opts.category.trim() });
  }
  if (opts.location?.trim()) {
    and.push({ location: { contains: opts.location.trim(), mode: 'insensitive' } });
  }

  // Work Mode filter (comma-separated support)
  if (opts.workMode?.trim()) {
    const modes = opts.workMode.split(',').map(m => m.trim()).filter(Boolean);
    if (modes.length > 0) {
      and.push({ workMode: { in: modes } });
    }
  }

  // Employment Type filter (comma-separated support)
  if (opts.employmentType?.trim()) {
    const types = opts.employmentType.split(',').map(t => t.trim()).filter(Boolean);
    if (types.length > 0) {
      and.push({ employmentType: { in: types } });
    }
  }

  // Experience Level filter (comma-separated support)
  if (opts.experienceLevel?.trim()) {
    const levels = opts.experienceLevel.split(',').map(l => l.trim()).filter(Boolean);
    if (levels.length > 0) {
      and.push({ experienceLevel: { in: levels } });
    }
  }

  // Salary range filter
  if (opts.salaryMin !== undefined && !isNaN(opts.salaryMin)) {
    // Return jobs where salaryMax >= salaryMin or salaryMin >= salaryMin
    and.push({
      OR: [
        { salaryMin: { gte: opts.salaryMin } },
        { salaryMax: { gte: opts.salaryMin } }
      ]
    });
  }
  if (opts.salaryMax !== undefined && !isNaN(opts.salaryMax)) {
    and.push({
      OR: [
        { salaryMin: { lte: opts.salaryMax } },
        { salaryMax: { lte: opts.salaryMax } }
      ]
    });
  }

  // Date posted filter
  if (opts.datePosted?.trim() && opts.datePosted !== 'all') {
    let cutoffDate = new Date();
    if (opts.datePosted === '24h') {
      cutoffDate.setDate(cutoffDate.getDate() - 1);
      and.push({ postedAt: { gte: cutoffDate } });
    } else if (opts.datePosted === '7d') {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      and.push({ postedAt: { gte: cutoffDate } });
    } else if (opts.datePosted === '30d') {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      and.push({ postedAt: { gte: cutoffDate } });
    }
  }

  // Skills filter (matches if any required skill is in the job's skills field)
  if (opts.skills?.trim()) {
    const skillList = opts.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      const skillOrs = skillList.map(skill => ({
        skills: { contains: skill, mode: 'insensitive' as const }
      }));
      and.push({ OR: skillOrs });
    }
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return prisma.job.findMany({
    where,
    orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
    take: Math.min(opts.limit ?? 60, 200),
  });
}

export async function getJob(id: string) {
  return prisma.job.findUnique({ where: { id } });
}

/** Distinct categories present in the DB (for the search UI filter chips). */
export async function listCategories(): Promise<string[]> {
  const rows = await prisma.job.findMany({
    where: { category: { not: null } },
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  });
  return rows.map((r) => r.category!).filter(Boolean);
}

/** Record that a user viewed a job (recommendation signal; idempotent). */
export async function recordView(userId: string, jobId: string): Promise<void> {
  await prisma.viewedJob.upsert({
    where: { userId_jobId: { userId, jobId } },
    create: { userId, jobId },
    update: { viewedAt: new Date() },
  });
}
