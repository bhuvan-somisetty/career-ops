import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// A pre-loaded list of global locations to ensure rich suggestions matching the requirements
const GLOBAL_LOCATIONS = [
  // "Ba" matches
  { name: 'Bangalore', type: 'City', country: 'India' },
  { name: 'Barcelona', type: 'City', country: 'Spain' },
  { name: 'Baltimore', type: 'City', country: 'United States' },
  { name: 'Bahrain', type: 'Country', country: 'Bahrain' },
  { name: 'Bali', type: 'State/Province', country: 'Indonesia' },
  { name: 'Banaras', type: 'City', country: 'India' },
  // "Hy" matches
  { name: 'Hyderabad', type: 'City', country: 'India' },
  { name: 'Hyderabad Sindh', type: 'City', country: 'Pakistan' },
  // Additional global locations
  { name: 'San Francisco', type: 'City', country: 'United States' },
  { name: 'London', type: 'City', country: 'United Kingdom' },
  { name: 'New York', type: 'City', country: 'United States' },
  { name: 'Paris', type: 'City', country: 'France' },
  { name: 'Berlin', type: 'City', country: 'Germany' },
  { name: 'Tokyo', type: 'City', country: 'Japan' },
  { name: 'Sydney', type: 'City', country: 'Australia' },
  { name: 'Toronto', type: 'City', country: 'Canada' },
  { name: 'Singapore', type: 'Country', country: 'Singapore' },
  { name: 'Dubai', type: 'City', country: 'United Arab Emirates' },
  { name: 'Seattle', type: 'City', country: 'United States' },
  { name: 'Austin', type: 'City', country: 'United States' },
  { name: 'Boston', type: 'City', country: 'United States' },
  { name: 'California', type: 'State/Province', country: 'United States' },
  { name: 'Karnataka', type: 'State/Province', country: 'India' },
  { name: 'Texas', type: 'State/Province', country: 'United States' },
  { name: 'India', type: 'Country', country: 'India' },
  { name: 'United States', type: 'Country', country: 'United States' },
  { name: 'Spain', type: 'Country', country: 'Spain' },
  { name: 'Germany', type: 'Country', country: 'Germany' },
  { name: 'France', type: 'Country', country: 'France' },
  { name: 'Japan', type: 'Country', country: 'Japan' },
  { name: 'United Kingdom', type: 'Country', country: 'United Kingdom' },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? '';
    const cleanQ = q.trim().toLowerCase();

    if (!cleanQ) {
      return NextResponse.json({ suggestions: [] });
    }

    // 1. Get unique locations from the database
    const dbJobs = await prisma.job.findMany({
      where: {
        location: {
          not: null,
        },
      },
      distinct: ['location'],
      select: {
        location: true,
      },
    });

    const dbLocations = dbJobs
      .map((j) => j.location as string)
      .filter(Boolean)
      .map((loc) => {
        // Split if format is "City, Country"
        const parts = loc.split(',').map((p) => p.trim());
        const name = parts[0];
        const country = parts[1] || '';
        return {
          name,
          type: 'City',
          country,
          fullName: loc,
        };
      });

    // 2. Combine static list and database list, deduping by name (case-insensitive)
    const combined = [...GLOBAL_LOCATIONS];
    const seen = new Set(combined.map((l) => l.name.toLowerCase()));

    for (const loc of dbLocations) {
      if (!seen.has(loc.name.toLowerCase())) {
        seen.add(loc.name.toLowerCase());
        combined.push({
          name: loc.name,
          type: loc.type,
          country: loc.country,
        });
      }
      if (loc.fullName && !seen.has(loc.fullName.toLowerCase())) {
        seen.add(loc.fullName.toLowerCase());
        combined.push({
          name: loc.fullName,
          type: 'Location',
          country: loc.country,
        });
      }
    }

    // 3. Filter by prefix match or general substring match, prioritising prefix matches
    const suggestions = combined
      .filter((loc) => loc.name.toLowerCase().includes(cleanQ))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(cleanQ);
        const bStarts = b.name.toLowerCase().startsWith(cleanQ);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10); // Limit to top 10

    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
