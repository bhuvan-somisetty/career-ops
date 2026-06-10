-- AlterTable
ALTER TABLE "Student" ADD COLUMN "resumeMimeType" TEXT;
ALTER TABLE "Student" ADD COLUMN "resumeSource" TEXT;
ALTER TABLE "Student" ADD COLUMN "resumeUploadedAt" DATETIME;

-- CreateTable
CREATE TABLE "StudentResumeFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentResumeFile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentResumeFile_studentId_key" ON "StudentResumeFile"("studentId");
