import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';
import { createStudent } from '@/lib/studentService';
import { emptyProfile } from '@/types/student';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Create an account + its empty linked Student master profile, then sign in.
export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !password || String(password).length < 6) {
      return NextResponse.json(
        { error: 'A valid email and a password of at least 6 characters are required.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { email: cleanEmail },
      select: { id: true, userId: true },
    });
    if (existingStudent && existingStudent.userId) {
      return NextResponse.json({ error: 'A student profile with this email already exists.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { email: cleanEmail, passwordHash: hashPassword(String(password)) },
      select: { id: true, email: true },
    });

    let studentId: string;
    try {
      if (existingStudent && !existingStudent.userId) {
        await prisma.student.update({ where: { id: existingStudent.id }, data: { userId: user.id } });
        studentId = existingStudent.id;
      } else {
        const result = await createStudent({
          ...emptyProfile(),
          firstName: String(firstName || '').trim() || 'New',
          lastName: String(lastName || '').trim() || 'Student',
          email: cleanEmail,
          userId: user.id,
        });
        studentId = result.id;
      }
    } catch (studentErr: unknown) {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      const code = (studentErr as { code?: string })?.code;
      if (code === 'P2002') {
        return NextResponse.json({ error: 'A student profile with this email already exists.' }, { status: 409 });
      }
      throw studentErr;
    }

    const res = NextResponse.json({ userId: user.id, email: user.email, studentId }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, signSession(user.id), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Signup failed.' }, { status: 500 });
  }
}
