export const runtime = 'nodejs';         // Node runtime (pdf-parse & mammoth need Node)
export const dynamic = 'force-dynamic';  // allow file uploads
export const maxDuration = 60;

import { NextResponse } from 'next/server';

// Normalize a Node Buffer into a *real* ArrayBuffer (never SharedArrayBuffer)
function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = buf;
  // If it's already a plain ArrayBuffer, slice a view
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  // Otherwise (SharedArrayBuffer), copy into a new ArrayBuffer
  const ab = new ArrayBuffer(byteLength);
  new Uint8Array(ab).set(new Uint8Array(buf));
  return ab;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data with a "file" field.' },
        { status: 415 }
      );
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(arrayBuffer);
    const mime = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();

    let extractedText = '';

    if (mime.includes('pdf') || name.endsWith('.pdf')) {
      // Dynamically import to avoid build-time evaluation
      const pdfParseMod = await import('pdf-parse');
      const pdfParse = (pdfParseMod as any).default || (pdfParseMod as any);
      const data = await pdfParse(nodeBuffer);
      extractedText = (data?.text as string) ?? '';
    } else if (
      mime.includes('officedocument.wordprocessingml.document') ||
      name.endsWith('.docx')
    ) {
      const mammothMod = await import('mammoth');
      const mammoth = (mammothMod as any).default || (mammothMod as any);
      const res = await mammoth.extractRawText({ arrayBuffer: toArrayBuffer(nodeBuffer) });
      extractedText = (res?.value as string) ?? '';
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or DOCX.' },
        { status: 415 }
      );
    }

    const clean = extractedText.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').trim();
    return NextResponse.json({ text: clean });
  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to parse file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

