import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ParsedProfile } from '@/types/student';
import { localExtract } from './resumeParse';

// ─────────────────────────────────────────────────────────────────────────
// Swappable resume-extraction adapter.
//
// One contract: `extractResume(file) → ParsedProfile`. Three backends, chosen
// by RESUME_EXTRACT_PROVIDER (default: auto):
//
//   • "team-api"  → POST the file to RESUME_EXTRACT_API_URL (the API the team
//                   will provide later). Drop-in: implement the URL + auth and
//                   it must return JSON in the ParsedProfile shape.
//   • "gemini"    → Google Generative AI (existing behavior).
//   • "local"     → offline parse of the real upload via unpdf (no LLM).
//   • "auto"      → team-api if configured, else gemini if a key exists, else
//                   local. Each tier falls back to the next on failure.
//
// The caller (the /api/resume/extract route) never changes when the backend
// swaps — only env vars do.
// ─────────────────────────────────────────────────────────────────────────

export type ExtractSource = 'team-api' | 'gemini' | 'parsed';

export interface ExtractResult {
  parsed: ParsedProfile;
  source: ExtractSource;
  reason?: string;
  chars?: number;
}

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

// ── Backend: team-provided API (placeholder until credentials land) ──────
async function teamApiExtract(file: File): Promise<ParsedProfile> {
  const url = process.env.RESUME_EXTRACT_API_URL;
  if (!url) throw new Error('no-team-api');
  const form = new FormData();
  form.append('file', file, file.name);
  const headers: Record<string, string> = {};
  if (process.env.RESUME_EXTRACT_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.RESUME_EXTRACT_API_KEY}`;
  }
  const res = await fetch(url, { method: 'POST', body: form, headers });
  if (!res.ok) throw new Error(`team-api-${res.status}`);
  const data = await res.json();
  // Accept either { parsed: {...} } or the bare ParsedProfile object.
  return (data.parsed ?? data) as ParsedProfile;
}

// ── Backend: Gemini ──────────────────────────────────────────────────────
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
    const text = Buffer.from(await file.arrayBuffer()).toString('utf8').slice(0, 60000);
    result = await model.generateContent([{ text: EXTRACTION_PROMPT }, { text: '\n\nRESUME:\n' + text }]);
  }
  return JSON.parse(stripJsonFences(result.response.text())) as ParsedProfile;
}

/**
 * Resolve the configured backend and run it, falling back through the chain so
 * the upload is ALWAYS parsed from the real file — never fabricated sample data.
 */
export async function extractResume(file: File): Promise<ExtractResult> {
  const provider = (process.env.RESUME_EXTRACT_PROVIDER || 'auto').toLowerCase();

  // Explicit team-api selection.
  if (provider === 'team-api') {
    try {
      return { parsed: await teamApiExtract(file), source: 'team-api' };
    } catch {
      const { parsed, chars } = await localExtract(file);
      return { parsed, source: 'parsed', reason: 'team-api-failed', chars };
    }
  }

  // Explicit local selection.
  if (provider === 'local') {
    const { parsed, chars } = await localExtract(file);
    return { parsed, source: 'parsed', reason: 'forced-local', chars };
  }

  // auto / gemini: team-api (if configured) → gemini → local.
  if (provider === 'auto' && process.env.RESUME_EXTRACT_API_URL) {
    try {
      return { parsed: await teamApiExtract(file), source: 'team-api' };
    } catch {
      /* fall through */
    }
  }

  try {
    return { parsed: await geminiExtract(file), source: 'gemini' };
  } catch (err) {
    const reason = (err as Error).message === 'no-key' ? 'no-api-key' : 'extraction-failed';
    const { parsed, chars } = await localExtract(file);
    return { parsed, source: 'parsed', reason, chars };
  }
}
