import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';
import {
  StudentProfileInput,
  StudentSummary,
  emptyProfile,
  SkillCategory,
  SKILL_CATEGORIES,
} from '@/types/student';

const studentWithRelations = {
  include: {
    education: true,
    experience: true,
    projects: true,
    certifications: true,
    skills: true,
    softSkills: true,
    achievements: true,
    awards: true,
  },
} satisfies Prisma.StudentDefaultArgs;

type StudentRecord = Prisma.StudentGetPayload<typeof studentWithRelations>;

function num(v: string): number | null {
  if (v === undefined || v === null || `${v}`.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Percentage of the major profile sections that have content (0–100). */
export function computeCompleteness(p: StudentProfileInput): number {
  const checks: boolean[] = [
    !!(p.firstName && p.lastName),
    !!p.email,
    !!p.phone,
    !!(p.address1 || p.city),
    !!(p.linkedinUrl || p.githubUrl),
    !!p.summary,
    p.education.length > 0,
    p.experience.length > 0,
    p.projects.length > 0,
    p.certifications.length > 0,
    p.skills.length > 0,
    p.softSkills.length > 0,
    p.achievements.length > 0,
    p.awards.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/** Build the nested-write child payloads shared by create + update. */
function childCreates(p: StudentProfileInput) {
  return {
    education: { create: p.education.map(({ id: _id, ...e }) => e) },
    experience: { create: p.experience.map(({ id: _id, ...e }) => e) },
    projects: { create: p.projects.map(({ id: _id, ...e }) => e) },
    certifications: { create: p.certifications.map(({ id: _id, ...e }) => e) },
    skills: {
      create: p.skills
        .filter((s) => s.name.trim())
        .map((s) => ({ category: s.category, name: s.name.trim() })),
    },
    softSkills: { create: p.softSkills.filter((s) => s.trim()).map((name) => ({ name: name.trim() })) },
    achievements: { create: p.achievements.filter((t) => t.trim()).map((text) => ({ text: text.trim() })) },
    awards: { create: p.awards.filter((t) => t.trim()).map((text) => ({ text: text.trim() })) },
  };
}

function scalarData(p: StudentProfileInput) {
  return {
    firstName: p.firstName.trim(),
    middleName: p.middleName || null,
    lastName: p.lastName.trim(),
    aadhaarNumber: p.aadhaarNumber || null,
    gender: p.gender || null,
    nationality: p.nationality || null,
    dateOfBirth: p.dateOfBirth || null,
    address1: p.address1 || null,
    address2: p.address2 || null,
    city: p.city || null,
    state: p.state || null,
    district: p.district || null,
    pinCode: p.pinCode || null,
    country: p.country || null,
    email: p.email.trim().toLowerCase(),
    phone: p.phone || null,
    altPhone: p.altPhone || null,
    linkedinUrl: p.linkedinUrl || null,
    githubUrl: p.githubUrl || null,
    summary: p.summary || null,
    yearsExperience: num(p.yearsExperience),
    profileCompleteness: computeCompleteness(p),
  };
}

export async function createStudent(p: StudentProfileInput): Promise<string> {
  const created = await prisma.student.create({
    data: { ...scalarData(p), ...childCreates(p) },
  });
  return created.id;
}

export async function updateStudent(id: string, p: StudentProfileInput): Promise<void> {
  // Replace child collections atomically (simplest correct nested update).
  await prisma.$transaction([
    prisma.education.deleteMany({ where: { studentId: id } }),
    prisma.experience.deleteMany({ where: { studentId: id } }),
    prisma.project.deleteMany({ where: { studentId: id } }),
    prisma.certification.deleteMany({ where: { studentId: id } }),
    prisma.skill.deleteMany({ where: { studentId: id } }),
    prisma.softSkill.deleteMany({ where: { studentId: id } }),
    prisma.achievement.deleteMany({ where: { studentId: id } }),
    prisma.award.deleteMany({ where: { studentId: id } }),
    prisma.student.update({ where: { id }, data: { ...scalarData(p), ...childCreates(p) } }),
  ]);
}

export async function deleteStudent(id: string): Promise<void> {
  await prisma.student.delete({ where: { id } });
}

/* ── Resume metadata + binary (stored in StudentResumeFile) ──────────── */

export async function getResumeMeta(id: string): Promise<import('@/types/student').ResumeMeta | null> {
  const s = await prisma.student.findUnique({
    where: { id },
    select: {
      resumeFileName: true,
      resumeMimeType: true,
      resumeSource: true,
      resumeUploadedAt: true,
      updatedAt: true,
      resumeFile: { select: { id: true } },
    },
  });
  if (!s) return null;
  return {
    fileName: s.resumeFileName,
    mimeType: s.resumeMimeType,
    source: s.resumeSource,
    uploadedAt: s.resumeUploadedAt ? s.resumeUploadedAt.toISOString() : null,
    updatedAt: s.updatedAt.toISOString(),
    hasFile: !!s.resumeFile,
  };
}

export async function storeResume(
  id: string,
  file: { fileName: string; mimeType: string; source: string; data: Buffer }
): Promise<void> {
  // Prisma's Bytes field expects a Uint8Array backed by a plain ArrayBuffer.
  const bytes = new Uint8Array(file.data);
  // Upsert the binary, then stamp metadata on the student (replaces previous).
  await prisma.$transaction([
    prisma.studentResumeFile.upsert({
      where: { studentId: id },
      create: { studentId: id, data: bytes },
      update: { data: bytes },
    }),
    prisma.student.update({
      where: { id },
      data: {
        resumeFileName: file.fileName,
        resumeMimeType: file.mimeType,
        resumeSource: file.source,
        resumeUploadedAt: new Date(),
      },
    }),
  ]);
}

export async function getResumeFile(
  id: string
): Promise<{ fileName: string; mimeType: string; data: Buffer } | null> {
  const s = await prisma.student.findUnique({
    where: { id },
    select: { resumeFileName: true, resumeMimeType: true, resumeFile: { select: { data: true } } },
  });
  if (!s || !s.resumeFile) return null;
  return {
    fileName: s.resumeFileName || 'resume',
    mimeType: s.resumeMimeType || 'application/octet-stream',
    data: Buffer.from(s.resumeFile.data),
  };
}

/* ── Profile picture metadata + binary (stored in StudentAvatarFile) ──── */

export async function getAvatarMeta(id: string): Promise<import('@/types/student').AvatarMeta | null> {
  const s = await prisma.student.findUnique({
    where: { id },
    select: {
      avatarFileName: true,
      avatarMimeType: true,
      avatarUploadedAt: true,
      avatarFile: { select: { id: true } },
    },
  });
  if (!s) return null;
  return {
    fileName: s.avatarFileName,
    mimeType: s.avatarMimeType,
    uploadedAt: s.avatarUploadedAt ? s.avatarUploadedAt.toISOString() : null,
    hasFile: !!s.avatarFile,
  };
}

export async function storeAvatar(
  id: string,
  file: { fileName: string; mimeType: string; data: Buffer }
): Promise<void> {
  const bytes = new Uint8Array(file.data);
  await prisma.$transaction([
    prisma.studentAvatarFile.upsert({
      where: { studentId: id },
      create: { studentId: id, data: bytes },
      update: { data: bytes },
    }),
    prisma.student.update({
      where: { id },
      data: {
        avatarFileName: file.fileName,
        avatarMimeType: file.mimeType,
        avatarUploadedAt: new Date(),
      },
    }),
  ]);
}

export async function getAvatarFile(
  id: string
): Promise<{ fileName: string; mimeType: string; data: Buffer } | null> {
  const s = await prisma.student.findUnique({
    where: { id },
    select: { avatarFileName: true, avatarMimeType: true, avatarFile: { select: { data: true } } },
  });
  if (!s || !s.avatarFile) return null;
  return {
    fileName: s.avatarFileName || 'avatar',
    mimeType: s.avatarMimeType || 'application/octet-stream',
    data: Buffer.from(s.avatarFile.data),
  };
}

export async function removeAvatar(id: string): Promise<void> {
  // Deleting the blob row is enough to clear the picture; also clear metadata.
  await prisma.$transaction([
    prisma.studentAvatarFile.deleteMany({ where: { studentId: id } }),
    prisma.student.update({
      where: { id },
      data: { avatarFileName: null, avatarMimeType: null, avatarUploadedAt: null },
    }),
  ]);
}

export function toProfileInput(s: StudentRecord): StudentProfileInput {
  return {
    firstName: s.firstName,
    middleName: s.middleName ?? '',
    lastName: s.lastName,
    aadhaarNumber: s.aadhaarNumber ?? '',
    gender: s.gender ?? '',
    nationality: s.nationality ?? '',
    dateOfBirth: s.dateOfBirth ?? '',
    address1: s.address1 ?? '',
    address2: s.address2 ?? '',
    city: s.city ?? '',
    state: s.state ?? '',
    district: s.district ?? '',
    pinCode: s.pinCode ?? '',
    country: s.country ?? '',
    email: s.email,
    phone: s.phone ?? '',
    altPhone: s.altPhone ?? '',
    linkedinUrl: s.linkedinUrl ?? '',
    githubUrl: s.githubUrl ?? '',
    summary: s.summary ?? '',
    yearsExperience: s.yearsExperience != null ? String(s.yearsExperience) : '',
    education: s.education.map((e) => ({
      id: e.id, degree: e.degree ?? '', fieldOfStudy: e.fieldOfStudy ?? '', institution: e.institution ?? '',
      location: e.location ?? '', dateOfPassing: e.dateOfPassing ?? '', cgpa: e.cgpa ?? '',
      percentage: e.percentage ?? '', achievements: e.achievements ?? '',
    })),
    experience: s.experience.map((e) => ({
      id: e.id, jobTitle: e.jobTitle ?? '', companyName: e.companyName ?? '', location: e.location ?? '',
      employmentType: e.employmentType ?? '', startDate: e.startDate ?? '', endDate: e.endDate ?? '',
      responsibilities: e.responsibilities ?? '', achievements: e.achievements ?? '', technologies: e.technologies ?? '',
    })),
    projects: s.projects.map((pr) => ({
      id: pr.id, title: pr.title ?? '', description: pr.description ?? '', technologies: pr.technologies ?? '',
    })),
    certifications: s.certifications.map((c) => ({
      id: c.id, title: c.title ?? '', number: c.number ?? '', description: c.description ?? '',
    })),
    skills: s.skills.map((sk) => ({
      category: (SKILL_CATEGORIES as readonly string[]).includes(sk.category) ? (sk.category as SkillCategory) : 'other',
      name: sk.name,
    })),
    softSkills: s.softSkills.map((x) => x.name),
    achievements: s.achievements.map((x) => x.text),
    awards: s.awards.map((x) => x.text),
  };
}

export async function getStudentProfile(id: string): Promise<StudentProfileInput | null> {
  const s = await prisma.student.findUnique({ where: { id }, ...studentWithRelations });
  return s ? toProfileInput(s) : null;
}

export async function listStudents(opts: { search?: string; completeness?: string }): Promise<StudentSummary[]> {
  const search = (opts.search ?? '').trim();
  const where: Prisma.StudentWhereInput = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { skills: { some: { name: { contains: search } } } },
    ];
  }
  if (opts.completeness === 'complete') where.profileCompleteness = { gte: 80 };
  else if (opts.completeness === 'partial') where.profileCompleteness = { gte: 40, lt: 80 };
  else if (opts.completeness === 'incomplete') where.profileCompleteness = { lt: 40 };

  const rows = await prisma.student.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { education: true, skills: true },
  });

  return rows.map((s) => {
    const topEdu = s.education[0];
    return {
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      profileCompleteness: s.profileCompleteness,
      topDegree: topEdu?.degree ?? null,
      topInstitution: topEdu?.institution ?? null,
      skillCount: s.skills.length,
      updatedAt: s.updatedAt.toISOString(),
    };
  });
}

export { emptyProfile };
