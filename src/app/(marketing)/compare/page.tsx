import type { Metadata } from 'next';
import Link from 'next/link';
import { organizationSchema } from '@/app/schema';

export const metadata: Metadata = {
  title: 'DyslexiaWrite vs TextHelp Read&Write — Honest Comparison',
  description:
    'A factual comparison of DyslexiaWrite and TextHelp Read&Write: features, pricing, and which tool is better for individuals, schools, and workplaces.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/compare' },
};

const comparisonSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'DyslexiaWrite vs TextHelp Read&Write Comparison',
  url: 'https://www.dyslexiawrite.com/compare',
  description:
    'An honest, factual comparison of DyslexiaWrite and TextHelp Read&Write covering features, pricing, and use cases.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SoftwareApplication',
        position: 1,
        name: 'DyslexiaWrite',
        url: 'https://www.dyslexiawrite.com',
        offers: { '@type': 'Offer', price: '6.99', priceCurrency: 'GBP', billingIncrement: 'P1M' },
        description: 'UK-based AI assistive technology with document decoding, reading mode progression tracking, and Accessibility Passport.',
      },
      {
        '@type': 'SoftwareApplication',
        position: 2,
        name: 'TextHelp Read&Write',
        url: 'https://www.texthelp.com/products/read-and-write/',
        description: 'Established UK assistive technology with broad language support and specialist maths features.',
      },
    ],
  },
};

type Row = [string, string | boolean, string | boolean, string?];

const featureRows: Row[] = [
  // [Feature, DyslexiaWrite, TextHelp, note]
  ['Text-to-speech with word highlighting', true, true],
  ['Grammar and spell check', true, true],
  ['Voice dictation', true, true],
  ['Chrome extension', true, true],
  ['Sentence rewriting / paraphrasing', true, true],
  ['AI document decoding', true, false, 'Upload any document for plain-English explanation'],
  ['Reading mode progression tracking', true, false, 'Evidence for EHCPs and SEN reports'],
  ['Accessibility Passport', true, false, 'Personal accessibility profile for employers/schools'],
  ['Equality Act Compliance Pack', true, false, 'Policy templates, adjustment records for employers'],
  ['Meeting Survival Kit', true, false, 'AI meeting briefing + simplified live transcript'],
  ['Lesson Capture', true, false, 'Simplified live notes with revision summary'],
  ['Story Mode for children', true, false, 'AI-generated personalised read-along stories'],
  ['Spaced repetition vocabulary builder', true, false],
  ['Access to Work compatible licence', true, true],
  ['SENCO class dashboard', true, true],
  ['Maths support (EquatIO)', false, true, 'TextHelp offers a separate maths tool'],
  ['Broad language support (40+ languages)', false, true],
  ['PDF annotation', false, true],
  ['Offline mode', false, true, 'TextHelp has limited offline support'],
];

const pricingRows: [string, string, string][] = [
  ['Individual / monthly', '£6.99/month', '~£12–15/month (est.)'],
  ['Individual / annual', '~£84/year', '~£145–180/year (est.)'],
  ['Access to Work licence', '£120/year', '~£145–180/year (est.)'],
  ['Schools Starter (30 students)', '£300/year', 'Per-seat model; contact for pricing'],
  ['Schools Department (200 students)', '£2,000/year', 'Contact for pricing'],
  ['Whole School (unlimited)', '£5,000/year', 'Contact for pricing'],
  ['Workplace per user/year', 'From £95', 'Typically £145–200+ (est.)'],
  ['Free tier', 'Yes — daily limits', 'Free trial only'],
];

function Tick() {
  return <span style={{ color: '#10b981', fontWeight: 700, fontSize: 16 }}>✓</span>;
}
function Cross() {
  return <span style={{ color: '#d1d5db', fontSize: 16 }}>—</span>;
}

