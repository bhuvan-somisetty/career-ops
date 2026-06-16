import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { updateTracked, deleteTracked, isTrackerStatus } from '@/lib/trackerService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH /api/tracker/[id] — move status / edit notes (scoped to the owner).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.status !== undefined && !isTrackerStatus(body.status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    const ok = await updateTracked(user.userId, id, { status: body.status, notes: body.notes });
    if (!ok) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/tracker/[id] — remove a tracked job (scoped to the owner).
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id } = await params;
  const ok = await deleteTracked(user.userId, id);
  if (!ok) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
