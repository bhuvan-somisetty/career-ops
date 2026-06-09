-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "aadhaarNumber" TEXT,
    "gender" TEXT,
    "nationality" TEXT,
    "dateOfBirth" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "district" TEXT,
    "pinCode" TEXT,
    "country" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "altPhone" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "summary" TEXT,
    "yearsExperience" REAL,
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "resumeFileName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "institution" TEXT,
    "location" TEXT,
    "dateOfPassing" TEXT,
    "cgpa" TEXT,
    "percentage" TEXT,
    "achievements" TEXT,
    CONSTRAINT "Education_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "jobTitle" TEXT,
    "companyName" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "responsibilities" TEXT,
    "achievements" TEXT,
    "technologies" TEXT,
    CONSTRAINT "Experience_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "technologies" TEXT,
    CONSTRAINT "Project_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "title" TEXT,
    "number" TEXT,
    "description" TEXT,
    CONSTRAINT "Certification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Skill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SoftSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "SoftSkill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "Achievement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "Award_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Education_studentId_idx" ON "Education"("studentId");

-- CreateIndex
CREATE INDEX "Experience_studentId_idx" ON "Experience"("studentId");

-- CreateIndex
CREATE INDEX "Project_studentId_idx" ON "Project"("studentId");

-- CreateIndex
CREATE INDEX "Certification_studentId_idx" ON "Certification"("studentId");

-- CreateIndex
CREATE INDEX "Skill_studentId_idx" ON "Skill"("studentId");

-- CreateIndex
CREATE INDEX "SoftSkill_studentId_idx" ON "SoftSkill"("studentId");

-- CreateIndex
CREATE INDEX "Achievement_studentId_idx" ON "Achievement"("studentId");

-- CreateIndex
CREATE INDEX "Award_studentId_idx" ON "Award"("studentId");
