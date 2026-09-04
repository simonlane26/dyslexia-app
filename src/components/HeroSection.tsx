'use client';

import { useState } from 'react';
import { landing } from '@/lib/landingTheme';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSeeFunding: () => void;
}

const EXAMPLES = [
  {
    label: 'Simplify',
    before:
      "I wanted too talk too my friend about are homework becuse i didnt understand it and it was really hard for me to no what to do.",
    after:
      "I wanted to talk to my friend about our homework because I didn't understand it and it was really hard for me to know what to do.",
    highlights: ['Correct words', 'Fixed spelling', 'Clearer flow'],
  },
  {
    label: 'Rewrite sentence',
    before: 'The thing what happened was me and him went to the shop and we buyed some stuff.',
    after: 'He and I went to the shop and bought some things.',
    highlights: ['Shorter', 'Grammatically correct', 'Confident tone'],
  },
  {
    label: 'Read aloud',
    before:
      'Paste any text — an email, an essay, a letter — and hear it read back to you in a clear, natural voice. Great for checking your own writing or reading documents others have sent.',
    after: null,
    highlights: ['Hear your writing', 'Catch mistakes by ear', 'Natural AI voice'],
  },
];

export function HeroSection({ onGetStarted, onSeeFunding }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const ex = EXAMPLES[activeIndex];

  return (
    <section style={{ padding: '56px 20px 64px' }}>
      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        {/* Left column */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: landing.amberTint,
              color: landing.amberDark,
              fontSize: '13px',
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: '20px',
              marginBottom: '22px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l2 5 5 .5-3.8 3.5 1 5-4.2-2.6L5.8 16l1-5L3 6.5 8 6z" fill={landing.amberDark} />
            </svg>
            Writing software built for dyslexic brains — not spellcheck with a new coat of paint
          </div>

          <h1
            style={{
              fontFamily: landing.fontDisplay,
              fontWeight: 600,
              fontSize: 'clamp(30px, 4vw, 44px)',
              lineHeight: 1.22,
              letterSpacing: '-0.01em',
              marginBottom: '18px',
              color: landing.ink,
            }}
          >
            Write it once.{' '}
            <span
              style={{
                background: `linear-gradient(120deg, ${landing.amber}52 0%, ${landing.amber}52 100%)`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 0.42em',
                backgroundPosition: '0 86%',
                padding: '0 2px',
              }}
            >
              Get it right.
            </span>
          </h1>

          <p
            style={{
              fontSize: '16.5px',
              color: landing.inkMuted,
              maxWidth: '480px',
              marginBottom: '26px',
              lineHeight: 1.65,
            }}
          >
            Dyslexia Write helps you get the words out of your head and onto the page — then fixes the
            spelling, grammar and phrasing that regular tools miss, including the errors that are
            actually correct words. Built for work emails, essays, reports and applications.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onGetStarted}
              style={{
                background: landing.amber,
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                padding: '13px 26px',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background .15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = landing.amberDark)}
              onMouseOut={(e) => (e.currentTarget.style.background = landing.amber)}
            >
              Start free — no card needed
            </button>
            <button
              type="button"
              onClick={onSeeFunding}
              style={{
                border: 'none',
                background: 'transparent',
                color: landing.teal,
                fontSize: '15px',
                fontWeight: 700,
                padding: 0,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Funded by your employer or school? See how →
            </button>
          </div>

          <p style={{ fontSize: '13.5px', color: landing.inkFaint, margin: 0 }}>
            Chrome extension for Gmail, Outlook, Slack and Teams — plus the web editor built in.
            Eligible for Access to Work funding.
          </p>
        </div>

        {/* Right column — demo card */}
        <div
          style={{
            background: landing.panel,
            border: `1px solid ${landing.line}`,
            borderRadius: '14px',
            padding: '26px',
            boxShadow: '0 24px 60px -30px rgba(43,42,40,0.2)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={e.label}
                type="button"
                onClick={() => setActiveIndex(i)}
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '8px 14px',
                  borderRadius: '18px',
                  border: `1.5px solid ${activeIndex === i ? landing.amber : landing.line}`,
                  color: activeIndex === i ? landing.amberDark : landing.inkMuted,
                  backgroundColor: activeIndex === i ? landing.amberTint : 'transparent',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ borderRadius: '10px', padding: '18px 18px 16px', backgroundColor: landing.roseTint }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', color: landing.rose }}>
                Before
              </div>
              <p style={{ fontFamily: landing.fontDisplay, fontSize: '16.5px', fontStyle: 'italic', lineHeight: 1.55, margin: 0, color: landing.ink }}>
                &quot;{ex.before}&quot;
              </p>
            </div>

            <div style={{ borderRadius: '10px', padding: '18px 18px 16px', backgroundColor: landing.tealTint }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', color: landing.teal }}>
                {ex.after !== null ? 'After — with DyslexiaWrite' : 'Read Aloud'}
              </div>
              <p style={{ fontFamily: landing.fontDisplay, fontSize: '16.5px', fontStyle: 'italic', lineHeight: 1.55, margin: 0, color: landing.ink }}>
                {ex.after !== null ? (
                  <span key={activeIndex} className="sweep-underline">
                    &quot;{ex.after}&quot;
                  </span>
                ) : (
                  `"${ex.before}"`
                )}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                {ex.highlights.map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: landing.teal,
                      background: '#fff',
                      border: `1px solid ${landing.teal}`,
                      padding: '4px 10px',
                      borderRadius: '14px',
                    }}
                  >
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGetStarted}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              marginTop: '18px',
              background: landing.amber,
              color: '#fff',
              fontWeight: 700,
              fontSize: '15px',
              padding: '13px 26px',
              borderRadius: '24px',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = landing.amberDark)}
            onMouseOut={(e) => (e.currentTarget.style.background = landing.amber)}
          >
            Start free — no card needed
          </button>
        </div>
      </div>

      <style jsx>{`
        .sweep-underline {
          position: relative;
          display: inline;
        }
        .sweep-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 2px;
          height: 0.4em;
          width: 0;
          background: rgba(47, 122, 107, 0.25);
          z-index: -1;
          animation: sweep 1.1s ease forwards;
          animation-delay: 0.3s;
        }
        @keyframes sweep {
          to {
            width: 100%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sweep-underline::after {
            animation: none;
            width: 100%;
          }
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
