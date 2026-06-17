import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COMPANY_METADATA: Record<string, { name: string; overview: string; website: string; status: string; location: string }> = {
  google: {
    name: 'Google',
    overview: 'Google LLC is an American multinational technology company focusing on artificial intelligence, online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, and consumer electronics.',
    website: 'https://careers.google.com',
    status: 'Actively Hiring',
    location: 'Mountain View, CA / Bangalore, India',
  },
  microsoft: {
    name: 'Microsoft',
    overview: 'Microsoft Corporation is an American multinational technology corporation producing computer software, consumer electronics, personal computers, and services.',
    website: 'https://careers.microsoft.com',
    status: 'Actively Hiring',
    location: 'Redmond, WA / Hyderabad, India',
  },
  amazon: {
    name: 'Amazon',
    overview: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.',
    website: 'https://amazon.jobs',
    status: 'Actively Hiring',
    location: 'Seattle, WA / Bangalore, India',
  },
  tcs: {
    name: 'TCS',
    overview: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company.',
    website: 'https://www.tcs.com/careers',
    status: 'Actively Hiring',
    location: 'Mumbai, Maharashtra, India',
  },
  infosys: {
    name: 'Infosys',
    overview: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
    website: 'https://www.infosys.com/careers',
    status: 'Actively Hiring',
    location: 'Pune, Maharashtra, India',
  },
  wipro: {
    name: 'Wipro',
    overview: 'Wipro Limited is an Indian multinational corporation that provides information technology, consultant, and business process services.',
    website: 'https://careers.wipro.com',
    status: 'Actively Hiring',
    location: 'Bangalore, Karnataka, India',
  },
  flipkart: {
    name: 'Flipkart',
    overview: 'Flipkart is a leading Indian e-commerce company, headquartered in Bangalore, Karnataka, India.',
    website: 'https://www.flipkartcareers.com',
    status: 'Actively Hiring',
    location: 'Bangalore, Karnataka, India',
  },
  razorpay: {
    name: 'Razorpay',
    overview: 'Razorpay is a leading financial technology platform in India, providing payment gateway, payroll, and business banking solutions.',
    website: 'https://razorpay.com/jobs',
    status: 'Actively Hiring',
    location: 'Bangalore, Karnataka, India',
  },
  zoho: {
    name: 'Zoho',
    overview: 'Zoho Corporation is an Indian multinational technology company that makes web-based business tools and software suite solutions.',
    website: 'https://www.zoho.com/careers',
    status: 'Actively Hiring',
    location: 'Chennai, Tamil Nadu, India',
  },
  swiggy: {
    name: 'Swiggy',
    overview: 'Swiggy is India\'s leading on-demand food and convenience delivery platform, connecting consumers with restaurants and stores.',
    website: 'https://careers.swiggy.com',
    status: 'Actively Hiring',
    location: 'Bangalore, Karnataka, India',
  },
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const key = id.toLowerCase().trim();

    // Check if metadata exists or default
    const meta = COMPANY_METADATA[key];
    if (!meta) {
      // Find one job with this company name to resolve its casing
      const sampleJob = await prisma.job.findFirst({
        where: {
          company: {
            equals: id,
            mode: 'insensitive',
          },
        },
      });

      if (!sampleJob) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      const companyName = sampleJob.company;
      const defaultMeta = {
        name: companyName,
        overview: `${companyName} is a company in our jobs network listing active career opportunities.`,
        website: sampleJob.careerPortalUrl || 'https://careers.google.com',
        status: 'Actively Hiring',
        location: sampleJob.location || 'Worldwide',
      };

      // Get jobs for this company
      const openJobs = await prisma.job.findMany({
        where: {
          company: {
            equals: companyName,
            mode: 'insensitive',
          },
        },
        orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
      });

      return NextResponse.json({
        company: {
          id: key,
          ...defaultMeta,
          openJobs,
        },
      });
    }

    // Get jobs for this company
    const openJobs = await prisma.job.findMany({
      where: {
        company: {
          equals: meta.name,
          mode: 'insensitive',
        },
      },
      orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      company: {
        id: key,
        ...meta,
        openJobs,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
