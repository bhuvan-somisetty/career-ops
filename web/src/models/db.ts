/**
 * Career OPS — PostgreSQL Database Architecture Models
 * 
 * Production-ready database schema definitions and types.
 * Designed to align with Prisma, TypeORM, or raw SQL mapping layers.
 */

// --- 1. USER AUTHENTICATION MODEL ---
export interface UserDB {
  id: string; // UUID primary key
  email: string; // Unique index
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// --- 2. ADMIN PROFILE MODEL ---
export interface AdminDB {
  id: string; // UUID primary key
  userId: string; // Foreign key referencing Users.id
  fullName: string;
  institutionName: string;
  department: string;
  permissions: string[]; // e.g. ['read:students', 'write:jobs', 'export:reports']
  createdAt: Date;
  updatedAt: Date;
}

// --- 3. STUDENT PROFILE MODEL ---
export interface StudentDB {
  id: string; // UUID primary key
  userId: string; // Foreign key referencing Users.id
  fullName: string;
  email: string;
  mobile: string;
  collegeName: string;
  degree: string;
  branch: string;
  gradYear: number;
  cgpa: number;
  linkedinUrl?: string;
  githubUrl?: string;
  preferredRoles: string[]; // array of strings
  preferredLocations: string[]; // array of strings
  profileCompleteness: number; // 0 to 100 percentage
  createdAt: Date;
  updatedAt: Date;
}

// --- 4. RESUMES & PARSED DATA MODEL ---
export interface ResumeDB {
  id: string; // UUID primary key
  studentId: string; // Foreign key referencing Students.id
  rawText?: string;
  markdownContent?: string; // mapping of cv.md file contents
  fileUrl?: string; // S3 storage link to PDF/DOCX
  atsScore?: number;
  skillsExtracted: string[]; // array of parsed skills
  projectsExtracted: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// --- 5. SKILLS DIRECTORY MODEL ---
export interface SkillDB {
  id: string; // Serial primary key
  name: string; // Unique, e.g. "Distributed PyTorch", "Next.js"
  category: 'frontend' | 'backend' | 'ml_ops' | 'ai_engineering' | 'soft_skills';
  createdAt: Date;
}

// StudentSkill Join Table (many-to-many relationship)
export interface StudentSkillDB {
  studentId: string; // Composite key part 1, foreign key referencing Students.id
  skillId: number; // Composite key part 2, foreign key referencing Skills.id
  selfReported: boolean;
  verifiedByParser: boolean;
  createdAt: Date;
}

// --- 6. APPLICATIONS TRACKER MODEL ---
export interface ApplicationDB {
  id: string; // UUID primary key
  studentId: string; // Foreign key referencing Students.id
  companyName: string;
  jobTitle: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  location: string;
  matchScore: number;
  status: 'Evaluated' | 'Applied' | 'Responded' | 'Interview' | 'Offer' | 'Rejected' | 'Discarded' | 'SKIP';
  notes?: string; // annotations or recruiter chat histories
  tailoredPdfUrl?: string; // tailored resume file link
  reportSlug?: string; // links to report analysis file
  appliedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// --- 7. AI MATCH RECOMMENDATIONS MODEL ---
export interface RecommendationDB {
  id: string; // UUID primary key
  studentId: string; // Foreign key referencing Students.id
  jobId: string; // Scanned job opportunity ID reference
  companyName: string;
  jobTitle: string;
  location: string;
  matchPercentage: number;
  fitReasoning: string;
  detectedSkills: string[];
  missingSkills: string[];
  suggestedImprovements: string[];
  isDiscarded: boolean;
  isApplied: boolean;
  createdAt: Date;
}

// --- 8. PLACEMENT CELL ANALYTICS MODEL ---
export interface CampusAnalyticsDB {
  id: string; // Serial primary key
  institutionName: string;
  batchYear: number;
  totalStudents: number;
  placedStudents: number;
  averagePackageINR: number;
  highestPackageINR: number;
  topRecruitingPartners: string[]; // e.g. ['Google', 'Stripe', 'Amazon']
  createdAt: Date;
  updatedAt: Date;
}
