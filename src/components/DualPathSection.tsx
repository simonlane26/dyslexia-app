'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { landing } from '@/lib/landingTheme';
import { Reveal } from './Reveal';

const QUOTE_MAILTO =
  "mailto:Dyslexiawrite@gmail.com?subject=Quote%20request&body=Hi%2C%0A%0AI'd%20like%20a%20quote%20for%20Dyslexia%20Write.%0A%0AThis%20is%20for%3A%20(employer%20%2F%20Access%20to%20Work%20%2F%20school%20or%20college)%0ANumber%20of%20people%3A%20%0A%0AThanks";

const WALKTHROUGH_MAILTO =
  'mailto:Dyslexiawrite@gmail.com?subject=Walkthrough%20request&body=Hi%2C%0A%0ACould%20we%20set%20up%20a%2015-minute%20walkthrough%20of%20Dyslexia%20Write%3F%0A%0AA%20few%20times%20that%20work%20for%20me%3A%20%0A%0AThanks';

function Bullet({ children }: { children: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '14.5px', color: landing.inkMuted, lineHeight: 1.55 }}>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={landing.teal} strokeWidth="2" style={{ flexShrink: 0, marginTop: '3px' }}>
        <path d="M4 10l4 4 8-8" />
      </svg>
      {children}
    </li>
  );
}

export function DualPathSection() {
  const router = useRouter();

  return (
    <div id="dual-path" style={{ padding: '70px 20px', backgroundColor: landing.bg }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: landing.fontDisplay,
              fontSize: 'clamp(26px, 4vw, 32px)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '40px',
              color: landing.ink,
            }}
          >
            Two ways in. Pick yours.
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Path One — individuals */}
          <Reveal>
            <div
              style={{
                background: landing.panel,
                border: `1px solid ${landing.line}`,
                borderRadius: '16px',
                padding: '32px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3 style={{ fontFamily: landing.fontDisplay, fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: landing.ink }}>
                I&apos;m buying it for myself
              </h3>
              <p style={{ fontSize: '15px', color: landing.inkMuted, lineHeight: 1.65, marginBottom: '18px' }}>
                You&apos;re writing at work or studying, and the spellcheck built into everything else
                keeps failing you — it doesn&apos;t recognise your attempts, it flags things that are
                fine, and it never explains why. Dyslexia Write reads what you meant, not just what you
                typed. Dictate, draft messily, then tidy it up in one pass. Homophones caught. Sentences
                untangled. Read-aloud so you can hear whether it lands.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: '0 0 24px', padding: 0 }}>
                <Bullet>Phonetic spelling correction — type it how it sounds, get the right word</Bullet>
                <Bullet>Catches &quot;their/there&quot;, &quot;form/from&quot; and other errors spellcheck approves</Bullet>
                <Bullet>Text-to-speech proofreading with dyslexia-friendly fonts and spacing</Bullet>
                <Bullet>Works everywhere you already write — no copy-pasting into a separate app</Bullet>
              </ul>
              <div style={{ marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => router.push('/sign-up')}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    background: landing.amber,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '15px',
                    padding: '13px 26px',
                    borderRadius: '24px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '12px',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = landing.amberDark)}
                  onMouseOut={(e) => (e.currentTarget.style.background = landing.amber)}
                >
                  Start free →
                </button>
                <div style={{ textAlign: 'center' }}>
                  <Link href="/pricing" style={{ fontSize: '13.5px', fontWeight: 700, color: landing.teal }}>
                    See pricing
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Path Two — funders */}
          <Reveal>
            <div
              id="path-funders"
              style={{
                background: landing.amberTint,
                border: `1px solid ${landing.amber}`,
                borderRadius: '16px',
                padding: '32px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3 style={{ fontFamily: landing.fontDisplay, fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: landing.ink }}>
                I&apos;m funding it for someone else
              </h3>
              <p style={{ fontSize: '15px', color: landing.inkMuted, lineHeight: 1.65, marginBottom: '18px' }}>
                Whether you&apos;re an employer sorting reasonable adjustments, a disability lead
                spending an Access to Work award, or an inclusion/SEN lead kitting out a department —
                you need something that actually gets used, plus paperwork that goes through without
                three rounds of emails. We do quotes, invoices, site licences and Access to
                Work-ready documentation. No procurement theatre.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: '0 0 24px', padding: 0 }}>
                <Bullet>Access to Work quotes turned around in one working day</Bullet>
                <Bullet>School and college site licences, per-pupil or unlimited</Bullet>
                <Bullet>Invoice or PO — no card needed, no per-seat admin</Bullet>
                <Bullet>Rollout guide and a 20-minute onboarding session for staff</Bullet>
              </ul>
              <div style={{ marginTop: 'auto' }}>
                <a
                  href={QUOTE_MAILTO}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    background: landing.ink,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '15px',
                    padding: '13px 26px',
                    borderRadius: '24px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    textDecoration: 'none',
                  }}
                >
                  Request a quote →
                </a>
                <div style={{ textAlign: 'center' }}>
                  <a href={WALKTHROUGH_MAILTO} style={{ fontSize: '13.5px', fontWeight: 700, color: landing.amberDark }}>
                    Book a 15-minute walkthrough
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Closing strip */}
        <Reveal>
          <div
            style={{
              marginTop: '32px',
              textAlign: 'center',
              padding: '28px',
              borderRadius: '16px',
              border: `1px dashed ${landing.line}`,
            }}
          >
            <p style={{ fontFamily: landing.fontDisplay, fontSize: '17px', fontWeight: 600, color: landing.ink, marginBottom: '8px' }}>
              Not sure which applies to you?
            </p>
            <p style={{ fontSize: '14.5px', color: landing.inkMuted, lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 18px' }}>
              Most people start free, find it helps, then ask their employer or university to fund it.
              We&apos;ll give you the quote and the wording to send them.
            </p>
            <button
              type="button"
              onClick={() => router.push('/sign-up')}
              style={{
                border: `1.5px solid ${landing.ink}`,
                background: 'transparent',
                color: landing.ink,
                fontSize: '14.5px',
                fontWeight: 700,
                padding: '11px 22px',
                borderRadius: '24px',
                cursor: 'pointer',
              }}
            >
              Start free, sort funding later →
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
