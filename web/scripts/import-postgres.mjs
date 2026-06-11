// Phase 3 — Step 3: import the JSON dump into the CURRENT datasource (point
// DATABASE_URL at PostgreSQL and run after `prisma migrate deploy`). Preserves
// record ids, studentId codes, all relations, resume/avatar binaries, counters.
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();
const dump = JSON.parse(fs.readFileSync('prisma/data-dump.json', 'utf8'));

for (const c of dump.counters) {
  await prisma.counter.upsert({ where: { id: c.id }, create: c, update: { value: c.value } });
}

for (const s of dump.students) {
  const { education, experience, projects, certifications, skills, softSkills, achievements, awards, resumeFile, avatarFile, ...scalar } = s;
  await prisma.student.upsert({
    where: { id: s.id },
    update: {},
    create: {
      ...scalar,
      education: { create: education.map(({ id, studentId, ...e }) => e) },
      experience: { create: experience.map(({ id, studentId, ...e }) => e) },
      projects: { create: projects.map(({ id, studentId, ...e }) => e) },
      certifications: { create: certifications.map(({ id, studentId, ...e }) => e) },
      skills: { create: skills.map(({ id, studentId, ...e }) => e) },
      softSkills: { create: softSkills.map(({ id, studentId, ...e }) => e) },
      achievements: { create: achievements.map(({ id, studentId, ...e }) => e) },
      awards: { create: awards.map(({ id, studentId, ...e }) => e) },
      resumeFile: resumeFile ? { create: { id: resumeFile.id, data: Buffer.from(resumeFile.data, 'base64'),
        createdAt: resumeFile.createdAt, updatedAt: resumeFile.updatedAt } } : undefined,
      avatarFile: avatarFile ? { create: { id: avatarFile.id, data: Buffer.from(avatarFile.data, 'base64'),
        createdAt: avatarFile.createdAt, updatedAt: avatarFile.updatedAt } } : undefined,
    },
  });
  console.log(`imported ${s.studentId} | ${s.firstName} ${s.lastName}`);
}
console.log('Import complete.');
await prisma.$disconnect();
