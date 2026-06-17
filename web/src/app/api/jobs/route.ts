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
    const q = searchParams.get('q') ?? '';
    const title = searchParams.get('title') ?? '';
    const company = searchParams.get('company') ?? '';
    const category = searchParams.get('category') ?? '';
    const location = searchParams.get('location') ?? '';
    const workMode = searchParams.get('workMode') ?? '';
    const employmentType = searchParams.get('employmentType') ?? '';
    const experienceLevel = searchParams.get('experienceLevel') ?? '';
    const datePosted = searchParams.get('datePosted') ?? '';
    const skills = searchParams.get('skills') ?? '';

    const sMin = searchParams.get('salaryMin');
    const sMax = searchParams.get('salaryMax');
    const salaryMin = sMin ? parseInt(sMin, 10) : undefined;
    const salaryMax = sMax ? parseInt(sMax, 10) : undefined;

    const jobs = await searchJobs({
      q,
      title,
      company,
      category,
      location,
      workMode,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      datePosted,
      skills,
    });
    const categories = await listCategories();

    // Record the search (best-effort; never blocks the response).
    const user = await getSessionUser();
    if (user) {
      const searchRecord = q.trim() || title.trim() || company.trim() || location.trim() || skills.trim();
      if (searchRecord) {
        let kind = 'title';
        if (company.trim()) kind = 'company';
        else if (location.trim()) kind = 'location';
        else if (skills.trim()) kind = 'skills';
        
        prisma.searchHistory
          .create({ data: { userId: user.userId, query: searchRecord, kind } })
          .catch(() => {});
      }
    }

    return NextResponse.json({ jobs, categories });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
