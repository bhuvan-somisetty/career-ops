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

// ── Central Job DB sample seed ───────────────────────────────────────
// Always-available sample postings so the portal works with zero network.
// Live ingestion (POST /api/jobs/ingest) adds real ATS jobs alongside these.
function categorize(title) {
  const t = ` ${title.toLowerCase()} `;
  const rules = [
    ['Data & Analytics', ['data analyst', 'data scientist', 'data engineer', 'analytics', 'business intelligence']],
    ['Machine Learning & AI', ['machine learning', ' ml ', ' ai ', 'llm', 'nlp', 'computer vision', 'deep learning']],
    ['Software Engineering', ['software engineer', 'developer', 'sde', 'backend', 'frontend', 'full stack', 'full-stack', 'platform engineer']],
    ['DevOps & Cloud', ['devops', 'sre', 'site reliability', 'cloud', 'infrastructure', 'kubernetes']],
    ['Product & Design', ['product manager', 'product designer', 'ux', ' ui ', 'designer']],
    ['QA & Testing', ['qa ', 'quality assurance', 'test engineer', 'sdet']],
    ['Security', ['security', 'infosec', 'appsec']],
    ['Mobile', ['android', 'ios', 'mobile', 'react native', 'flutter']],
  ];
  for (const [cat, kws] of rules) if (kws.some((k) => t.includes(k))) return cat;
  return 'Other';
}

const companyPortals = {
  Google: 'https://careers.google.com',
  Microsoft: 'https://careers.microsoft.com',
  Amazon: 'https://amazon.jobs',
  TCS: 'https://www.tcs.com/careers',
  Infosys: 'https://www.infosys.com/careers',
  Wipro: 'https://careers.wipro.com',
  Flipkart: 'https://www.flipkartcareers.com',
  Razorpay: 'https://razorpay.com/jobs',
  Zoho: 'https://www.zoho.com/careers',
  Swiggy: 'https://careers.swiggy.com',
};

const sampleJobs = [
  ['Software Engineer', 'Google', 'Bangalore, India'],
  ['Senior Software Engineer', 'Google', 'Hyderabad, India'],
  ['AI Engineer', 'Google', 'Bangalore, India'],
  ['Data Analyst', 'Google', 'Gurugram, India'],
  ['Software Engineer', 'Microsoft', 'Hyderabad, India'],
  ['Machine Learning Engineer', 'Microsoft', 'Bangalore, India'],
  ['Cloud Solutions Architect', 'Microsoft', 'Noida, India'],
  ['Data Scientist', 'Microsoft', 'Hyderabad, India'],
  ['Software Development Engineer', 'Amazon', 'Bangalore, India'],
  ['SDE II', 'Amazon', 'Chennai, India'],
  ['Data Engineer', 'Amazon', 'Hyderabad, India'],
  ['DevOps Engineer', 'Amazon', 'Bangalore, India'],
  ['Software Engineer', 'TCS', 'Mumbai, India'],
  ['Systems Engineer', 'TCS', 'Pune, India'],
  ['Data Analyst', 'TCS', 'Chennai, India'],
  ['Cloud Engineer', 'TCS', 'Bangalore, India'],
  ['AI/ML Engineer', 'Infosys', 'Bangalore, India'],
  ['Full Stack Developer', 'Infosys', 'Pune, India'],
  ['QA Test Engineer', 'Infosys', 'Mysore, India'],
  ['Frontend Engineer', 'Wipro', 'Bangalore, India'],
  ['Backend Engineer', 'Wipro', 'Hyderabad, India'],
  ['Data Scientist', 'Flipkart', 'Bangalore, India'],
  ['Software Engineer II', 'Flipkart', 'Bangalore, India'],
  ['Product Manager', 'Flipkart', 'Bangalore, India'],
  ['Backend Engineer', 'Razorpay', 'Bangalore, India'],
  ['Machine Learning Engineer', 'Razorpay', 'Bangalore, India'],
  ['Full Stack Engineer', 'Zoho', 'Chennai, India'],
  ['Android Developer', 'Swiggy', 'Bangalore, India'],
  ['Data Analyst', 'Swiggy', 'Bangalore, India'],
  ['Site Reliability Engineer', 'Swiggy', 'Bangalore, India'],
  ['Security Engineer', 'Razorpay', 'Bangalore, India'],
  ['UX Designer', 'Flipkart', 'Bangalore, India'],
];

let jobCount = 0;
for (let i = 0; i < sampleJobs.length; i++) {
  const [title, company, location] = sampleJobs[i];
  const externalId = `${company.toLowerCase()}-${String(i + 1).padStart(3, '0')}`;
  const portal = companyPortals[company] || null;
  const description = `${title} position at ${company}, based in ${location}. Example listing seeded for local development; refresh with live ATS feeds from the Job Discovery page.`;
  
  const category = categorize(title);
  const workModes = ['Remote', 'Hybrid', 'On-Site', 'Work From Home'];
  const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];
  const experienceLevels = ['Fresher', 'Entry Level', 'Mid Level', 'Senior Level'];
  const workMode = workModes[i % workModes.length];
  const employmentType = employmentTypes[i % employmentTypes.length];
  const experienceLevel = title.toLowerCase().includes('senior') ? 'Senior Level' : experienceLevels[i % experienceLevels.length];
  const salaryMin = 50000 + (i * 3000) % 70000;
  const salaryMax = salaryMin + 20000 + (i * 5000) % 80000;
  
  let skills = '';
  if (category === 'Data & Analytics') skills = 'Python, SQL, Tableau, PowerBI';
  else if (category === 'Machine Learning & AI') skills = 'Python, PyTorch, LLMs, TensorFlow';
  else if (category === 'Software Engineering') skills = 'TypeScript, React, Next.js, Node.js';
  else if (category === 'DevOps & Cloud') skills = 'AWS, Docker, Kubernetes, Terraform';
  else if (category === 'Product & Design') skills = 'Figma, Product Strategy, Agile';
  else if (category === 'QA & Testing') skills = 'Selenium, Cypress, QA, Jest';
  else if (category === 'Security') skills = 'Penetration Testing, OWASP, Network Security';
  else if (category === 'Mobile') skills = 'React Native, Flutter, Swift, Kotlin';
  else skills = 'Excel, Communication';

  await prisma.job.upsert({
    where: { source_externalId: { source: 'seed', externalId } },
    update: {
      title,
      company,
      location,
      category,
      description,
      careerPortalUrl: companyPortals[company] || null,
      atsUrl: companyPortals[company] || null,
      workMode,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
    },
    create: {
      source: 'seed',
      externalId,
      title,
      company,
      location,
      category,
      careerPortalUrl: portal,
      atsUrl: portal,
      description,
      postedAt: new Date(),
      workMode,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
    },
  });
  jobCount++;
}

console.log('Seeded', jobCount, 'sample jobs.');
await prisma.$disconnect();
