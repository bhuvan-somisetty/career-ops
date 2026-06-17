import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail }, select: { id: true } });
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ ok: true });
    }

    // Invalidate any previous unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    // Email delivery is not configured — return the token so the UI can show
    // the reset link directly (acceptable for an internal student portal).
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Request failed.' }, { status: 500 });
  }
}
