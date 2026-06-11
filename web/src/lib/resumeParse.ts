// Dependency-free resume text extraction + heuristic field parsing.
// Used as the REAL extractor when no Gemini key is configured. It reads the
// actual uploaded file (PDF / DOCX / TXT) and pulls out whatever it can — name,
// contact, links, skills, summary and section blocks. It NEVER fabricates data;
// unknown fields are left empty for the student to fill (all stay editable).

import zlib from 'zlib';
import type { ParsedProfile, SkillCategory } from '@/types/student';

/* ───────────────────────── text extraction ───────────────────────── */

function inflateMaybe(buf: Buffer): Buffer {
  for (const fn of [zlib.inflateSync, zlib.inflateRawSync] as const) {
    try { return fn(buf); } catch { /* try next */ }
  }
  return buf;
}

// Pull readable text out of a PDF content stream (literal-string operands).
function pdfStreamToText(content: string): string {
  let out = '';
  const re = /\((?:\\.|[^\\()])*\)|T\*|\bTd\b|\bTD\b|'|"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const tok = m[0];
    if (tok.startsWith('(')) {
      const body = tok.slice(1, -1)
        .replace(/\\([nrt])/g, (_s, c) => (c === 'n' ? '\n' : c === 'r' ? '' : '\t'))
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\(\d{1,3})/g, (_s, o) => String.fromCharCode(parseInt(o, 8)));
      out += body;
    } else {
      out += '\n'; // text-positioning operator → line break
    }
  }
  return out;
}

function extractPdf(buf: Buffer): string {
  let text = '';
  let idx = 0;
  while (true) {
    const sIdx = buf.indexOf('stream', idx);
    if (sIdx === -1) break;
    let dataStart = sIdx + 6;
    if (buf[dataStart] === 0x0d) dataStart++; // CR
    if (buf[dataStart] === 0x0a) dataStart++; // LF
    const eIdx = buf.indexOf('endstream', dataStart);
    if (eIdx === -1) break;
    const raw = buf.subarray(dataStart, eIdx);
    const decoded = inflateMaybe(raw).toString('latin1');
    text += pdfStreamToText(decoded) + '\n';
    idx = eIdx + 9;
  }
  // Fallback: some PDFs store text uncompressed inline.
  if (text.replace(/\s/g, '').length < 20) {
    text += pdfStreamToText(buf.toString('latin1'));
  }
  return text;
}

// Read word/document.xml out of a DOCX (a ZIP) via the central directory.
function extractDocx(buf: Buffer): string {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd === -1) return '';
  const cdOffset = buf.readUInt32LE(eocd + 16);
  let p = cdOffset;
  let target: { method: number; offset: number; size: number } | null = null;
  while (p + 46 <= buf.length && buf.readUInt32LE(p) === 0x02014b50) {
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (name === 'word/document.xml') { target = { method, offset: localOffset, size: compSize }; break; }
    p += 46 + nameLen + extraLen + commentLen;
  }
  if (!target) return '';
  // Local file header → compute where the entry's data begins.
  const lh = target.offset;
  if (buf.readUInt32LE(lh) !== 0x04034b50) return '';
  const lNameLen = buf.readUInt16LE(lh + 26);
  const lExtraLen = buf.readUInt16LE(lh + 28);
  const dataStart = lh + 30 + lNameLen + lExtraLen;
  const data = buf.subarray(dataStart, dataStart + target.size);
  const xml = (target.method === 8 ? zlib.inflateRawSync(data) : data).toString('utf8');
  return xml
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:tab\b[^>]*\/>/g, '\t')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

export async function extractResumeText(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || '';
  const name = (file.name || '').toLowerCase();
  try {
    if (mime.includes('officedocument.wordprocessing') || name.endsWith('.docx')) return extractDocx(buf);
    if (mime === 'application/pdf' || name.endsWith('.pdf') || buf.subarray(0, 5).toString() === '%PDF-') return extractPdf(buf);
    return buf.toString('utf8');
  } catch {
    return buf.toString('utf8');
  }
}

/* ───────────────────────── field parsing ───────────────────────── */

