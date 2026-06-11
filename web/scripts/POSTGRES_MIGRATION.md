# Phase 3 — Switch Career OPS to PostgreSQL

Everything is prepared. Once you have a PostgreSQL connection string (Neon), this
is a 4-step, ~2-minute switch. Your data is already captured in
`prisma/data-dump.json` (2 students incl. Bhuvan + resume/avatar binaries).

## Get a Neon database (one of these)
A) Via Vercel (recommended):
   cd web
   vercel link            # link/create a Vercel project (interactive, browser)
   vercel integration add neon   # provision Neon (choose plan/region in browser)
   vercel env pull .env          # pulls DATABASE_URL into web/.env
B) Or paste any Postgres URL (Neon/Supabase/Railway) into web/.env:
   DATABASE_URL="postgresql://USER:PASS@HOST/db?sslmode=require"

## Switch + migrate
1. In prisma/schema.prisma set:  provider = "postgresql"
2. Reset migration history for Postgres (SQLite migrations are incompatible):
     rm -rf prisma/migrations
     npx prisma migrate dev --name init        # creates the Postgres schema
3. Import the captured data (ids, studentId codes, binaries preserved):
     node scripts/import-postgres.mjs
4. Verify:
     npx prisma studio    # or: node scripts/verify.mjs

That's it — all Student Master Profile data, resume metadata, profile-image
metadata, and studentId codes now live in PostgreSQL.
