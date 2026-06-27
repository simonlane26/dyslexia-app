export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { analyseDocument } from '@/lib/document-decoder';
import { createSupabaseServerClient } from '@/lib/supabase';

const FREE_DECODE_LIMIT = 2;

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = buf;
  if (buffer instanceof ArrayBuffer) return buffer.slice(byteOffset, byteOffset + byteLength);
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
    const mode = (form.get('mode') as string) || 'import'; // 'import' | 'decode'

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
    }

    let userId: string | null = null;
    let isPro = false;
    let workplaceId: string | null = null;

    if (mode === 'decode') {
      const session = await auth();
      userId = session.userId ?? null;
      if (!userId) return NextResponse.json({ error: 'Sign in to use Document Decoder' }, { status: 401 });

      const meta = (session.sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
      isPro = !!meta.isPro;
      workplaceId = (meta.workplaceId as string) ?? null;

      // Rate-limit free users to FREE_DECODE_LIMIT per calendar month
      if (!isPro) {
        const month = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
        let db;
        try { db = createSupabaseServerClient(); } catch { /* no Supabase — skip limit */ }
        if (db) {
          const { data: usage } = await db
            .from('decoder_usage')
            .select('count')
            .eq('user_id', userId)
            .eq('month', month)
            .maybeSingle();
          const used = (usage as any)?.count ?? 0;
          if (used >= FREE_DECODE_LIMIT) {
            return NextResponse.json(
              { error: 'limit_reached', used, limit: FREE_DECODE_LIMIT },
              { status: 429 }
            );
          }
        }
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(arrayBuffer);
    const mime = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();

    let extractedText = '';

    if (mime.includes('pdf') || name.endsWith('.pdf')) {
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
    } else if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/.test(name)) {
      // GPT-4o vision OCR for images
      const base64 = nodeBuffer.toString('base64');
      const openai = new OpenAI();
      const ocrResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mime || 'image/jpeg'};base64,${base64}`, detail: 'high' },
            },
            {
              type: 'text',
              text: 'Extract ALL text from this document image exactly as written. Preserve structure, dates, amounts, and reference numbers precisely.',
            },
          ],
        }],
        max_tokens: 4000,
      });
      extractedText = ocrResponse.choices[0]?.message?.content || '';
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload a PDF, DOCX, or image (JPG/PNG).' },
        { status: 415 }
      );
    }

    const clean = extractedText.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').trim();

    if (mode === 'decode') {
      const analysis = await analyseDocument(clean);

      // Record usage and log (fire-and-forget — don't block the response)
      if (userId) {
        const month = new Date().toISOString().slice(0, 7);
        let db;
        try { db = createSupabaseServerClient(); } catch { /* skip */ }
        if (db) {
          // Increment monthly counter (also handles first use via upsert)
          void db.rpc('increment_decoder_usage', { p_user_id: userId, p_month: month });

          // Log per-decode row for workplace analytics
          void db.from('decoder_logs').insert({
            user_id: userId,
            workplace_id: workplaceId || null,
            document_type: analysis.documentType || 'Document',
          });
        }
      }

      return NextResponse.json({ text: clean, analysis, decoded: true });
    }

    return NextResponse.json({ text: clean });
  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to parse file' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
