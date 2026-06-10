-- AlterTable
ALTER TABLE "Student" ADD COLUMN "avatarFileName" TEXT;
ALTER TABLE "Student" ADD COLUMN "avatarMimeType" TEXT;
ALTER TABLE "Student" ADD COLUMN "avatarUploadedAt" DATETIME;

-- CreateTable
CREATE TABLE "StudentAvatarFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentAvatarFile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentAvatarFile_studentId_key" ON "StudentAvatarFile"("studentId");
