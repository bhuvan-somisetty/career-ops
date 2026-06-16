import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { prisma } from './prisma';
import { categorize } from './jobService';

// ─────────────────────────────────────────────────────────────────────────
// Live ATS ingestion. Hits the PUBLIC job-board JSON APIs of Greenhouse,
// Lever, and Ashby — no credentials required. Company list is read from the
// repo-root portals.yml (`tracked_companies`), the same source the CLI scanner
// uses. Normalized rows are upserted into the central Job table on
// (source, externalId), so re-running refreshes rather than duplicates.
//
// This is OPT-IN (triggered via POST /api/jobs/ingest). The app also ships
// seed jobs, so the portal works with zero network access.
// ─────────────────────────────────────────────────────────────────────────

interface TrackedCompany {
  name: string;
  careers_url?: string;
  api?: string;
  enabled?: boolean;
}

interface NormalizedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string | null;
  atsUrl: string | null;
  careerPortalUrl: string | null;
  description: string | null;
  postedAt: Date | null;
}

const PORTALS_PATH = path.resolve(process.cwd(), '..', 'portals.yml');
const FETCH_TIMEOUT_MS = 12000;

function readTrackedCompanies(): TrackedCompany[] {
  if (!fs.existsSync(PORTALS_PATH)) return [];
  const doc = yaml.load(fs.readFileSync(PORTALS_PATH, 'utf8')) as { tracked_companies?: TrackedCompany[] };
  return (doc?.tracked_companies ?? []).filter((c) => c?.name && c.enabled !== false);
}

/** Detect provider + slug from a careers/api URL. */
function detectProvider(c: TrackedCompany): { provider: string; slug: string } | null {
  const url = c.api || c.careers_url || '';
  let m: RegExpMatchArray | null;
  if ((m = url.match(/greenhouse\.io\/v1\/boards\/([^/]+)/)) || (m = url.match(/greenhouse\.io\/(?:embed\/)?(?:job_board\?for=|[^/]*\/)?([a-z0-9-]+)\/?(?:jobs)?/i))) {
    // Prefer the explicit boards-api slug; else the careers-page slug.
    const slug = url.match(/boards\/([^/?]+)/)?.[1] || url.match(/greenhouse\.io\/([a-z0-9-]+)/i)?.[1];
    if (slug) return { provider: 'greenhouse', slug };
  }
  if ((m = url.match(/ashbyhq\.com\/([a-z0-9-]+)/i))) return { provider: 'ashby', slug: m[1] };
  if ((m = url.match(/lever\.co\/([a-z0-9-]+)/i))) return { provider: 'lever', slug: m[1] };
  return null;
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { Accept: 'application/json', ...(init?.headers || {}) } });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function stripHtml(s: string | undefined | null): string | null {
  if (!s) return null;
  return s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000) || null;
}

async function fetchGreenhouse(company: string, slug: string): Promise<NormalizedJob[]> {
  const data = (await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`)) as {
    jobs?: { id: number; title: string; location?: { name?: string }; absolute_url?: string; updated_at?: string; content?: string }[];
  };
  return (data.jobs ?? []).map((j) => ({
    source: 'greenhouse',
    externalId: `${slug}:${j.id}`,
    title: j.title,
    company,
    location: j.location?.name ?? null,
    atsUrl: j.absolute_url ?? null,
    careerPortalUrl: `https://boards.greenhouse.io/${slug}`,
    description: stripHtml(j.content),
    postedAt: j.updated_at ? new Date(j.updated_at) : null,
  }));
}

async function fetchLever(company: string, slug: string): Promise<NormalizedJob[]> {
  const data = (await fetchJson(`https://api.lever.co/v0/postings/${slug}?mode=json`)) as {
    id: string; text: string; categories?: { location?: string }; hostedUrl?: string; descriptionPlain?: string; createdAt?: number;
  }[];
  return (data ?? []).map((j) => ({
    source: 'lever',
    externalId: `${slug}:${j.id}`,
    title: j.text,
    company,
    location: j.categories?.location ?? null,
    atsUrl: j.hostedUrl ?? null,
    careerPortalUrl: `https://jobs.lever.co/${slug}`,
    description: j.descriptionPlain ? j.descriptionPlain.slice(0, 4000) : null,
    postedAt: j.createdAt ? new Date(j.createdAt) : null,
  }));
}

async function fetchAshby(company: string, slug: string): Promise<NormalizedJob[]> {
  const data = (await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=false`)) as {
    jobs?: { id: string; title: string; location?: string; jobUrl?: string; descriptionPlain?: string; publishedAt?: string }[];
  };
  return (data.jobs ?? []).map((j) => ({
    source: 'ashby',
    externalId: `${slug}:${j.id}`,
    title: j.title,
    company,
    location: j.location ?? null,
    atsUrl: j.jobUrl ?? null,
    careerPortalUrl: `https://jobs.ashbyhq.com/${slug}`,
    description: j.descriptionPlain ? j.descriptionPlain.slice(0, 4000) : null,
    postedAt: j.publishedAt ? new Date(j.publishedAt) : null,
  }));
}

async function fetchCompany(c: TrackedCompany): Promise<NormalizedJob[]> {
  const det = detectProvider(c);
  if (!det) return [];
  try {
    if (det.provider === 'greenhouse') return await fetchGreenhouse(c.name, det.slug);
    if (det.provider === 'lever') return await fetchLever(c.name, det.slug);
    if (det.provider === 'ashby') return await fetchAshby(c.name, det.slug);
  } catch {
    /* unreachable board / rate-limited → skip this company */
  }
  return [];
}

export interface IngestResult {
  companiesScanned: number;
  jobsUpserted: number;
  errors: string[];
}

/**
 * Ingest live jobs from public ATS boards into the Job table.
 * @param limit max number of companies to scan (keeps a single request bounded).
 */
export async function ingestLiveJobs(limit = 25): Promise<IngestResult> {
  const companies = readTrackedCompanies().slice(0, limit);
  const errors: string[] = [];
  let jobsUpserted = 0;

  for (const c of companies) {
    let jobs: NormalizedJob[];
    try {
      jobs = await fetchCompany(c);
    } catch (e) {
      errors.push(`${c.name}: ${(e as Error).message}`);
      continue;
    }
    for (const j of jobs) {
      if (!j.title) continue;
      try {
        await prisma.job.upsert({
          where: { source_externalId: { source: j.source, externalId: j.externalId } },
          create: { ...j, category: categorize(j.title) },
          update: {
            title: j.title, company: j.company, location: j.location, atsUrl: j.atsUrl,
            careerPortalUrl: j.careerPortalUrl, description: j.description, postedAt: j.postedAt,
            category: categorize(j.title),
          },
        });
        jobsUpserted++;
      } catch (e) {
        errors.push(`${c.name}/${j.externalId}: ${(e as Error).message}`);
      }
    }
  }

  return { companiesScanned: companies.length, jobsUpserted, errors: errors.slice(0, 20) };
}

/**
 * PLACEHOLDER for credentialed sources (e.g. LinkedIn, Indeed, internal ATS).
 * Wire in when API keys are provided. Env-gated so it never runs unconfigured.
 */
export async function ingestCredentialedSources(): Promise<IngestResult> {
  // TODO(team): implement using process.env.<PROVIDER>_API_KEY once available.
  return { companiesScanned: 0, jobsUpserted: 0, errors: ['credentialed-sources: not configured'] };
}
