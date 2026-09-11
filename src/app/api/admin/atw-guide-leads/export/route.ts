import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * On-demand CSV export of Access to Work funding-guide leads, formatted for
 * a straight upload to Meta Ads Manager (Custom Audiences) or Google Ads
 * (Customer Match) — both hash the raw emails client-side on upload, so no
 * hashing is done here. Only includes leads who actually received the
 * guide (email_sent = true), not ones that failed to send.
 *
 * Usage: GET /api/admin/atw-guide-leads/export?token=<ADMIN_EXPORT_SECRET>
 * Not linked from the app anywhere — visit the URL directly when you want
 * a fresh export (the brief suggested waiting until volume clears ~200).
 */

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_EXPORT_SECRET;
  const token = req.nextUrl.searchParams.get('token');
  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createSupabaseServerClient();
  const { data: leads, error } = await db
    .from('atw_guide_leads')
    .select('email, first_name, applying_via, created_at')
    .eq('email_sent', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/atw-guide-leads/export] query error:', error);
    return NextResponse.json({ error: 'Could not load leads' }, { status: 500 });
  }

  const header = 'email,first_name,applying_via,created_at';
  const rows = (leads || []).map((l) =>
    [
      csvEscape(l.email ?? ''),
      csvEscape(l.first_name ?? ''),
      csvEscape(l.applying_via ?? ''),
      csvEscape(l.created_at ?? ''),
    ].join(',')
  );
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="atw-guide-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
