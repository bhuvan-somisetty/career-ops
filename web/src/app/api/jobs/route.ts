import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchJobs, listCategories } from '@/lib/jobService';
import { getSessionUser } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/jobs?title=...&company=...&category=...
//   • title   → matches across ALL companies
//   • company → all jobs for that company
//   • category→ bucket filter
// Logs a SearchHistory row for the session user (recommendation signal).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') ?? '';
    const company = searchParams.get('company') ?? '';
    const category = searchParams.get('category') ?? '';

    const jobs = await searchJobs({ title, company, category });
    const categories = await listCategories();

    // Record the search (best-effort; never blocks the response).
    const user = await getSessionUser();
    if (user) {
      const q = title.trim() || company.trim();
      if (q) {
        prisma.searchHistory
          .create({ data: { userId: user.userId, query: q, kind: title.trim() ? 'title' : 'company' } })
          .catch(() => {});
      }
    }

    return NextResponse.json({ jobs, categories });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
