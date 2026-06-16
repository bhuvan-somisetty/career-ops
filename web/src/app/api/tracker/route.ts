import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { listTracked, saveTracked, isTrackerStatus } from '@/lib/trackerService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/tracker — the session user's tracked jobs.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const tracked = await listTracked(user.userId);
  return NextResponse.json({ tracked });
}

// POST /api/tracker — save/track a job (default status: Saved).
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const body = await request.json();
    if (!body?.company || !body?.role) {
      return NextResponse.json({ error: 'company and role are required.' }, { status: 400 });
    }
    const status = isTrackerStatus(body.status) ? body.status : 'Saved';
    const row = await saveTracked(user.userId, {
      jobId: body.jobId ?? null,
      company: String(body.company),
      role: String(body.role),
      location: body.location ?? null,
      status,
      notes: body.notes ?? null,
    });
    return NextResponse.json({ tracked: row }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
