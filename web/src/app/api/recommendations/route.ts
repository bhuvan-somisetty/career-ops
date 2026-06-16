import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { recommendJobs } from '@/lib/recommend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/recommendations — ranked jobs for the session user based on their
// resume skills, search history, and saved/viewed jobs.
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, Math.min(Number(searchParams.get('limit')) || 12, 50));
  const recommendations = await recommendJobs(user.userId, limit);
  return NextResponse.json({ recommendations });
}
