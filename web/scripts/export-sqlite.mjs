// Phase 3 — Step 1: capture ALL current data (SQLite) to a portable JSON dump,
// including resume/avatar binaries (base64) and the studentId counter, so it can
// be re-imported into PostgreSQL with ids + codes + files preserved.
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

const students = await prisma.student.findMany({
  include: { education: true, experience: true, projects: true, certifications: true,
    skills: true, softSkills: true, achievements: true, awards: true,
    resumeFile: true, avatarFile: true },
  orderBy: { createdAt: 'asc' },
});
const counters = await prisma.counter.findMany();

const dump = { exportedAt: new Date().toISOString(), counters, students: students.map((s) => ({
  ...s,
  resumeFile: s.resumeFile ? { ...s.resumeFile, data: Buffer.from(s.resumeFile.data).toString('base64') } : null,
  avatarFile: s.avatarFile ? { ...s.avatarFile, data: Buffer.from(s.avatarFile.data).toString('base64') } : null,
})) };

fs.writeFileSync('prisma/data-dump.json', JSON.stringify(dump, null, 2));
console.log(`Exported ${students.length} students, ${counters.length} counters → prisma/data-dump.json`);
students.forEach((s) => console.log(`  ${s.studentId} | ${s.firstName} ${s.lastName} | resume:${!!s.resumeFile} avatar:${!!s.avatarFile}`));
await prisma.$disconnect();
