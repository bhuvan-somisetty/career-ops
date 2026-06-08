import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const rootPath = path.resolve(process.cwd(), '..');
const reportsPath = path.join(rootPath, 'reports');

const mockReportsList = [
  {
    id: '001',
    company: 'Linear',
    role: 'Staff Product Designer',
    date: '2026-06-01',
    score: '4.8',
    archetype: 'AI Solutions Architect',
    legitimacy: 'High Confidence',
    slug: '001-linear-staff-designer'
  },
  {
    id: '002',
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    date: '2026-06-03',
    score: '4.6',
    archetype: 'Platform / LLMOps',
    legitimacy: 'High Confidence',
    slug: '002-stripe-senior-frontend'
  },
  {
    id: '003',
    company: 'Ashby',
    role: 'Full Stack Engineer',
    date: '2026-06-04',
    score: '4.2',
    archetype: 'Platform / LLMOps',
    legitimacy: 'High Confidence',
    slug: '003-ashby-full-stack'
  },
  {
    id: '004',
    company: 'Vercel',
    role: 'Senior Developer Advocate',
    date: '2026-06-05',
    score: '4.7',
    archetype: 'AI Forward Deployed Engineer',
    legitimacy: 'High Confidence',
    slug: '004-vercel-advocate'
  },
  {
    id: '005',
    company: 'Notion',
    role: 'Product Lead, AI Workspaces',
    date: '2026-06-06',
    score: '4.9',
    archetype: 'Technical AI Product Manager',
    legitimacy: 'High Confidence',
    slug: '005-notion-ai-lead'
  }
];

export async function GET() {
  try {
    if (!fs.existsSync(reportsPath)) {
      fs.mkdirSync(reportsPath, { recursive: true });
      return NextResponse.json(mockReportsList);
    }

    const files = fs.readdirSync(reportsPath).filter(f => /^\d{3}-/.test(f) && f.endsWith('.md'));
    if (files.length === 0) {
      return NextResponse.json(mockReportsList);
    }

    const reports = files.map(file => {
      const id = file.slice(0, 3);
      const slug = file.replace('.md', '');
      const fullPath = path.join(reportsPath, file);
      const content = fs.readFileSync(fullPath, 'utf8');

      // Parse headers
      const getValue = (key: string) => {
        const match = content.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.*)`));
        return match ? match[1].trim() : '';
      };

      const dateMatch = content.match(/\*\*Date:\*\*\s*(.*)/);
      const scoreMatch = content.match(/\*\*Score:\*\*\s*(.*)/);
      const companyMatch = content.match(/# Evaluation:\s*([^\u2014—\n]*)/);
      const roleMatch = content.match(/# Evaluation:\s*[^\u2014—]*\u2014\s*(.*)/) || content.match(/# Evaluation:\s*[^\u2014—]*\s*—\s*(.*)/);

      return {
        id,
        company: companyMatch ? companyMatch[1].trim() : 'Unknown',
        role: roleMatch ? roleMatch[1].trim() : 'Unknown',
        date: dateMatch ? dateMatch[1].trim() : '',
        score: scoreMatch ? scoreMatch[1].replace('/5', '').trim() : 'N/A',
        archetype: getValue('Archetype') || 'General',
        legitimacy: getValue('Legitimacy') || 'High Confidence',
        slug
      };
    });

    return NextResponse.json(reports);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
