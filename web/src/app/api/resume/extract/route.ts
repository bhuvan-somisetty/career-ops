import { NextResponse } from 'next/server';
import type { ParsedProfile } from '@/types/student';
import { extractResume } from '@/lib/resumeExtractor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Thin route: delegates to the swappable resume-extraction adapter
// (src/lib/resumeExtractor.ts). The backend (team-api | gemini | local) is
// chosen by env; the response shape stays { parsed, source, fileName, ... }.
export async function POST(request: Request) {
  let fileName = 'resume';
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No resume file uploaded.' }, { status: 400 });
    }
    fileName = file.name || fileName;

    const { parsed, source, reason, chars } = await extractResume(file);
    return NextResponse.json({ parsed, source, reason, chars, fileName });
  } catch {
    // Could not even read the upload — return an empty (NOT mock) profile so the
    // student can fill the form manually. Every field stays editable.
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
