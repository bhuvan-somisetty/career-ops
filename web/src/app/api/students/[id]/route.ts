import { NextResponse } from 'next/server';
import { getStudentProfile, updateStudent, deleteStudent, getResumeMeta, getAvatarMeta, getStudentCode, toProfileJson, emailConflictsWithOther } from '@/lib/studentService';
import type { StudentProfileInput } from '@/types/student';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await getStudentProfile(id);
    if (!profile) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    const resume = await getResumeMeta(id);
    const avatar = await getAvatarMeta(id);
    const studentId = await getStudentCode(id);
    // profileJson: the { skills, education, experience, projects, certifications, … }
    // snapshot, surfaced explicitly alongside the flat profile for JSON consumers.
    return NextResponse.json({ id, studentId, profile, profileJson: toProfileJson(profile), resume, avatar });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as StudentProfileInput;
    if (!body.firstName?.trim() || !body.lastName?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: 'First name, last name and email are required.' },
        { status: 400 }
      );
    }
    // Only reject if a DIFFERENT student owns this email — never block a user
    // from saving their own profile with their existing email.
    const email = body.email.trim().toLowerCase();
    if (await emailConflictsWithOther(id, email)) {
      return NextResponse.json(
        { error: 'Another account is already using this email.' },
        { status: 409 }
      );
    }
    await updateStudent(id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || 'Failed to update student.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteStudent(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || 'Failed to delete student.' }, { status: 500 });
  }
}