const SKILL_DICT: Record<string, { cat: SkillCategory; name: string }> = {};
const addSkills = (cat: SkillCategory, names: string[]) => names.forEach((n) => { SKILL_DICT[n.toLowerCase()] = { cat, name: n }; });
addSkills('language', ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'Bash', 'Dart', 'Perl', 'C']);
addSkills('framework', ['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', '.NET', 'Laravel', 'Rails', 'PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'LangChain', 'Tailwind', 'Bootstrap', 'jQuery', 'Flutter', 'React Native']);
addSkills('database', ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB', 'Firebase', 'Elasticsearch', 'Snowflake', 'BigQuery', 'pgvector', 'Pinecone']);
addSkills('cloud', ['AWS', 'Azure', 'GCP', 'Google Cloud', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean', 'Cloudflare']);
addSkills('tool', ['Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab', 'Jenkins', 'Terraform', 'Ansible', 'CI/CD', 'Jira', 'Figma', 'Postman', 'Webpack', 'Vite', 'Kafka', 'RabbitMQ', 'Spark', 'Airflow', 'dbt', 'Jest', 'Playwright', 'Cypress', 'Selenium', 'Linux', 'GraphQL', 'REST']);

const HEADINGS = [
  'summary', 'objective', 'profile', 'about',
  'experience', 'work experience', 'employment', 'professional experience',
  'education', 'academic',
  'projects', 'project',
  'skills', 'technical skills',
  'certifications', 'certificates', 'certification',
  'achievements', 'accomplishments',
  'awards', 'honors',
];

function splitSections(text: string): Record<string, string> {
  const lines = text.split(/\r?\n/);
  const sections: Record<string, string> = {};
  let current = '_top';
  sections[current] = '';
  for (const line of lines) {
    const bare = line.trim().toLowerCase().replace(/[:•\-–—\s]+$/g, '');
    const head = HEADINGS.find((h) => bare === h || bare === h + 's');
    if (head && line.trim().length <= 40) {
      current = head;
      sections[current] = sections[current] || '';
    } else {
      sections[current] += line + '\n';
    }
  }
  return sections;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,4}\d{2,4}/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/[^\s)]+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s)]+/i;

function guessName(text: string, email: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  // A resume usually opens with the candidate's name.
  for (const l of lines.slice(0, 8)) {
    if (EMAIL_RE.test(l) || /\d/.test(l) || l.length > 40) continue;
    const words = l.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Za-z.'-]+$/.test(w))) {
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }
  // Fallback: derive from the email local-part.
  const local = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  if (local) return local.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return '';
}

function findSkills(text: string): { category: SkillCategory; name: string }[] {
  const hay = ' ' + text.toLowerCase() + ' ';
  const found: { category: SkillCategory; name: string }[] = [];
  const seen = new Set<string>();
  for (const key of Object.keys(SKILL_DICT)) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, 'i').test(hay) && !seen.has(key)) {
      seen.add(key);
      found.push({ category: SKILL_DICT[key].cat, name: SKILL_DICT[key].name });
    }
  }
  return found.slice(0, 40);
}

export function parseResumeText(text: string): ParsedProfile {
  const clean = text.replace(/ /g, '').replace(/[ \t]+/g, ' ');
  const email = (clean.match(EMAIL_RE) || [''])[0];
  const phoneRaw = (clean.match(PHONE_RE) || [''])[0].trim();
  const phone = phoneRaw.replace(/\s+/g, ' ').length >= 7 ? phoneRaw : '';
  const linkedinUrl = (clean.match(LINKEDIN_RE) || [''])[0];
  const githubUrl = (clean.match(GITHUB_RE) || [''])[0];
  const name = guessName(clean, email);
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.length ? rest[rest.length - 1] : '';
  const middleName = rest.length > 1 ? rest.slice(0, -1).join(' ') : '';

  const sections = splitSections(clean);
  const summary = (sections.summary || sections.objective || sections.profile || sections.about || '')
    .trim().split('\n').filter(Boolean).join(' ').slice(0, 600);

  const skills = findSkills(clean);

  // Light project extraction: non-empty lines under the projects heading.
  const projects = (sections.projects || sections.project || '')
    .split('\n').map((l) => l.trim()).filter((l) => l.length > 3).slice(0, 5)
    .map((title) => ({ title: title.replace(/^[•\-*]\s*/, '').slice(0, 120), description: '', technologies: '' }));

  // Light certification extraction.
  const certifications = (sections.certifications || sections.certification || sections.certificates || '')
    .split('\n').map((l) => l.trim().replace(/^[•\-*]\s*/, '')).filter((l) => l.length > 2).slice(0, 6)
    .map((title) => ({ title: title.slice(0, 120), number: '', description: '' }));

  const achievements = (sections.achievements || sections.accomplishments || '')
    .split('\n').map((l) => l.trim().replace(/^[•\-*]\s*/, '')).filter((l) => l.length > 2).slice(0, 8);
  const awards = (sections.awards || sections.honors || '')
    .split('\n').map((l) => l.trim().replace(/^[•\-*]\s*/, '')).filter((l) => l.length > 2).slice(0, 8);

  return {
    firstName: firstName || '',
    middleName,
    lastName,
    email,
    phone,
    linkedinUrl,
    githubUrl,
    summary,
    yearsExperience: '',
    education: [],
    experience: [],
    projects,
    certifications,
    skills,
    softSkills: [],
    achievements,
    awards,
  };
}

/** Full local pipeline: read the real file and parse it. Never fabricates. */
export async function localExtract(file: File): Promise<{ parsed: ParsedProfile; chars: number }> {
  const text = await extractResumeText(file);
  return { parsed: parseResumeText(text), chars: text.replace(/\s/g, '').length };
}
