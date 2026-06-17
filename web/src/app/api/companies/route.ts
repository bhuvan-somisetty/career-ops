import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COMPANY_METADATA: Record<string, { overview: string; website: string; status: string; logo?: string; location?: string }> = {
  google: {
    overview: 'Google LLC is an American multinational technology company focusing on artificial intelligence, online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, and consumer electronics.',
    website: 'https://careers.google.com',
    status: 'Actively Hiring',
    location: 'Mountain View, CA / Bangalore, India',
  },
  microsoft: {
    overview: 'Microsoft Corporation is an American multinational technology corporation producing computer software, consumer electronics, personal computers, and services.',
    website: 'https://careers.microsoft.com',
    status: 'Actively Hiring',
    location: 'Redmond, WA / Hyderabad, India',
  },
  amazon: {
    overview: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.',
    website: 'https://amazon.jobs',
    status: 'Actively Hiring',
    location: 'Seattle, WA / Bangalore, India',
  },
  tcs: {
    overview: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company.',
    website: 'https://www.tcs.com/careers',
    status: 'Actively Hiring',
    location: 'Mumbai, Maharashtra, India',
  },
  infosys: {
    overview: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
    website: 'https://www.infosys.com/careers',
    status: 'Actively Hiring',
    location: 'Pune, Maharashtra, India',
  },
  wipro: {
    overview: 'Wipro Limited is an Indian multinational corporation that provides information technology, consultant, and business process services.',
    website: 'https://careers.wipro.com',
    status: 'Actively Hiring',
    location: 'Bangalore, Karnataka, India',
  },
  flipkart: {
    overview: 'Flipkart is a leading Indian e-commerce company, headquartered in Bangalore, Karnataka, India.',
    website: 'https://www.flipkartcareers.com',
    status: 'Actively Hiring',
    location: 'Bangalore, Karnataka, India',
  },
  razorpay: {
    overview: 'Razorpay is a leading financial technology platform in India, providing payment gateway, payroll, and business banking solutions.',
    website: 'https://razorpay.com/jobs',
    status: 'Actively Hiring',
    location: 'Bangalore, Karnataka, India',
  },
  zoho: {
    overview: 'Zoho Corporation is an Indian multinational technology company that makes web-based business tools and software suite solutions.',
    website: 'https://www.zoho.com/careers',
    status: 'Actively Hiring',
    location: 'Chennai, Tamil Nadu, India',
  },
  swiggy: {
    overview: 'Swiggy is India\'s leading on-demand food and convenience delivery platform, connecting consumers with restaurants and stores.',
    website: 'https://careers.swiggy.com',
    status: 'Actively Hiring',
    location: 'Bangalore, Karnataka, India',
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nameQuery = searchParams.get('name') ?? '';

    // Get all unique companies and aggregate job counts
    const jobs = await prisma.job.findMany({
      select: {
        company: true,
        location: true,
      },
    });

    const companyGroups: Record<string, { name: string; jobCount: number; locations: Set<string> }> = {};

    for (const job of jobs) {
      const canonicalKey = job.company.toLowerCase().trim();
      if (!companyGroups[canonicalKey]) {
        companyGroups[canonicalKey] = {
          name: job.company,
          jobCount: 0,
          locations: new Set<string>(),
        };
      }
      companyGroups[canonicalKey].jobCount++;
      if (job.location) {
        companyGroups[canonicalKey].locations.add(job.location);
      }
    }

    const companies = Object.entries(companyGroups)
      .map(([key, group]) => {
        const meta = COMPANY_METADATA[key] || {
          overview: `${group.name} is a company in our jobs network listing active career opportunities.`,
          website: 'https://careers.google.com',
          status: 'Actively Hiring',
          location: Array.from(group.locations)[0] || 'Worldwide',
        };

        return {
          id: key,
          name: group.name,
          overview: meta.overview,
          website: meta.website,
          status: meta.status,
          location: meta.location,
          jobCount: group.jobCount,
          allLocations: Array.from(group.locations),
        };
      })
      .filter((company) => {
        if (!nameQuery) return true;
        return company.name.toLowerCase().includes(nameQuery.toLowerCase());
      });

    return NextResponse.json({ companies });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
