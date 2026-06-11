import { NextResponse } from 'next/server';
import { createStudent, listStudents } from '@/lib/studentService';
import type { StudentProfileInput } from '@/types/student';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const students = await listStudents({
      search: searchParams.get('search') ?? '',
      completeness: searchParams.get('completeness') ?? '',
    });
    return NextResponse.json({ students });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StudentProfileInput;
    if (!body.firstName?.trim() || !body.lastName?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: 'First name, last name and email are required.' },
        { status: 400 }
      );
    }
    const { id, studentId } = await createStudent(body);
    return NextResponse.json({ id, studentId }, { status: 201 });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'A student with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: e.message || 'Failed to create student.' }, { status: 500 });
  }
}
