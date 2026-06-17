import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Altering Job table to add new columns safely...');
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Job" 
      ADD COLUMN IF NOT EXISTS "workMode" TEXT,
      ADD COLUMN IF NOT EXISTS "employmentType" TEXT,
      ADD COLUMN IF NOT EXISTS "experienceLevel" TEXT,
      ADD COLUMN IF NOT EXISTS "salaryMin" INTEGER,
      ADD COLUMN IF NOT EXISTS "salaryMax" INTEGER,
      ADD COLUMN IF NOT EXISTS "skills" TEXT;
    `);
    console.log('Columns added successfully.');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
