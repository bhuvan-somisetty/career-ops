// Shared shapes for the Student Master Profile — used by API routes and the
// admin profile editor. Mirrors the normalized Prisma schema.

export const SKILL_CATEGORIES = ['language', 'framework', 'database', 'cloud', 'tool', 'other'] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: 'Programming Languages',
  framework: 'Frameworks',
  database: 'Databases',
  cloud: 'Cloud Platforms',
  tool: 'Tools & Technologies',
  other: 'Other Skills',
};

export interface EducationInput {
  id?: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location: string;
  dateOfPassing: string;
  cgpa: string;
  percentage: string;
  achievements: string;
}

export interface ExperienceInput {
  id?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  achievements: string;
  technologies: string;
}

export interface ProjectInput {
  id?: string;
  title: string;
  description: string;
  technologies: string;
}

export interface CertificationInput {
  id?: string;
  title: string;
  number: string;
  description: string;
}

export interface SkillInput {
  category: SkillCategory;
  name: string;
}

export interface StudentProfileInput {
  // Personal
  firstName: string;
  middleName: string;
  lastName: string;
  aadhaarNumber: string;
  gender: string;
  nationality: string;
  dateOfBirth: string;
  // Address
  address1: string;
  address2: string;
  city: string;
  state: string;
  district: string;
  pinCode: string;
  country: string;
  // Contact
  email: string;
  phone: string;
  altPhone: string;
  // Social
  linkedinUrl: string;
  githubUrl: string;
  // Professional summary
  summary: string;
  description: string;
  yearsExperience: string;
  // Collections
  education: EducationInput[];
  experience: ExperienceInput[];
  projects: ProjectInput[];
  certifications: CertificationInput[];
  skills: SkillInput[];
  softSkills: string[];
  achievements: string[];
  awards: string[];
}

export interface ResumeMeta {
  fileName: string | null;
  mimeType: string | null;
  source: string | null;
  uploadedAt: string | null;
  updatedAt: string | null;
  hasFile: boolean;
}

export interface AvatarMeta {
  fileName: string | null;
  mimeType: string | null;
  uploadedAt: string | null;
  hasFile: boolean;
}

export interface StudentSummary {
  id: string;
  studentId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileCompleteness: number;
  topDegree: string | null;
  topInstitution: string | null;
  skillCount: number;
  updatedAt: string;
}

// What the resume extractor returns (Part 2 auto-populate payload).
export type ParsedProfile = Partial<
  Pick<StudentProfileInput,
    'firstName' | 'middleName' | 'lastName' | 'email' | 'phone' | 'linkedinUrl' | 'githubUrl' |
    'summary' | 'yearsExperience' | 'education' | 'experience' | 'projects' | 'certifications' |
    'skills' | 'softSkills' | 'achievements' | 'awards'
  >
>;

export function emptyProfile(): StudentProfileInput {
  return {
    firstName: '', middleName: '', lastName: '', aadhaarNumber: '', gender: '', nationality: '', dateOfBirth: '',
    address1: '', address2: '', city: '', state: '', district: '', pinCode: '', country: '',
    email: '', phone: '', altPhone: '',
    linkedinUrl: '', githubUrl: '',
    summary: '', description: '', yearsExperience: '',
    education: [], experience: [], projects: [], certifications: [],
    skills: [], softSkills: [], achievements: [], awards: [],
  };
}
