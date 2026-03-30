export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { generatePassportDocx } from '@/lib/passport-generator';

const VOICE_LABELS: Record<string, string> = {
  EXAVITQu4vr4xnSDxMaL: 'Rachelle',
  ZF6FPAbjXT4488VcRRnw: 'Molly',
  bVMeCyTHy58xNoL34h3p: 'Liam',
  '21m00Tcm4TlvDq8ikWAM': 'Sarah',
  pNInz6obpgDQGcFmaJgB: 'Adam Stone',
  jBpfuIE2acCO8z3wKNLl: 'Jen',
  tMyQcCxfGDdIt7wJ2RQw: 'Marie Alice (French)',
  dFA3XRddYScy6ylAYTIO: 'Helmut (German)',
  m7yTemJqdIqrcNleANfX: 'Anna Maria (Spanish)',
};

const FEATURE_LABELS: Record<string, string> = {
  simplify: 'AI Simplification',
  readAloud: 'Read Aloud',
  coach: 'Writing Coach',
  decoder: 'Document Decoder',
  grammarCheck: 'Grammar Check',
};

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
  const isPro = !!meta.isPro;
  const workplaceId = (meta.workplaceId as string) ?? null;
  const plan = (meta.plan as string) ?? (isPro ? 'Pro' : 'Free');

  // Preferences come from the client (localStorage values)
  const body = await req.json().catch(() => ({}));
  const prefs = {
    font: (body.font as string) || 'Lexend',
    fontSize: (body.fontSize as number) || 18,
    bgColour: (body.bgColour as string) || 'White',
    darkMode: !!(body.darkMode as boolean),
    voiceId: (body.voiceId as string) || '',
  };

  let db;
  try { db = createSupabaseServerClient(); } catch (e) {
    return NextResponse.json({ error: `DB unavailable: ${e instanceof Error ? e.message : String(e)}` }, { status: 503 });
  }

  // ── 1. User name from Clerk ──────────────────────────────
  const clerkRes = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  const clerkUser = clerkRes.ok ? await clerkRes.json() : null;
  const userName = clerkUser
    ? [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(' ') || clerkUser.email_addresses?.[0]?.email_address || 'DyslexiaWrite User'
    : 'DyslexiaWrite User';

  // ── 2. Organisation from workplace (if linked) ───────────
  let organisation = '[Your Organisation]';
  if (workplaceId) {
    const { data: wp } = await db.from('workplaces').select('name').eq('id', workplaceId).maybeSingle();
    if (wp?.name) organisation = wp.name;
  }

  // ── 3. Feature usage — last 90 days ─────────────────────
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: usageLogs } = await db
    .from('feature_usage_logs')
    .select('feature, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', ninetyDaysAgo);

  const logs = usageLogs ?? [];

  // Count unique days per feature
  const featureDaySets: Record<string, Set<string>> = {};
  const allActiveDays = new Set<string>();
  for (const row of logs) {
    const day = row.logged_at.slice(0, 10);
    allActiveDays.add(day);
    if (!featureDaySets[row.feature]) featureDaySets[row.feature] = new Set();
    featureDaySets[row.feature].add(day);
  }
  const activeDays = allActiveDays.size;

  const featureUsage = Object.entries(featureDaySets)
    .map(([feature, days]) => ({
      feature,
      label: FEATURE_LABELS[feature] ?? feature,
      days: days.size,
      pct: activeDays > 0 ? Math.round((days.size / activeDays) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  // ── 4. Decoder count ─────────────────────────────────────
  const { data: decoderRows } = await db
    .from('decoder_logs')
    .select('id')
    .eq('user_id', userId)
    .gte('decoded_at', ninetyDaysAgo);
  const documentsDecoded = (decoderRows ?? []).length;

  // ── 5. Simplifications from workplace_members ────────────
  let totalSimplifications = 0;
  if (workplaceId) {
    const { data: member } = await db
      .from('workplace_members')
      .select('simplifications_used')
      .eq('clerk_user_id', userId)
      .eq('workplace_id', workplaceId)
      .maybeSingle();
    totalSimplifications = member?.simplifications_used ?? 0;
  } else {
    // Fall back to feature log count as a proxy
    totalSimplifications = logs.filter(l => l.feature === 'simplify').length;
  }

  // ── 6. Period label ──────────────────────────────────────
  const now = new Date();
  const periodStart = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const periodLabel = `${periodStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} – ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  // ── 7. Build passport data ───────────────────────────────
  const passportData = {
    user: {
      name: userName,
      organisation,
      generatedDate: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      periodLabel,
      licenceType: plan.charAt(0).toUpperCase() + plan.slice(1),
    },
    preferences: {
      font: prefs.font,
      fontSize: prefs.fontSize,
      bgColour: prefs.bgColour,
      darkMode: prefs.darkMode,
      voiceLabel: VOICE_LABELS[prefs.voiceId] || 'Browser default',
    },
    usage: {
      activeDays: activeDays || 0,
      totalDays: 90,
      featureUsage: featureUsage.length > 0 ? featureUsage : [
        { feature: 'simplify', label: 'AI Simplification', days: 0, pct: 0 },
      ],
      documentsDecoded,
      totalSimplifications,
    },
  };

  // ── 8. Generate and return docx ──────────────────────────
  const buffer = await generatePassportDocx(passportData);
  const filename = `AccessibilityPassport-${now.toISOString().slice(0, 10)}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
