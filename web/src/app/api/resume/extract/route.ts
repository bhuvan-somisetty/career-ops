import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ParsedProfile } from '@/types/student';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTRACTION_PROMPT = `You are a precise resume parser. Extract the candidate's details from the
attached resume and return ONLY a JSON object (no markdown, no commentary) with this exact shape:

{
  "firstName": string, "middleName": string, "lastName": string,
  "email": string, "phone": string, "linkedinUrl": string, "githubUrl": string,
  "summary": string, "yearsExperience": string,
  "education": [{ "degree": string, "fieldOfStudy": string, "institution": string, "location": string, "dateOfPassing": string, "cgpa": string, "percentage": string, "achievements": string }],
  "experience": [{ "jobTitle": string, "companyName": string, "location": string, "employmentType": string, "startDate": string, "endDate": string, "responsibilities": string, "achievements": string, "technologies": string }],
  "projects": [{ "title": string, "description": string, "technologies": string }],
  "certifications": [{ "title": string, "number": string, "description": string }],
  "skills": [{ "category": "language"|"framework"|"database"|"cloud"|"tool"|"other", "name": string }],
  "softSkills": [string],
  "achievements": [string],
  "awards": [string]
}

Rules: Use "" for unknown string fields and [] for unknown lists. Classify each technical
skill into exactly one category. Keep responsibilities/achievements as readable sentences.`;

// Deterministic offline fallback so the upload→populate flow always works
// without a network key. Every field remains editable by the admin afterwards.
function mockParsed(fileName: string): ParsedProfile {
  return {
    firstName: 'Jane',
    middleName: '',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+91 98765 43210',
    linkedinUrl: 'https://linkedin.com/in/janesmith',
    githubUrl: 'https://github.com/janesmith',
    summary:
      'AI platform engineer with a focus on LLMOps, inference optimization, and developer tooling. Extracted from ' +
      fileName +
      '.',
    yearsExperience: '3',
    education: [
      {
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science & Engineering',
        institution: 'Indian Institute of Technology, Bangalore',
        location: 'Bangalore, India',
        dateOfPassing: '2026',
        cgpa: '9.2',
        percentage: '',
        achievements: 'Dean’s list (2024, 2025)',
      },
    ],
    experience: [
      {
        jobTitle: 'ML Platform Intern',
        companyName: 'Acme AI',
        location: 'Remote',
        employmentType: 'Internship',
        startDate: '2025-05',
        endDate: '2025-08',
        responsibilities: 'Built inference caching layer and CI for model evaluation.',
        achievements: 'Reduced inference API latency by 40% with Redis semantic caching.',
        technologies: 'Python, FastAPI, Redis',
      },
    ],
    projects: [
      {
        title: 'Project Alpha — LLM Optimization Caching',
        description: 'Semantic key caching that reduced inference latency by 40%.',
        technologies: 'Python, Redis, FastAPI',
      },
    ],
    certifications: [
      { title: 'AWS Certified Cloud Practitioner', number: 'AWS-CCP-2025', description: '' },
    ],
    skills: [
      { category: 'language', name: 'Python' },
      { category: 'language', name: 'Go' },
      { category: 'framework', name: 'Next.js' },
      { category: 'framework', name: 'PyTorch' },
      { category: 'database', name: 'Redis' },
      { category: 'cloud', name: 'AWS' },
      { category: 'tool', name: 'Docker' },
      { category: 'tool', name: 'Kubernetes' },
    ],
    softSkills: ['Communication', 'Ownership', 'Problem solving'],
    achievements: ['Winner, National Hackathon 2025'],
    awards: ['Best Student Project Award 2025'],
  };
}

function stripJsonFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  return start >= 0 && end > start ? body.slice(start, end + 1) : body;
}

async function geminiExtract(file: File): Promise<ParsedProfile> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('no-key');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

  const mime = file.type || 'application/octet-stream';
  let result;
  if (mime === 'application/pdf' || mime.startsWith('image/')) {
    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    result = await model.generateContent([
      { text: EXTRACTION_PROMPT },
      { inlineData: { mimeType: mime, data: base64 } },
    ]);
  } else {
    // Plain text / unknown — send decoded text content.
    const text = Buffer.from(await file.arrayBuffer()).toString('utf8').slice(0, 60000);
    result = await model.generateContent([{ text: EXTRACTION_PROMPT }, { text: '\n\nRESUME:\n' + text }]);
  }

  const raw = result.response.text();
  return JSON.parse(stripJsonFences(raw)) as ParsedProfile;
}

export async function POST(request: Request) {
  let fileName = 'resume';
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No resume file uploaded.' }, { status: 400 });
    }
    fileName = file.name || fileName;

    try {
      const parsed = await geminiExtract(file);
      return NextResponse.json({ parsed, source: 'gemini', fileName });
    } catch (err) {
      const reason = (err as Error).message === 'no-key' ? 'no-api-key' : 'extraction-failed';
      // Graceful fallback keeps the review/edit flow usable offline.
      return NextResponse.json({ parsed: mockParsed(fileName), source: 'mock', reason, fileName });
    }
  } catch {
    return NextResponse.json({ parsed: mockParsed(fileName), source: 'mock', reason: 'bad-request', fileName }, { status: 200 });
  }
}
