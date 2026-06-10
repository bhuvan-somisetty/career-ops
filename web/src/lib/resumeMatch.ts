// Resume Match Engine — derives a real ATS / alignment analysis from the
// student's SAVED Master Profile + uploaded resume metadata. No mock data:
// every number and list below is computed from the student's own content.

import { SKILL_CATEGORY_LABELS, type StudentProfileInput, type ResumeMeta } from '@/types/student';

export interface SkillGap {
  skill: string;
  context: string;
  impact: 'High' | 'Moderate' | 'Low';
}

export interface ResumeMatch {
  hasProfile: boolean;
  hasContent: boolean; // profile has enough substance to analyze
  name: string;
  headline: string;
  domain: string;
  resume: { fileName: string | null; hasFile: boolean; source: string | null; uploadedAt: string | null };
  completeness: number;
  counts: {
    skills: number; projects: number; education: number; experience: number;
    certifications: number; softSkills: number; achievements: number; awards: number;
  };
  skillsByCategory: { category: string; label: string; items: string[] }[];
  wordCount: number;
  ats: { structural: number; keyword: number; overall: number; passProbability: 'High' | 'Medium' | 'Low' };
  goalAlignment: number;
  fitTitle: string;
  fitSummary: string;
  skillGaps: SkillGap[];
  missingKeywords: string[];
  improvements: string[];
  resumeText: string;
}

interface Domain {
  key: string;
  label: string;
  fitTitle: string;
  match: string[];        // terms that, if present, indicate this domain
  targetSkills: string[]; // in-demand skills used for gap analysis
  keywords: string[];     // ATS keywords checked against the resume text
}

// Domain knowledge banks. Gap/keyword analysis is relative to the domain that
// best matches the student's OWN resume — not a fixed AI persona.
const DOMAINS: Domain[] = [
  {
    key: 'ai-ml', label: 'AI / Machine Learning', fitTitle: 'AI / ML Engineer',
    match: ['machine learning', 'deep learning', ' ml', 'ai ', 'llm', 'nlp', 'pytorch', 'tensorflow', 'data scien', 'neural', 'transformer', 'hugging'],
    targetSkills: ['PyTorch', 'Vector Databases', 'RAG', 'MLOps', 'Model Deployment', 'LLM Fine-tuning'],
    keywords: ['semantic search', 'rag evaluation', 'vector indexing', 'model deployment', 'feature engineering', 'fine-tuning'],
  },
  {
    key: 'data', label: 'Data Engineering / Analytics', fitTitle: 'Data Engineer / Analyst',
    match: ['data engineer', 'etl', 'spark', 'hadoop', 'airflow', 'snowflake', 'bigquery', 'data pipeline', 'data warehouse', 'analytics', 'sql', 'tableau', 'power bi'],
    targetSkills: ['Apache Spark', 'Airflow', 'dbt', 'Snowflake', 'Data Modeling', 'Kafka'],
    keywords: ['data pipeline', 'etl', 'data warehouse', 'orchestration', 'streaming', 'data quality'],
  },
  {
    key: 'devops', label: 'DevOps / Cloud / SRE', fitTitle: 'DevOps / Cloud Engineer',
    match: ['devops', 'kubernetes', 'docker', 'terraform', 'ansible', 'ci/cd', 'cicd', 'aws', 'azure', 'gcp', 'sre', 'infrastructure', 'jenkins'],
    targetSkills: ['Kubernetes', 'Terraform', 'CI/CD', 'Observability', 'AWS', 'Helm'],
    keywords: ['infrastructure as code', 'ci/cd', 'observability', 'auto-scaling', 'container orchestration', 'monitoring'],
  },
  {
    key: 'frontend', label: 'Frontend / UI Engineering', fitTitle: 'Frontend Engineer',
    match: ['frontend', 'front-end', 'react', 'vue', 'angular', 'next.js', 'nextjs', 'tailwind', 'css', 'typescript', 'ui/ux', 'web design'],
    targetSkills: ['React', 'TypeScript', 'Next.js', 'Accessibility (a11y)', 'State Management', 'Testing (Jest/RTL)'],
    keywords: ['responsive design', 'accessibility', 'component library', 'state management', 'performance optimization', 'unit testing'],
  },
  {
    key: 'backend', label: 'Backend / Software Engineering', fitTitle: 'Backend / Software Engineer',
    match: ['backend', 'back-end', 'api', 'microservice', 'node', 'java', 'golang', ' go ', 'python', 'spring', 'postgres', 'mysql', 'mongodb', 'rest', 'graphql'],
    targetSkills: ['System Design', 'REST/GraphQL APIs', 'Relational Databases', 'Caching', 'Message Queues', 'Unit Testing'],
    keywords: ['rest api', 'system design', 'database indexing', 'caching', 'microservices', 'unit testing'],
  },
];

