import Link from 'next/link';
import { landing } from '@/lib/landingTheme';
import { SocialLinks } from './SocialLinks';

const FOOTER_LINKS: [string, string][] = [
  ['Pricing', '/pricing'],
  ['For Employers', '/enterprise'],
  ['Access to Work', '/access-to-work'],
  ['For Schools', '/schools'],
  ['Free Screener', '/screener'],
  ['Guides', '/guides'],
  ['FAQ', '/faq'],
  ['About', '/about'],
  ['vs TextHelp', '/compare'],
  ['vs Grammarly', '/vs/grammarly'],
  ['vs ClaroRead', '/vs/claroread'],
  ['vs Immersive Reader', '/vs/immersive-reader'],
  ['Privacy', '/privacy'],
];

export function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${landing.line}`, padding: '40px 20px 30px' }}>
      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M6 20 L17 9 L21 13 L10 24 L5 25 Z" stroke={landing.amber} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M15 11 L19 15" stroke={landing.amber} strokeWidth="1.6" />
          </svg>
          <span style={{ fontFamily: landing.fontDisplay, fontWeight: 700, fontSize: '19px', color: landing.ink }}>DyslexiaWrite</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {FOOTER_LINKS.map(([label, href]) => (
            <Link key={href} href={href} style={{ fontSize: '13px', color: landing.inkFaint, textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>
        <SocialLinks />
        <span style={{ fontSize: '13px', color: landing.inkFaint }}>© 2026 DyslexiaWrite. Write, simplify, and listen.</span>
      </div>
    </footer>
  );
}
