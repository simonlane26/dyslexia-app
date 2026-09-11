import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseServerClient } from '@/lib/supabase';
import { buildAccessToWorkGuideEmail } from '@/lib/email/accessToWorkGuideEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APPLYING_VIA = ['access-to-work', 'school-university', 'employer', 'not-sure'] as const;

function getSiteOrigin(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').trim();
  return fromEnv || 'https://www.dyslexiawrite.com';
}

// ---------- simple in-memory rate limit (resets on deploy) — no CAPTCHA per spec
const submissionsByIp = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 8;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = submissionsByIp.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    submissionsByIp.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const H = { 'Cache-Control': 'no-store' };

  try {
    const body = await req.json().catch(() => null as any);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: H });
    }

    // Honeypot — a real visitor never fills this (it's visually hidden on the form)
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      // Pretend success so bots don't learn to leave it blank
      return NextResponse.json({ ok: true }, { status: 200, headers: H });
    }

    const email = String(body.email ?? '').trim().toLowerCase();
    const firstName = String(body.first_name ?? '').trim().slice(0, 80) || null;
    const applyingVia = APPLYING_VIA.includes(body.applying_via) ? body.applying_via : null;
    const source = String(body.source ?? 'homepage').trim().slice(0, 60) || 'homepage';

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400, headers: H });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429, headers: H });
    }

    const db = createSupabaseServerClient();
    const { data: lead, error: insertErr } = await db
      .from('atw_guide_leads')
      .insert({ email, first_name: firstName, applying_via: applyingVia, source })
      .select('id')
      .single();

    if (insertErr || !lead) {
      console.error('[access-to-work-guide/lead] insert error:', insertErr);
      return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 500, headers: H });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('[access-to-work-guide/lead] RESEND_API_KEY is not configured — lead saved but no email sent.');
      return NextResponse.json({ error: 'Email sending is not configured yet.' }, { status: 500, headers: H });
    }

    const origin = getSiteOrigin();
    const { subject, html, text } = buildAccessToWorkGuideEmail({
      firstName,
      guideUrl: `${origin}/guides/access-to-work-funding-guide.pdf`,
      appUrl: `${origin}/sign-up`,
      atwUrl: `${origin}/access-to-work`,
    });

    try {
      const resend = new Resend(resendKey);
      const from = process.env.RESEND_FROM_EMAIL || 'DyslexiaWrite <results@dyslexiawrite.com>';
      const replyTo = process.env.SCREENER_REPLY_TO_EMAIL || undefined;

      await resend.emails.send({
        from,
        to: email,
        subject,
        html,
        text,
        ...(replyTo ? { replyTo } : {}),
      });

      await db.from('atw_guide_leads').update({ email_sent: true }).eq('id', lead.id);
    } catch (sendErr) {
      console.error('[access-to-work-guide/lead] Resend send error:', sendErr);
      return NextResponse.json(
        { error: 'Your details were saved, but the email could not be sent. Please try again.' },
        { status: 502, headers: H }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: H });
  } catch (err) {
    console.error('[access-to-work-guide/lead] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500, headers: H });
  }
}
