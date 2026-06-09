import { NextResponse } from 'next/server';
import { getStudentProfile, updateStudent, deleteStudent } from '@/lib/studentService';
import type { StudentProfileInput } from '@/types/student';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await getStudentProfile(id);
    if (!profile) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    return NextResponse.json({ id, profile });
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
    await updateStudent(id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'A student with this email already exists.' }, { status: 409 });
    }
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