const GENERAL: Domain = {
  key: 'general', label: 'General Professional', fitTitle: 'Professional Profile',
  match: [],
  targetSkills: ['Communication', 'Project Management', 'Data Analysis', 'Stakeholder Management', 'Problem Solving', 'Leadership'],
  keywords: ['leadership', 'collaboration', 'project management', 'stakeholder', 'analysis', 'optimization'],
};

function has(haystack: string, needle: string): boolean {
  return haystack.includes(needle.toLowerCase());
}

/** Render the student's structured profile into readable resume text. */
export function buildResumeText(p: StudentProfileInput): string {
  const name = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim();
  const lines: string[] = [];
  if (name) lines.push(name);
  const contact = [p.email, p.phone, [p.city, p.state, p.country].filter(Boolean).join(', ')].filter(Boolean).join('  |  ');
  if (contact) lines.push(contact);
  const social = [p.linkedinUrl, p.githubUrl].filter(Boolean).join('  |  ');
  if (social) lines.push(social);

  if (p.summary) lines.push('', 'PROFESSIONAL SUMMARY', p.summary);

  if (p.experience.length) {
    lines.push('', 'EXPERIENCE');
    for (const e of p.experience) {
      const head = [e.jobTitle, e.companyName].filter(Boolean).join(' — ');
      const dates = [e.startDate, e.endDate || 'Present'].filter(Boolean).join(' to ');
      lines.push([head, e.location, dates].filter(Boolean).join('  |  '));
      if (e.responsibilities) lines.push(e.responsibilities);
      if (e.achievements) lines.push(e.achievements);
      if (e.technologies) lines.push(`Tech: ${e.technologies}`);
    }
  }

  if (p.education.length) {
    lines.push('', 'EDUCATION');
    for (const ed of p.education) {
      lines.push([[ed.degree, ed.fieldOfStudy].filter(Boolean).join(', '), ed.institution, ed.dateOfPassing].filter(Boolean).join('  |  '));
      const grade = [ed.cgpa && `CGPA ${ed.cgpa}`, ed.percentage && `${ed.percentage}%`].filter(Boolean).join('  ');
      if (grade) lines.push(grade);
    }
  }

  if (p.skills.length) {
    lines.push('', 'SKILLS');
    lines.push(p.skills.map((s) => s.name).join(', '));
  }
  if (p.projects.length) {
    lines.push('', 'PROJECTS');
    for (const pr of p.projects) {
      lines.push(pr.title || 'Project');
      if (pr.description) lines.push(pr.description);
      if (pr.technologies) lines.push(`Tech: ${pr.technologies}`);
    }
  }
  if (p.certifications.length) {
    lines.push('', 'CERTIFICATIONS');
    for (const c of p.certifications) lines.push([c.title, c.number].filter(Boolean).join(' — '));
  }
  if (p.softSkills.length) lines.push('', 'SOFT SKILLS', p.softSkills.join(', '));
  if (p.achievements.length) lines.push('', 'ACHIEVEMENTS', ...p.achievements.map((a) => `• ${a}`));
  if (p.awards.length) lines.push('', 'AWARDS', ...p.awards.map((a) => `• ${a}`));

  return lines.join('\n').trim();
}

