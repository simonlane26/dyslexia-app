'use client';

import Link from 'next/link';
import { landing } from '@/lib/landingTheme';
import { Reveal } from './Reveal';

const COMPARISONS = [
  {
    name: 'TextHelp Read&Write',
    hook: '70–80% cheaper, plus AI document decoding and reading progress tracking TextHelp doesn’t have.',
    href: '/compare',
  },
  {
    name: 'Grammarly',
    hook: 'Grammarly misses homophones and phonetic spelling errors — built specifically for dyslexic writers.',
    href: '/vs/grammarly',
  },
  {
    name: 'ClaroRead',
    hook: 'Roughly a third of the price, with AI-based correction instead of dictionary lookup.',
    href: '/vs/claroread',
  },
  {
    name: 'Microsoft Immersive Reader',
    hook: 'Free and great for reading — but it won’t help you write. Dyslexia Write does both.',
    href: '/vs/immersive-reader',
  },
] as const;

export function ComparisonTeaser() {
  return (
    <div style={{ padding: '60px 20px', backgroundColor: landing.bgAlt }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
              How we compare
            </div>
            <h2 style={{ fontFamily: landing.fontDisplay, fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 600, marginBottom: '10px', color: landing.ink }}>
              Already using something else?
            </h2>
            <p style={{ color: landing.inkMuted, fontSize: '15px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
              Honest, factual comparisons — including where the other tool wins.
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '16px',
          }}
        >
          {COMPARISONS.map((c) => (
            <Reveal key={c.href}>
              <Link
                href={c.href}
                style={{
                  display: 'block',
                  height: '100%',
                  padding: '22px',
                  borderRadius: '14px',
                  border: `1px solid ${landing.line}`,
                  backgroundColor: landing.panel,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, transform 0.15s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = landing.amber;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = landing.line;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: landing.ink, marginBottom: '8px' }}>
                  vs {c.name}
                </div>
                <p style={{ fontSize: '13.5px', color: landing.inkMuted, lineHeight: 1.55, marginBottom: '14px' }}>
                  {c.hook}
                </p>
                <span style={{ fontSize: '13px', fontWeight: 600, color: landing.amberDark }}>
                  Full comparison →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
