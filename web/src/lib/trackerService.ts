import { prisma } from './prisma';

// Per-user job tracker. Statuses model the application funnel:
// Saved → Applied → Interview → Rejected → Offer.
export const TRACKER_STATUSES = ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'] as const;
export type TrackerStatus = (typeof TRACKER_STATUSES)[number];

export function isTrackerStatus(s: unknown): s is TrackerStatus {
  return typeof s === 'string' && (TRACKER_STATUSES as readonly string[]).includes(s);
}

export async function listTracked(userId: string) {
  return prisma.trackedJob.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export interface SaveTrackedInput {
  jobId?: string | null;
  company: string;
  role: string;
  location?: string | null;
  status?: TrackerStatus;
  notes?: string | null;
}

/**
 * Save/track a job for a user. If a jobId is given and already tracked, the
 * existing row is returned (the unique [userId, jobId] prevents duplicates).
 */
export async function saveTracked(userId: string, input: SaveTrackedInput) {
  if (input.jobId) {
    const existing = await prisma.trackedJob.findUnique({
      where: { userId_jobId: { userId, jobId: input.jobId } },
    });
    if (existing) return existing;
  }
  return prisma.trackedJob.create({
    data: {
      userId,
      jobId: input.jobId ?? null,
      company: input.company,
      role: input.role,
      location: input.location ?? null,
      status: input.status ?? 'Saved',
      notes: input.notes ?? null,
    },
  });
}

export async function updateTracked(
  userId: string,
  id: string,
  patch: { status?: TrackerStatus; notes?: string | null }
) {
  // Scope by userId so a user can only mutate their own rows.
  const result = await prisma.trackedJob.updateMany({
    where: { id, userId },
    data: {
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    },
  });
  return result.count > 0;
}

export async function deleteTracked(userId: string, id: string): Promise<boolean> {
  const result = await prisma.trackedJob.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