const S = {
  page: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: '#2C2C2A',
    lineHeight: 1.7,
    background: '#fff',
  } as React.CSSProperties,
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: 700,
    fontSize: 14,
    color: '#2C2C2A',
    background: '#F8F7F4',
    borderBottom: '2px solid #E9E7E0',
  },
  td: {
    padding: '11px 16px',
    borderBottom: '1px solid #F1EFE8',
    fontSize: 14,
    color: '#5F5E5A',
    verticalAlign: 'top' as const,
  },
  note: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
};

export default function ComparePage() {
  const jsonLd = [organizationSchema, comparisonSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={S.page}>
        {/* Hero */}
        <div
          style={{
            padding: '72px 40px 56px',
            textAlign: 'center',
            background: 'linear-gradient(180deg,#EDE9FE 0%,#fff 100%)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 20,
              background: '#EDE9FE',
              color: '#4338CA',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
              border: '1px solid #C4B5FD',
            }}
          >
            Honest comparison
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(28px,4.5vw,46px)',
              fontWeight: 600,
              lineHeight: 1.2,
              color: '#2C2C2A',
              maxWidth: 720,
              margin: '0 auto 16px',
            }}
          >
            DyslexiaWrite vs TextHelp Read&amp;Write
          </h1>
          <p
            style={{
              fontSize: 17,
              color: '#5F5E5A',
              maxWidth: 620,
              margin: '0 auto 8px',
              lineHeight: 1.6,
            }}
          >
            A factual comparison of features, pricing, and who each tool suits best.
            We have tried to be accurate and fair to both products.
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '8px 0 0' }}>
            TextHelp pricing is estimated from publicly available sources. Verify current pricing at texthelp.com.
          </p>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 80px' }}>

          {/* Summary cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 56,
            }}
          >
            {[
              {
                name: 'DyslexiaWrite',
                tag: 'Our product',
                tagColor: '#6366f1',
                price: 'From £6.99/month',
                strengths: [
                  'AI document decoding',
                  'Reading mode progression (SENCO evidence)',
                  'Accessibility Passport',
                  'Equality Act Compliance Pack',
                  'Meeting & Lesson tools',
                  '70–80% cheaper than TextHelp',
                ],
                limitations: [
                  'No maths support',
                  'Fewer languages (English focus)',
                  'Newer product — smaller installed base',
                ],
                cta: { label: 'Try free', href: '/sign-up' },
              },
              {
                name: 'TextHelp Read&Write',
                tag: 'Competitor',
                tagColor: '#6b7280',
                price: 'From ~£145/user/year (est.)',
                strengths: [
                  'Long track record (25+ years)',
                  'Large installed base in UK schools',
                  'EquatIO for maths support',
                  '40+ languages',
                  'PDF annotation',
                  'Offline mode',
                ],
                limitations: [
                  'No AI document decoding',
                  'No reading mode progression tracking',
                  'No Accessibility Passport',
                  'Significantly more expensive',
                ],
                cta: { label: 'texthelp.com', href: 'https://www.texthelp.com' },
              },
            ].map((p) => (
              <div
                key={p.name}
                style={{
                  border: '1px solid #E9E7E0',
                  borderRadius: 16,
                  padding: '28px 24px',
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#2C2C2A' }}>
                    {p.name}
                  </h2>
                  <span
                    style={{
                      background: p.tagColor + '18',
                      color: p.tagColor,
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {p.tag}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: '#6366f1', fontWeight: 600, marginBottom: 16 }}>
                  {p.price}
                </p>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Strengths
                  </div>
                  {p.strengths.map((s) => (
                    <div key={s} style={{ fontSize: 13, color: '#374151', marginBottom: 3 }}>
                      <span style={{ color: '#10b981', marginRight: 6 }}>✓</span>{s}
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Limitations
                  </div>
                  {p.limitations.map((l) => (
                    <div key={l} style={{ fontSize: 13, color: '#6b7280', marginBottom: 3 }}>
                      <span style={{ marginRight: 6 }}>–</span>{l}
                    </div>
                  ))}
                </div>
                <a
                  href={p.cta.href}
                  style={{
                    display: 'inline-block',
                    padding: '9px 20px',
                    borderRadius: 8,
                    background: p.tagColor,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {p.cta.label}
                </a>
              </div>
            ))}
          </div>

          {/* Feature table */}
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 26,
              fontWeight: 600,
              marginBottom: 20,
              color: '#2C2C2A',
            }}
          >
            Feature comparison
          </h2>
          <div style={{ overflowX: 'auto', marginBottom: 56 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '50%' }}>Feature</th>
                  <th style={{ ...S.th, width: '25%' }}>DyslexiaWrite</th>
                  <th style={{ ...S.th, width: '25%' }}>TextHelp R&amp;W</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map(([feat, dw, th, note]) => (
                  <tr key={String(feat)}>
                    <td style={S.td}>
                      {String(feat)}
                      {note && <div style={S.note}>{note}</div>}
                    </td>
                    <td style={S.td}>{dw === true ? <Tick /> : dw === false ? <Cross /> : String(dw)}</td>
                    <td style={S.td}>{th === true ? <Tick /> : th === false ? <Cross /> : String(th)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing table */}
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 26,
              fontWeight: 600,
              marginBottom: 8,
              color: '#2C2C2A',
            }}
          >
            Pricing comparison
          </h2>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
            TextHelp pricing is estimated. Verify at texthelp.com before making a purchasing decision.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: 56 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '40%' }}>Plan</th>
                  <th style={{ ...S.th, width: '30%' }}>DyslexiaWrite</th>
                  <th style={{ ...S.th, width: '30%' }}>TextHelp R&amp;W (est.)</th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map(([plan, dw, th]) => (
                  <tr key={plan}>
                    <td style={{ ...S.td, fontWeight: 500, color: '#374151' }}>{plan}</td>
                    <td style={{ ...S.td, color: '#6366f1', fontWeight: 600 }}>{dw}</td>
                    <td style={S.td}>{th}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Who should choose what */}
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 26,
              fontWeight: 600,
              marginBottom: 20,
              color: '#2C2C2A',
            }}
          >
            Which tool is right for you?
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
              marginBottom: 56,
            }}
          >
            {[
              {
                heading: 'Choose DyslexiaWrite if…',
                color: '#6366f1',
                points: [
                  'Cost is a factor (70–80% cheaper)',
                  'You need AI document decoding',
                  'Your school needs SENCO evidence for EHCPs',
                  'Your workplace needs an Equality Act Compliance Pack',
                  'You want an Accessibility Passport',
                  "You're applying for Access to Work funding",
                  'You want a modern, AI-first approach',
                ],
              },
              {
                heading: 'Choose TextHelp Read&Write if…',
                color: '#6b7280',
                points: [
                  'Your school or employer already uses it',
                  'You need maths support (EquatIO)',
                  'You need 40+ language support',
                  'You need PDF annotation tools',
                  'You prefer an established, widely-recognised product',
                  'Offline access is a requirement',
                ],
              },
            ].map((c) => (
              <div
                key={c.heading}
                style={{
                  border: `1px solid ${c.color}30`,
                  borderRadius: 14,
                  padding: '24px 22px',
                  background: `${c.color}06`,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, color: c.color, marginBottom: 14 }}>
                  {c.heading}
                </h3>
                {c.points.map((p) => (
                  <div key={p} style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>
                    <span style={{ color: c.color, marginRight: 8, fontWeight: 700 }}>→</span>
                    {p}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              padding: '40px 32px',
              background: 'linear-gradient(135deg,#667eea18 0%,#764ba218 100%)',
              borderRadius: 20,
              border: '1px solid #e0e7ff',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 24,
                fontWeight: 600,
                marginBottom: 10,
                color: '#2C2C2A',
              }}
            >
              Try DyslexiaWrite free
            </h2>
            <p style={{ color: '#5F5E5A', marginBottom: 24, fontSize: 15 }}>
              No credit card needed. See for yourself how it compares.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/sign-up"
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  background: '#6366f1',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Start free
              </Link>
              <Link
                href="/pricing"
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  background: '#fff',
                  color: '#2C2C2A',
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1px solid #D3D1C7',
                  textDecoration: 'none',
                }}
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