function pickDomain(text: string, skillNames: string[]): Domain {
  const hay = (text + ' ' + skillNames.join(' ')).toLowerCase();
  let best: Domain = GENERAL;
  let bestScore = 0;
  for (const d of DOMAINS) {
    const score = d.match.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return bestScore > 0 ? best : GENERAL;
}

export function analyzeProfile(
  p: StudentProfileInput,
  resume: ResumeMeta | null,
  completeness: number
): ResumeMatch {
  const resumeText = buildResumeText(p);
  const text = resumeText.toLowerCase();
  const skillNames = p.skills.map((s) => s.name);
  const skillHay = skillNames.join(' ').toLowerCase();
  const name = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim() || 'Unnamed Student';

  const counts = {
    skills: p.skills.length, projects: p.projects.length, education: p.education.length,
    experience: p.experience.length, certifications: p.certifications.length,
    softSkills: p.softSkills.length, achievements: p.achievements.length, awards: p.awards.length,
  };

  // Enough substance to produce a meaningful analysis?
  const hasContent = !!(p.summary || counts.experience || counts.education || counts.skills);

  const domain = pickDomain(text, skillNames);

  // Skills grouped by category for display.
  const skillsByCategory = (Object.keys(SKILL_CATEGORY_LABELS) as (keyof typeof SKILL_CATEGORY_LABELS)[])
    .map((cat) => ({ category: cat, label: SKILL_CATEGORY_LABELS[cat], items: p.skills.filter((s) => s.category === cat).map((s) => s.name) }))
    .filter((g) => g.items.length > 0);

  // ── ATS structural score (weights sum to 100) ──
  const expDated = p.experience.some((e) => e.startDate);
  const metricsRe = /\b\d+(\.\d+)?\s?%|\b\d{2,}\b|\$\d|\bx\b/i;
  const hasMetrics = p.experience.some((e) => metricsRe.test(`${e.responsibilities} ${e.achievements}`));
  let structural = 0;
  if (p.email) structural += 12;
  if (p.phone) structural += 8;
  if (p.summary && p.summary.length >= 20) structural += 15;
  structural += counts.experience ? (expDated ? 20 : 10) : 0;
  if (counts.education) structural += 15;
  structural += Math.round((Math.min(counts.skills, 5) / 5) * 15);
  if (counts.projects) structural += 10;
  if (hasMetrics) structural += 5;
  structural = Math.min(100, structural);

  // ── Keyword / semantic alignment vs the matched domain ──
  const targetPresent = domain.targetSkills.filter((s) => has(skillHay, s.split(' ')[0]) || has(text, s.toLowerCase()));
  const kwPresent = domain.keywords.filter((k) => has(text, k));
  const keyword = Math.round(
    (targetPresent.length / domain.targetSkills.length) * 50 +
    (kwPresent.length / domain.keywords.length) * 50
  );

  const overall = Math.round(structural * 0.6 + keyword * 0.4);
  const passProbability: ResumeMatch['ats']['passProbability'] = overall >= 80 ? 'High' : overall >= 60 ? 'Medium' : 'Low';
  const goalAlignment = Math.round(overall * 0.6 + completeness * 0.4);

  // ── Skill gaps: in-demand domain skills the resume doesn't evidence ──
  const skillGaps: SkillGap[] = domain.targetSkills
    .filter((s) => !(has(skillHay, s.split(' ')[0].toLowerCase()) || has(text, s.toLowerCase())))
    .slice(0, 4)
    .map((skill, i) => ({
      skill,
      context: `In-demand for ${domain.label} roles — not detected in your resume.`,
      impact: i === 0 ? 'High' : 'Moderate',
    }));

  // ── Missing ATS keywords ──
  const missingKeywords = domain.keywords.filter((k) => !has(text, k)).slice(0, 6);

  // ── Actionable improvements derived from concrete gaps ──
  const improvements: string[] = [];
  if (!p.summary || p.summary.length < 20) improvements.push('Add a Professional Summary (2–3 lines) stating your role, focus area, and biggest achievement.');
  if (!hasMetrics && counts.experience) improvements.push('Quantify your achievements with concrete numbers (e.g. "reduced latency 40%", "managed a team of 5").');
  if (counts.skills < 5) improvements.push('List at least 5 technical skills so ATS keyword matching can pick them up.');
  if (skillGaps[0]) improvements.push(`Add "${skillGaps[0].skill}" to your Skills if you have exposure — it is highly demanded for ${domain.label} roles.`);
  if (!counts.projects) improvements.push('Add at least one project with a short impact-focused description and the technologies used.');
  if (!counts.experience) improvements.push('Add your work or internship experience with dates and responsibilities.');
  if (!resume?.hasFile) improvements.push('Upload your resume file on the Profile page so it can be viewed, downloaded, and re-analyzed.');
  if (improvements.length === 0) improvements.push('Strong, well-structured profile. Keep tailoring keywords to each specific job description before applying.');

  const fitSummary = hasContent
    ? `Based on your saved profile, your strongest alignment is with ${domain.label} roles. ${
        overall >= 80 ? 'Your resume is well-structured with strong keyword coverage.'
        : overall >= 60 ? 'Solid foundation — close the gaps below to improve ATS pass rate.'
        : 'Several core sections need strengthening to pass ATS screening.'
      }`
    : 'Your profile does not yet have enough content to analyze. Add a summary, experience, education, and skills on the Profile page.';

  const headline = p.experience[0]?.jobTitle || domain.fitTitle;
  const wordCount = resumeText ? resumeText.split(/\s+/).filter(Boolean).length : 0;

  return {
    hasProfile: true,
    hasContent,
    name,
    headline,
    domain: domain.label,
    resume: {
      fileName: resume?.fileName ?? null,
      hasFile: !!resume?.hasFile,
      source: resume?.source ?? null,
      uploadedAt: resume?.uploadedAt ?? null,
    },
    completeness,
    counts,
    skillsByCategory,
    wordCount,
    ats: { structural, keyword, overall, passProbability },
    goalAlignment,
    fitTitle: domain.fitTitle,
    fitSummary,
    skillGaps,
    missingKeywords,
    improvements: improvements.slice(0, 5),
    resumeText,
  };
}
