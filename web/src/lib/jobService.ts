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
  title?: string;
  company?: string;
  category?: string;
  limit?: number;
}

/**
 * Search the central Job DB. `title` matches across ALL companies; `company`
 * returns every job for that company; `category` filters the bucket. Empty
 * opts → most recent postings.
 */
export async function searchJobs(opts: JobSearchOpts) {
  const where: Prisma.JobWhereInput = {};
  const and: Prisma.JobWhereInput[] = [];
  if (opts.title?.trim()) and.push({ title: { contains: opts.title.trim(), mode: 'insensitive' } });
  if (opts.company?.trim()) and.push({ company: { contains: opts.company.trim(), mode: 'insensitive' } });
  if (opts.category?.trim() && opts.category !== 'All') and.push({ category: opts.category.trim() });
  if (and.length) where.AND = and;

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
