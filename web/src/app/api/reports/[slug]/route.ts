import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const rootPath = path.resolve(process.cwd(), '..');
const reportsPath = path.join(rootPath, 'reports');

const mockReportDetails: Record<string, string> = {
  '001-linear-staff-designer': `# Evaluation: Linear — Staff Product Designer

**Date:** 2026-06-01
**Archetype:** AI Solutions Architect
**Score:** 4.8/5
**Legitimacy:** High Confidence

---

## Block A: Core Requirements Fit (5/5)
Linear is seeking a designer who deeply understands workspace orchestration and design-system scalability. The candidate matches all parameters:
*   **Design-systems alignment**: Candidate's track record includes building visual design editors.
*   **Interaction fidelity**: Match is excellent.

## Block B: Technical Competence (5/5)
Linear's engineering-centric design culture fits the candidate's hybrid background:
*   **TypeScript & React competency**: Strong match.
*   **Design tool building experience**: High alignment.

## Block C: Cultural Fit (4.5/5)
High agency, self-directed, and obsessed with details.
`,
  '002-stripe-senior-frontend': `# Evaluation: Stripe — Senior Frontend Engineer

**Date:** 2026-06-03
**Archetype:** Platform / LLMOps
**Score:** 4.6/5
**Legitimacy:** High Confidence

---

## Block A: Core Requirements Fit (4.5/5)
Stripe requires highly performant dashboard architectures. The candidate has built systems handling 12k concurrent requests:
*   **Performance optimization**: Matches requirements.
*   **API integration experience**: Matches.
`
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = path.join(reportsPath, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      const mockContent = mockReportDetails[slug] || `# Evaluation Report: Mock Data

**Date:** 2026-06-06
**Score:** 4.5/5
**Legitimacy:** High Confidence

---

## Block A: Fit Analysis
This is a high-fidelity mock report showing detail structure.
`;
      return NextResponse.json({ content: mockContent, isMock: true });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json({ content, isMock: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
