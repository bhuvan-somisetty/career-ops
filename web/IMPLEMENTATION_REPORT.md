# Career-Ops → Student Career Portal — Implementation Report

This documents the refactor of the existing Career-Ops web app (`web/`) into a
student-focused, Zippia-style career portal. **The existing app was refactored
and extended — not rebuilt.** Stack unchanged: Next.js 16 (App Router) · React 19
· Prisma · PostgreSQL (Neon) · Tailwind v4 · framer-motion.

---

## 1. What changed at a glance

| Requirement | Status | Where |
|---|---|---|
| Remove admin (UI, nav, routes, login, workflows) | ✅ Done | deleted `src/app/(public)/admin/**`; landing/portal/footer links repointed |
| Real per-user accounts (email + password) | ✅ Done | `User` model + `src/lib/auth.ts`, `session.ts`, `api/auth/*` |
| Student flow: Login → Resume → Profile → Discovery → Tracking → Recommendations | ✅ Done | onboarding + console pages wired to real APIs |
| Resume upload → extraction → profile JSON → edit → save | ✅ Done | swappable `resumeExtractor.ts`; reuses existing `StudentProfileEditor` |
| User profile stored as JSON | ✅ Done | `Student.profileJson` + `toProfileJson()` |
| Central Job DB (title, company, location, ATS URL, career portal URL, description, category) | ✅ Done | `Job` model |
| Job source: seed **and** live ATS | ✅ Done | `prisma/seed.mjs` (32 sample jobs) + `jobIngest.ts` (Greenhouse/Lever/Ashby) |
| Search by Job Title (all companies) / by Company | ✅ Done | `jobService.searchJobs` + `GET /api/jobs` |
| Job Tracker (Saved/Applied/Interview/Rejected/Offer) | ✅ Done | `TrackedJob` + `/api/tracker` |
| Recommendations (skills, search history, saved, viewed) | ✅ Done | `recommend.ts` + `/api/recommendations` |
| Everything keyed to userId | ✅ Done | see §7 |

---

## 2. Updated database schema (`prisma/schema.prisma`)

**New models**
- `User { id, email @unique, passwordHash, createdAt, updatedAt }` — one login per user.
- `Job { id, source, externalId, title, company, location, atsUrl, careerPortalUrl, description, category, postedAt, … @@unique([source, externalId]) }` — the central job database. Seed rows use `source:"seed"`; live rows use `"greenhouse" | "lever" | "ashby"`.
- `TrackedJob { id, userId, jobId?, company, role, location, status, notes, … @@unique([userId, jobId]) }` — per-user funnel; `status ∈ Saved|Applied|Interview|Rejected|Offer`.
- `SearchHistory { id, userId, query, kind, createdAt }` — recommendation signal.
- `ViewedJob { id, userId, jobId, viewedAt, @@unique([userId, jobId]) }` — recommendation signal.

**Changed**
- `Student` gained `userId @unique` (1:1 → `User`, the owning account) and `profileJson Json?` (denormalized snapshot; normalized child tables remain the source of truth).

**Migration note.** The target Neon DB is **shared with an unrelated app** (tables `parents`, `children`, `tasks`, `rewards`, …). `prisma db push` wanted to drop them, so the changes were applied with a **non-destructive additive SQL script**: `prisma/sql/001_student_portal.sql` (only `CREATE TABLE` / `ADD COLUMN` / indexes, all `IF NOT EXISTS`). Re-runnable and safe. Apply with:
```
npx prisma db execute --file prisma/sql/001_student_portal.sql --schema prisma/schema.prisma
npx prisma generate
```
(If you move to a dedicated database, `npx prisma db push` is fine there.)

---

## 3. API surface

**Auth** (`src/app/api/auth/*`)
- `POST /api/auth/signup` — create `User` + linked empty `Student`, set session cookie.
- `POST /api/auth/login` — verify password, set cookie.
- `POST /api/auth/logout` — clear cookie.
- `GET /api/auth/me` — `{ userId, email, studentId }`; the auth gate for the console (401 when logged out).

**Jobs**
- `GET /api/jobs?title=&company=&category=` — search; `title` matches across all companies, `company` returns all of a company's jobs; logs a `SearchHistory` row.
- `GET /api/jobs/[id]` — one job; records a `ViewedJob`.
- `POST /api/jobs/ingest` — pull live jobs from public ATS boards into `Job`.

**Tracker**
- `GET/POST /api/tracker` — list / save (default status `Saved`).
- `PATCH/DELETE /api/tracker/[id]` — move status / edit notes / remove (scoped to owner).

**Recommendations**
- `GET /api/recommendations?limit=` — ranked jobs for the session user.

**Students / resume (reused, extended)**
- `GET /api/students/[id]` — now also returns `profileJson` (`{skills, education, experience, projects, certifications, …}`).
- `PUT /api/students/[id]`, `POST /api/students/[id]/resume`, `…/avatar`, `…/match` — unchanged behavior.
- `POST /api/resume/extract` — now delegates to the swappable adapter (§5).

