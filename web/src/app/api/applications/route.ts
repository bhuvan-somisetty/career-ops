import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const rootPath = path.resolve(process.cwd(), '..');
const appsPath = path.join(rootPath, 'data', 'applications.md');

// Mock data to provide a premium experience when no data exists yet
const mockApplications = [
  {
    id: '001',
    date: '2026-06-01',
    company: 'Linear',
    role: 'Staff Product Designer',
    score: '4.8/5',
    status: 'Interview',
    pdf: '✅',
    report: '001-linear-staff-designer',
    notes: 'Recruiter screen done. Portfolio presentation scheduled for next Tuesday.'
  },
  {
    id: '002',
    date: '2026-06-03',
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    score: '4.6/5',
    status: 'Applied',
    pdf: '✅',
    report: '002-stripe-senior-frontend',
    notes: 'Applied via referral. Resume matched 92% of JD keywords.'
  },
  {
    id: '003',
    date: '2026-06-04',
    company: 'Ashby',
    role: 'Full Stack Engineer',
    score: '4.2/5',
    status: 'Evaluated',
    pdf: '❌',
    report: '003-ashby-full-stack',
    notes: 'AI match report completed. Ready to tailor CV and apply.'
  },
  {
    id: '004',
    date: '2026-06-05',
    company: 'Vercel',
    role: 'Senior Developer Advocate',
    score: '4.7/5',
    status: 'Interview',
    pdf: '✅',
    report: '004-vercel-advocate',
    notes: 'Technical assessment submitted. High engagement on my recent blog posts.'
  },
  {
    id: '005',
    date: '2026-06-06',
    company: 'Notion',
    role: 'Product Lead, AI Workspaces',
    score: '4.9/5',
    status: 'Offer',
    pdf: '✅',
    report: '005-notion-ai-lead',
    notes: 'Verbal offer received. Waiting on written details. Comp target: ₹20L base.'
  },
  {
    id: '006',
    date: '2026-06-06',
    company: 'OpenAI',
    role: 'Research Engineer, Alignment',
    score: '3.9/5',
    status: 'SKIP',
    pdf: '❌',
    report: '006-openai-research',
    notes: 'Requires 4+ years of PyTorch scaling experience. Discarded due to core skill gap.'
  },
  {
    id: '007',
    date: '2026-06-07',
    company: 'Wellfound',
    role: 'Founding Engineer (SaaS Startup)',
    score: '4.5/5',
    status: 'Responded',
    pdf: '✅',
    report: '007-wellfound-founding',
    notes: 'Founders replied to cold email. Coffee chat scheduled.'
  }
];

export async function GET() {
  try {
    if (!fs.existsSync(appsPath)) {
      // Create empty folder data if missing
      fs.mkdirSync(path.dirname(appsPath), { recursive: true });
      // Write template header
      fs.writeFileSync(
        appsPath,
        `# Applications Tracker\n\n| # | Date | Company | Role | Score | Status | PDF | Report | Notes |\n|---|------|---------|------|-------|--------|-----|--------|-------|\n`,
        'utf8'
      );
      return NextResponse.json(mockApplications);
    }

    const fileContent = fs.readFileSync(appsPath, 'utf8');
    const lines = fileContent.split('\n');
    const apps: any[] = [];

    for (const line of lines) {
      if (line.startsWith('|') && !line.includes('---') && !line.includes('Company') && !line.includes('#')) {
        const parts = line.split('|').map(s => s.trim());
        if (parts.length >= 9) {
          apps.push({
            id: parts[1],
            date: parts[2],
            company: parts[3],
            role: parts[4],
            score: parts[5],
            status: parts[6],
            pdf: parts[7],
            report: parts[8],
            notes: parts[9] || ''
          });
        }
      }
    }

    // If applications.md is empty (except for header), return mock data for a premium dashboard preview
    if (apps.length === 0) {
      return NextResponse.json(mockApplications);
    }

    return NextResponse.json(apps);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, notes } = await request.json();

    if (!fs.existsSync(appsPath)) {
      return NextResponse.json({ error: 'Tracker file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(appsPath, 'utf8');
    const lines = fileContent.split('\n');
    let updated = false;

    const newLines = lines.map(line => {
      if (line.startsWith('|')) {
        const parts = line.split('|').map(s => s.trim());
        // parts[1] is the entry ID
        if (parts[1] === id) {
          updated = true;
          // Format: | ID | Date | Company | Role | Score | Status | PDF | Report | Notes |
          if (status !== undefined) parts[6] = status;
          if (notes !== undefined) parts[9] = notes;
          return `| ${parts[1]} | ${parts[2]} | ${parts[3]} | ${parts[4]} | ${parts[5]} | ${parts[6]} | ${parts[7]} | ${parts[8]} | ${parts[9]} |`;
        }
      }
      return line;
    });

    if (updated) {
      fs.writeFileSync(appsPath, newLines.join('\n'), 'utf8');
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Application entry not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
