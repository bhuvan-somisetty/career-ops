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

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { email: cleanEmail, passwordHash: hashPassword(String(password)) },
      select: { id: true, email: true },
    });

    // Provision the linked Student profile so the rest of the app (profile,
    // resume, match) has a record to read/write immediately.
    const { id: studentId } = await createStudent({
      ...emptyProfile(),
      firstName: String(firstName || '').trim() || 'New',
      lastName: String(lastName || '').trim() || 'Student',
      email: cleanEmail,
      userId: user.id,
    });

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
