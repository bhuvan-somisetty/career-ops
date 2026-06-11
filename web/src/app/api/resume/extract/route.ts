import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ParsedProfile } from '@/types/student';
import { localExtract } from '@/lib/resumeParse';

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
      // No LLM key (or LLM failed): parse the ACTUAL uploaded file locally.
      // This reads the real resume text — it never fabricates sample data.
      const { parsed, chars } = await localExtract(file);
      return NextResponse.json({ parsed, source: 'parsed', reason, fileName, chars });
    }
  } catch {
    // Could not even read the upload — return an empty profile (NOT mock data)
    // so the student can fill the form manually. Every field stays editable.
    return NextResponse.json({ parsed: emptyParsed(), source: 'parsed', reason: 'unreadable', fileName }, { status: 200 });
  }
}

function emptyParsed(): ParsedProfile {
  return {
    firstName: '', middleName: '', lastName: '', email: '', phone: '',
    linkedinUrl: '', githubUrl: '', summary: '', yearsExperience: '',
    education: [], experience: [], projects: [], certifications: [],
    skills: [], softSkills: [], achievements: [], awards: [],
  };
}
