import { NextResponse } from 'next/server';
import { getJob, recordView } from '@/lib/jobService';
import { getSessionUser } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/jobs/[id] — fetch one job and record a view for the session user.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await getJob(id);
    if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });

    const user = await getSessionUser();
    if (user) recordView(user.userId, id).catch(() => {});

    return NextResponse.json({ job });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
