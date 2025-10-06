export const runtime = 'nodejs';            // ensure Node runtime (not Edge)
export const dynamic = 'force-dynamic';     // allow file uploads

import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Helper: extract text from DOCX buffer with Mammoth
async function extractDocxText(buffer: ArrayBuffer | Buffer) {
  // mammoth prefers ArrayBuffer
  const arrayBuffer = buffer instanceof Buffer ? buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) : buffer;
  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer as ArrayBuffer });
  return result.value || '';
}

// Helper: extract text from PDF buffer with pdf-parse
async function extractPdfText(buffer: Buffer) {
  const data = await pdfParse(buffer);
  return data.text || '';
}

export async function POST(req: Request) {
  try {
    // Get multipart form data
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the uploaded file into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = file.type?.toLowerCase() || '';
    const name = file.name?.toLowerCase() || '';

    let text = '';

    // Detect by MIME or filename
    if (mime.includes('pdf') || name.endsWith('.pdf')) {
      text = await extractPdfText(buffer);
    } else if (
      mime.includes('officedocument.wordprocessingml.document') ||
      name.endsWith('.docx')
    ) {
      text = await extractDocxText(buffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or DOCX.' }, { status: 415 });
    }

    // Optional: trim & squash whitespace
    const clean = text.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').trim();

    return NextResponse.json({ text: clean });
  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 });
  }
}
