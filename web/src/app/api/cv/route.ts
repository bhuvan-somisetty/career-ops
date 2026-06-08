import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const rootPath = path.resolve(process.cwd(), '..');
const cvPath = path.join(rootPath, 'cv.md');

const mockCv = `# Jane Smith
Email: jane@example.com | Phone: +1-555-0123 | SF, CA
LinkedIn: linkedin.com/in/janesmith | Portfolio: https://janesmith.dev

## Professional Summary
ML Engineer turned AI product builder. 5+ years of experience building and putting large language model systems, agentic workflows, and distributed platform architectures into production.

## Core Speciality & Skills
- **AI/ML**: PyTorch, Transformers, LLM Observability, Evaluation, LangChain, LlamaIndex
- **Engineering**: Next.js, Node.js, Go (Bubble Tea), Python, Docker, Kubernetes, AWS, PostgreSQL
- **Practices**: CI/CD, MLOps, System Architecture, PRD development

## Experience
### Lead AI Platform Engineer | Autonomous Labs (2024 - Present)
- Designed and built core LLM orchestration pipelines supporting 4.2M daily invocations.
- Reduced inference cost by 38% via selective caching, model cascading, and quantization pipelines.
- Standardized AI evaluation system across 14 product squads, increasing agent reliability.

### Senior Software Engineer (Platform) | ScaleSaaS Corp (2021 - 2024)
- Built microservices using Go and PostgreSQL handling 12k concurrent requests.
- Led migration of backend systems to Kubernetes, improving deployment frequency by 4x.
- Mentored 4 engineers and collaborated with product design leads to create premium internal tooling dashboards.
`;

export async function GET() {
  try {
    if (!fs.existsSync(cvPath)) {
      return NextResponse.json({ content: mockCv, isMock: true });
    }
    const content = fs.readFileSync(cvPath, 'utf8');
    if (!content.trim()) {
      return NextResponse.json({ content: mockCv, isMock: true });
    }
    return NextResponse.json({ content, isMock: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
