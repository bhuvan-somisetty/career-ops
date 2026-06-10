import { NextResponse } from 'next/server';
import { storeResume, getResumeFile, getResumeMeta } from '@/lib/studentService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;

// Store / replace the student's resume binary + metadata.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No resume file uploaded.' }, { status: 400 });
    }
    const mime = file.type || 'application/octet-stream';
    if (!ALLOWED.has(mime) && !ALLOWED_EXT.test(file.name || '')) {
      return NextResponse.json({ error: 'Only PDF, DOC, or DOCX files are allowed.' }, { status: 415 });
    }

    const source = (form.get('source') as string) || 'upload';
    const data = Buffer.from(await file.arrayBuffer());
    await storeResume(id, { fileName: file.name || 'resume', mimeType: mime, source, data });

    const resume = await getResumeMeta(id);
    return NextResponse.json({ ok: true, resume });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'P2025') return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    return NextResponse.json({ error: e.message || 'Failed to store resume.' }, { status: 500 });
  }
}

// View (inline) or download (?download=1) the stored resume.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const file = await getResumeFile(id);
    if (!file) return NextResponse.json({ error: 'No resume on file.' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const disposition = searchParams.get('download') ? 'attachment' : 'inline';
    const safeName = file.fileName.replace(/[^\w.\-]+/g, '_');

    return new NextResponse(new Uint8Array(file.data), {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `${disposition}; filename="${safeName}"`,
        'Content-Length': String(file.data.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
