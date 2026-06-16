import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { SESSION_COOKIE, verifySession } from './auth';

export interface SessionUser {
  userId: string;
  email: string;
  studentId: string | null; // the owning Student.id (master profile), if created
}

/**
 * Resolve the logged-in user from the session cookie. Returns null when there
 * is no valid session. Used by every per-user API route to scope data to the
 * caller's userId. (Next 16: cookies() is async.)
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const userId = verifySession(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, student: { select: { id: true } } },
  });
  if (!user) return null;
  return { userId: user.id, email: user.email, studentId: user.student?.id ?? null };
}

/** Convenience: throw-style guard for route handlers. */
export async function requireSessionUser(): Promise<SessionUser | null> {
  return getSessionUser();
}
