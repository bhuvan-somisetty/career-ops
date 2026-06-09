// Seed a couple of fully-populated students for the admin console demo.
// Run with: npm run db:seed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const students = [
  {
    firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com',
    phone: '+91 98765 43210', city: 'Bangalore', state: 'Karnataka', country: 'India',
    linkedinUrl: 'https://linkedin.com/in/janesmith', githubUrl: 'https://github.com/janesmith',
    summary: 'AI platform engineer focused on LLMOps and inference optimization.',
    yearsExperience: 3, profileCompleteness: 92,
    education: { create: [{ degree: 'B.Tech', fieldOfStudy: 'Computer Science', institution: 'IIT Bangalore', location: 'Bangalore', dateOfPassing: '2026', cgpa: '9.2' }] },
    experience: { create: [{ jobTitle: 'ML Platform Intern', companyName: 'Acme AI', location: 'Remote', employmentType: 'Internship', startDate: '2025-05', endDate: '2025-08', responsibilities: 'Built inference caching layer.', technologies: 'Python, Redis' }] },
    projects: { create: [{ title: 'Project Alpha', description: 'LLM optimization caching.', technologies: 'Python, Redis, FastAPI' }] },
    certifications: { create: [{ title: 'AWS Cloud Practitioner', number: 'AWS-CCP-2025' }] },
    skills: { create: [
      { category: 'language', name: 'Python' }, { category: 'language', name: 'Go' },
      { category: 'framework', name: 'PyTorch' }, { category: 'cloud', name: 'AWS' },
      { category: 'tool', name: 'Docker' },
    ] },
    softSkills: { create: [{ name: 'Ownership' }, { name: 'Communication' }] },
    achievements: { create: [{ text: 'Winner, National Hackathon 2025' }] },
    awards: { create: [{ text: 'Best Student Project 2025' }] },
  },
  {
    firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.sharma@example.com',
    phone: '+91 99887 76655', city: 'Pune', state: 'Maharashtra', country: 'India',
    summary: 'Full-stack engineer with a Next.js / Node focus.',
    yearsExperience: 1, profileCompleteness: 64,
    education: { create: [{ degree: 'B.Tech', fieldOfStudy: 'Information Technology', institution: 'COEP Pune', dateOfPassing: '2026', cgpa: '8.8' }] },
    skills: { create: [
      { category: 'framework', name: 'Next.js' }, { category: 'framework', name: 'React' },
      { category: 'language', name: 'TypeScript' }, { category: 'database', name: 'PostgreSQL' },
    ] },
    softSkills: { create: [{ name: 'Teamwork' }] },
  },
];

for (const s of students) {
  await prisma.student.upsert({
    where: { email: s.email },
    update: {},
    create: s,
  });
}

console.log('Seeded', students.length, 'students.');
await prisma.$disconnect();
