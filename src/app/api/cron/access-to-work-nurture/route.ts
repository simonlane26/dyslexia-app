import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseServerClient } from '@/lib/supabase';
import { buildDay14Email } from '@/lib/email/accessToWorkGuideDay14Email';
import { buildDay35Email } from '@/lib/email/accessToWorkGuideDay35Email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Cap per tier per run — this list will never realistically be large enough
// to need pagination, but a hard cap keeps a single run bounded regardless.
const BATCH_LIMIT = 200;

function getSiteOrigin(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').trim();
  return fromEnv || 'https://www.dyslexiawrite.com';
}

interface Lead {
  id: string;
  email: string;
  first_name: string | null;
}

async function sendTier(
  db: ReturnType<typeof createSupabaseServerClient>,
  resend: Resend,
  from: string,
  replyTo: string | undefined,
  tier: 'day14' | 'day35',
  cutoffIso: string
): Promise<{ sent: number; failed: number }> {
  const flagCol = tier === 'day14' ? 'day14_sent' : 'day35_sent';
  const origin = getSiteOrigin();

  const { data: leads, error } = await db
    .from('atw_guide_leads')
    .select('id, email, first_name')
    .eq('email_sent', true)
    .eq(flagCol, false)
    .lte('created_at', cutoffIso)
    .limit(BATCH_LIMIT);

  if (error) {
    console.error(`[cron/atw-nurture] ${tier} query error:`, error);
    return { sent: 0, failed: 0 };
  }
  if (!leads || leads.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const lead of leads as Lead[]) {
    try {
      const { subject, html, text } =
        tier === 'day14'
          ? buildDay14Email({
              firstName: lead.first_name,
              guideUrl: `${origin}/guides/access-to-work-funding-guide.pdf`,
              appUrl: `${origin}/sign-up`,
            })
          : buildDay35Email({
              firstName: lead.first_name,
              appUrl: `${origin}/sign-up`,
              atwUrl: `${origin}/access-to-work`,
            });

      await resend.emails.send({
        from,
        to: lead.email,
        subject,
        html,
        text,
        ...(replyTo ? { replyTo } : {}),
      });

      await db.from('atw_guide_leads').update({ [flagCol]: true }).eq('id', lead.id);
      sent += 1;
    } catch (sendErr) {
      console.error(`[cron/atw-nurture] ${tier} send failed for lead ${lead.id}:`, sendErr);
      failed += 1;
      // Leave the flag false — it'll be retried on the next run.
    }
  }

  return { sent, failed };
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
  // when CRON_SECRET is set as an env var — this rejects any other caller.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('[cron/atw-nurture] RESEND_API_KEY is not configured.');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const db = createSupabaseServerClient();
  const resend = new Resend(resendKey);
  const from = process.env.RESEND_FROM_EMAIL || 'DyslexiaWrite <results@dyslexiawrite.com>';
  const replyTo = process.env.SCREENER_REPLY_TO_EMAIL || undefined;

  const now = Date.now();
  const day14Cutoff = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
  const day35Cutoff = new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString();

  const [day14Result, day35Result] = await Promise.all([
    sendTier(db, resend, from, replyTo, 'day14', day14Cutoff),
    sendTier(db, resend, from, replyTo, 'day35', day35Cutoff),
  ]);

  const result = { day14: day14Result, day35: day35Result };
  console.log('[cron/atw-nurture] run complete:', JSON.stringify(result));
  return NextResponse.json({ ok: true, ...result });
}
