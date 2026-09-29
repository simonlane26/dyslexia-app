import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES } from '@/lib/guides-data';
import { landing } from '@/lib/landingTheme';

export const metadata: Metadata = {
  title: 'Guides — Writing and Reading With Dyslexia',
  description:
    'Practical guides on writing with dyslexia, dyslexia-friendly formatting, and common dyslexic spelling patterns — independent of any specific tool.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/guides' },
};

export default function GuidesPage() {
  return (
    <div style={{ minHeight: '100vh', background: landing.bg }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '72px 20px 90px' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: landing.amberDark,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '14px',
            }}
          >
            Guides
          </div>
          <h1 style={{ fontFamily: landing.fontDisplay, fontSize: 'clamp(28px, 4.5vw, 38px)', fontWeight: 600, marginBottom: '14px', color: landing.ink }}>
            Writing and reading with dyslexia
          </h1>
          <p style={{ color: landing.inkMuted, fontSize: '16px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
            Practical guides on writing, formatting, and proofreading with dyslexia — useful whether or not you ever try DyslexiaWrite.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              style={{
                display: 'block',
                padding: '28px 30px',
                borderRadius: '16px',
                border: `1px solid ${landing.line}`,
                backgroundColor: landing.panel,
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: '12px', color: landing.inkFaint, marginBottom: '8px' }}>
                {guide.readingTime}
              </div>
              <h2 style={{ fontFamily: landing.fontDisplay, fontSize: '20px', fontWeight: 600, color: landing.ink, marginBottom: '8px' }}>
                {guide.title}
              </h2>
              <p style={{ fontSize: '14.5px', color: landing.inkMuted, lineHeight: 1.6, marginBottom: '10px' }}>
                {guide.description}
              </p>
              <span style={{ fontSize: '13px', fontWeight: 600, color: landing.amberDark }}>
                Read guide →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