---

## 4. Removed admin

- Deleted `src/app/(public)/admin/**` (dashboard, login, profile, settings, students CRUD, `useAdminAuth`, `AdminBranchChart`).
- `StudentProfileEditor.tsx` was **moved** to `src/components/` (the console profile + onboarding reuse it) and its admin redirect paths neutralized.
- Landing page (`(public)/page.tsx`), `portal/page.tsx`, and the footer no longer link to admin — they point to `/login` and `/signup`.
- `LegacyKeyMigration.tsx` no longer carries admin localStorage keys.
- No backend was left dangling: the only console dependency on admin code was the editor, which was relocated.

---

## 5. Resume-extraction adapter (drop-in for the team's API)

`src/lib/resumeExtractor.ts` exposes one contract: `extractResume(file) → ParsedProfile`.
Backend chosen by `RESUME_EXTRACT_PROVIDER` (`auto` default):
- **`team-api`** — POSTs the file to `RESUME_EXTRACT_API_URL` (+ optional `RESUME_EXTRACT_API_KEY`). Accepts `ParsedProfile` or `{ parsed: ParsedProfile }`. **This is the integration point** — when the team ships their API, set those two env vars; no code changes.
- **`gemini`** — existing Google Generative AI path.
- **`local`** — offline `unpdf` parse of the real upload (never fabricates data).
`auto` tries team-api (if configured) → gemini → local. The route response shape is unchanged, so the editor's upload→populate flow is untouched.

---

## 6. Seed vs live job sourcing

- **Seed (always available):** `npm run db:seed` upserts 32 sample jobs across varied titles (Software Engineer, AI Engineer, Data Analyst, …) and companies (TCS, Google, Microsoft, Amazon, Infosys, Wipro, Flipkart, Razorpay, Zoho, Swiggy). The portal is fully usable offline.
- **Live (opt-in):** `POST /api/jobs/ingest` (also a "Fetch live ATS jobs" button on Job Discovery) reads `tracked_companies` from the repo-root `portals.yml`, detects Greenhouse/Lever/Ashby from each `careers_url`, fetches their **public** JSON boards (no credentials), and upserts into `Job` on `(source, externalId)`. `ingestCredentialedSources()` is a clearly-marked env-gated placeholder for future keyed providers.
- Both paths write the same `Job` shape, so search and recommendations are source-agnostic.

---

## 7. Everything is keyed to userId

| Entity | Link |
|---|---|
| Account | `User.id` |
| Profile (+ resume blob, avatar) | `Student.userId → User.id` (1:1) |
| Resume data / profileJson | on the linked `Student` |
| Saved & tracked jobs | `TrackedJob.userId` |
| Search history | `SearchHistory.userId` |
| Viewed jobs | `ViewedJob.userId` |
| Recommendations | computed per `userId` from the above |

Session: an HttpOnly, HMAC-signed cookie (`career_ops_session`) carries the userId; `getSessionUser()` resolves `{ userId, email, studentId }` for every per-user route. The console layout gates on `GET /api/auth/me`.

---

## 8. Recommendation signals (`src/lib/recommend.ts`)

Weighted token overlap between the user's signals and each `Job` (title + category + description), excluding already-tracked jobs:
- resume **skills** (weight 3), **search history** (2), **saved-job** titles/categories (2), **viewed-job** titles/categories (1).
Cold start (no signals) → most recent postings. Each result carries a short "why".

---

## 9. Verification performed

Build: `npm run build` passes (TypeScript + lint clean; all admin routes gone, new routes present). End-to-end against the dev server:
- signup → session cookie → `/api/auth/me` returns the linked `studentId`;
- search by title (`?title=Engineer` → 21) and by company (`?company=TCS` → 4) with category facets;
- save a job → `TrackedJob` created (`Saved`) → `PATCH` → `Applied` persists;
- `GET /api/students/[id]` returns the `profileJson` block with `skills/education/experience/projects/certifications/…`;
- after a `Data` search, `/api/recommendations` ranks Data roles first;
- logout clears the cookie (subsequent `/api/auth/me` → 401).

> Note: under `next start` (production) the session cookie is `Secure`, so local **HTTP** can't hold a session — use HTTPS in prod or `next dev` locally. The live-ingest call is network-bound and can exceed a short client timeout; the endpoint itself works (`maxDuration = 60`).

---

## 10. Follow-ups / not in scope

- **Auth hardening:** add real session middleware (currently a client-side `/api/auth/me` gate) and rate-limiting; set a strong `SESSION_SECRET` in prod.
- **Dedicated database:** move off the shared Neon DB so `prisma db push` can be used normally.
- **Credentialed ATS sources:** implement `ingestCredentialedSources()` when keys arrive.
- **Team resume API:** set `RESUME_EXTRACT_API_URL`/`_KEY` to switch extraction over.
- The legacy file-based `/api/applications` (markdown) and the analytics/reports pages still exist for the CLI side; the web tracker now uses the DB.
