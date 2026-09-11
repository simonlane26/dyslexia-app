'use client';

import Link from 'next/link';
import { landing } from '@/lib/landingTheme';
import { AccessToWorkGuideOptIn } from '@/components/AccessToWorkGuideOptIn';

export default function AccessToWorkGuideClient() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: landing.bg }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '70px 20px 20px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            fontSize: '13px',
            fontWeight: 700,
            color: landing.amberDark,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '14px',
          }}
        >
          Free guide
        </div>
        <h1
          style={{
            fontFamily: landing.fontDisplay,
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 600,
            lineHeight: 1.2,
            color: landing.ink,
            marginBottom: '16px',
          }}
        >
          Waiting on Access to Work funding? Don&apos;t lose your spot in the queue.
        </h1>
        <p style={{ fontSize: '16.5px', color: landing.inkMuted, lineHeight: 1.65, maxWidth: '580px', margin: '0 auto' }}>
          Get our free guide to the Access to Work assessment process for assistive software —
          the step-by-step application, the wording that speeds up approval, and a funding request
          template — sent straight to your inbox.
        </p>
      </div>

      <AccessToWorkGuideOptIn source="access-to-work-guide-page" />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '10px 20px 80px', textAlign: 'center' }}>
        <p style={{ fontSize: '14.5px', color: landing.inkFaint }}>
          Already know the process, or ready to apply now?{' '}
          <Link href="/access-to-work" style={{ color: landing.teal, fontWeight: 600 }}>
            Read the full Access to Work walkthrough →
          </Link>
        </p>
      </div>
    </div>
  );
}
