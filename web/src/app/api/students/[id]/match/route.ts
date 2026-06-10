import { NextResponse } from 'next/server';
import { getStudentProfile, getResumeMeta, computeCompleteness } from '@/lib/studentService';
import { analyzeProfile } from '@/lib/resumeMatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Resume Match Engine endpoint — analysis is computed live from the student's
// SAVED Master Profile + uploaded resume metadata, so it always reflects the
// latest profile edit, resume upload, or re-extraction. No mock data.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await getStudentProfile(id);
    if (!profile) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    const resume = await getResumeMeta(id);
    const match = analyzeProfile(profile, resume, computeCompleteness(profile));
    return NextResponse.json({ id, match });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
