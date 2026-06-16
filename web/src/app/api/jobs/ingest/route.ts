import { NextResponse } from 'next/server';
import { ingestLiveJobs } from '@/lib/jobIngest';
import { getSessionUser } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST /api/jobs/ingest — pull live jobs from public ATS boards into the Job DB.
// Requires a logged-in user (any authenticated student can refresh the board).
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    let limit = 25;
    try {
      const body = await request.json();
      if (typeof body?.limit === 'number') limit = Math.max(1, Math.min(body.limit, 60));
    } catch {
      /* no body → default limit */
    }
    const result = await ingestLiveJobs(limit);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
