-- Additive migration for the Student Career Portal refactor.
-- SAFE: only CREATE TABLE / ADD COLUMN / ADD INDEX — never drops anything.
-- The target Neon DB is shared with unrelated tables; we must not touch them.
-- Idempotent: uses IF NOT EXISTS so re-running is harmless.

-- ── Account / authentication ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
  "id"           TEXT NOT NULL,
  "email"        TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- ── Student: link to account + JSON snapshot ────────────────────────
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "userId"      TEXT;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "profileJson" JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS "Student_userId_key" ON "Student"("userId");
DO $$ BEGIN
  ALTER TABLE "Student"
    ADD CONSTRAINT "Student_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Central Job database ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Job" (
  "id"              TEXT NOT NULL,
  "source"          TEXT NOT NULL,
  "externalId"      TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "company"         TEXT NOT NULL,
  "location"        TEXT,
  "atsUrl"          TEXT,
  "careerPortalUrl" TEXT,
  "description"     TEXT,
  "category"        TEXT,
  "postedAt"        TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Job_source_externalId_key" ON "Job"("source", "externalId");
CREATE INDEX IF NOT EXISTS "Job_title_idx"    ON "Job"("title");
CREATE INDEX IF NOT EXISTS "Job_company_idx"  ON "Job"("company");
CREATE INDEX IF NOT EXISTS "Job_category_idx" ON "Job"("category");

-- ── Per-user job tracker ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "TrackedJob" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "jobId"     TEXT,
  "company"   TEXT NOT NULL,
  "role"      TEXT NOT NULL,
  "location"  TEXT,
  "status"    TEXT NOT NULL DEFAULT 'Saved',
  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrackedJob_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TrackedJob_userId_idx" ON "TrackedJob"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "TrackedJob_userId_jobId_key" ON "TrackedJob"("userId", "jobId");
DO $$ BEGIN
  ALTER TABLE "TrackedJob" ADD CONSTRAINT "TrackedJob_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "TrackedJob" ADD CONSTRAINT "TrackedJob_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Search history (recommendation signal) ──────────────────────────
CREATE TABLE IF NOT EXISTS "SearchHistory" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "query"     TEXT NOT NULL,
  "kind"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SearchHistory_userId_idx" ON "SearchHistory"("userId");
DO $$ BEGIN
  ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Viewed jobs (recommendation signal) ─────────────────────────────
CREATE TABLE IF NOT EXISTS "ViewedJob" (
  "id"       TEXT NOT NULL,
  "userId"   TEXT NOT NULL,
  "jobId"    TEXT NOT NULL,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ViewedJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ViewedJob_userId_jobId_key" ON "ViewedJob"("userId", "jobId");
CREATE INDEX IF NOT EXISTS "ViewedJob_userId_idx" ON "ViewedJob"("userId");
DO $$ BEGIN
  ALTER TABLE "ViewedJob" ADD CONSTRAINT "ViewedJob_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ViewedJob" ADD CONSTRAINT "ViewedJob_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
