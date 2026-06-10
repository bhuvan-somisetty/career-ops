import { NextResponse } from 'next/server';
import { storeAvatar, getAvatarFile, getAvatarMeta, removeAvatar } from '@/lib/studentService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Store / replace the student's profile picture binary + metadata.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image uploaded.' }, { status: 400 });
    }
    const mime = file.type || 'application/octet-stream';
    if (!ALLOWED.has(mime) && !ALLOWED_EXT.test(file.name || '')) {
      return NextResponse.json({ error: 'Only JPG, JPEG, PNG, or WEBP images are allowed.' }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 413 });
    }

    const data = Buffer.from(await file.arrayBuffer());
    await storeAvatar(id, { fileName: file.name || 'avatar', mimeType: mime, data });

    const avatar = await getAvatarMeta(id);
    return NextResponse.json({ ok: true, avatar });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'P2025') return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    return NextResponse.json({ error: e.message || 'Failed to store image.' }, { status: 500 });
  }
}

// Serve the stored profile picture (inline).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const file = await getAvatarFile(id);
    if (!file) return NextResponse.json({ error: 'No profile picture on file.' }, { status: 404 });

    return new NextResponse(new Uint8Array(file.data), {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Length': String(file.data.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// Remove the stored profile picture (falls back to initials avatar).
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await removeAvatar(id);
    const avatar = await getAvatarMeta(id);
    return NextResponse.json({ ok: true, avatar });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'P2025') return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    return NextResponse.json({ error: e.message || 'Failed to remove image.' }, { status: 500 });
  }
}
