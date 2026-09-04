import type { Metadata } from 'next';
import Link from 'next/link';
import { organizationSchema } from '@/app/schema';
import { OtherComparisons } from '@/components/OtherComparisons';

export const metadata: Metadata = {
  title: 'Dyslexia Write vs Grammarly — Which One Actually Helps You Write with Dyslexia?',
  description:
    'An honest comparison of Dyslexia Write and Grammarly for dyslexic writers: phonetic spelling correction, homophones, read-aloud, dictation, pricing, and Access to Work funding.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/vs/grammarly' },
};

const comparisonSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Dyslexia Write vs Grammarly Comparison',
  url: 'https://www.dyslexiawrite.com/vs/grammarly',
  description:
    'An honest comparison of Dyslexia Write and Grammarly, covering phonetic spelling correction, homophones, read-aloud, dictation, pricing, and Access to Work funding.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SoftwareApplication',
        position: 1,
        name: 'Dyslexia Write',
        url: 'https://www.dyslexiawrite.com',
        offers: { '@type': 'Offer', price: '6.99', priceCurrency: 'GBP', billingIncrement: 'P1M' },
        description: 'AI-powered writing support built specifically for dyslexic writers.',
      },
      {
        '@type': 'SoftwareApplication',
        position: 2,
        name: 'Grammarly',
        url: 'https://www.grammarly.com',
        offers: { '@type': 'Offer', price: '10', priceCurrency: 'GBP', billingIncrement: 'P1M' },
        description: 'General-purpose grammar, spelling, and tone checker for business writing.',
      },
    ],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Grammarly good for dyslexia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "It helps with grammar, not with spelling that's phonetically distant from the target word — which is the most common dyslexic spelling pattern.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do I have to cancel Grammarly to use Dyslexia Write?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Plenty of our users run both side by side.' },
    },
    {
      '@type': 'Question',
      name: 'Can I try Dyslexia Write before paying?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — the free tier has no time limit and doesn't need a card. It has daily usage limits; Pro removes them.",
      },
    },
  ],
};

type Row = [string, string | boolean, string | boolean, string?];

const featureRows: Row[] = [
  ['Built for', 'Dyslexic writers', 'General business writing'],
  ['Phonetic spelling correction ("nolij" → knowledge)', true, false, 'Grammarly is built on standard spellcheck dictionaries, which need your spelling to be close to the target word'],
  ['Homophone help (their/there, form/from)', true, 'Partial', 'Dyslexia Write shows the meaning of each option, not just a flag'],
  ['AI document decoding (explain any document in plain English)', true, false],
  ['Read-aloud with word-level highlighting', true, false],
  ['Voice dictation', true, 'Limited', 'Grammarly has no built-in dictation outside its desktop app'],
  ['Tone and style suggestions', 'Basic', 'Excellent', "This is Grammarly's core strength"],
  ['Native Word / Outlook add-in', false, true, "Dyslexia Write is a Chrome extension and web editor today — no desktop Office add-in"],
  ['Chrome extension (Gmail, Docs, Slack, web)', true, true],
  ['Access to Work fundable', true, 'Not typically'],
  ['School / college site licence', true, 'Enterprise plan only'],
];

const pricingRows: [string, string, string][] = [
  ['Free tier', 'Yes — daily limits, no time limit', 'Yes — basic grammar and spelling'],
  ['Individual / monthly', '£6.99/month', '~£25/month (billed monthly)'],
  ['Individual / annual', '~£84/year', '£120/year (£10/month, billed annually)'],
  ['Access to Work licence', '£120/year — typically 100% DWP-funded', 'Not a dedicated Access to Work product'],
  ['School site licence (30 students)', '£300/year', 'Enterprise — contact for pricing'],
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
  h2: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 26,
    fontWeight: 600,
    marginBottom: 16,
    color: '#2C2C2A',
  } as React.CSSProperties,
  h3: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
    color: '#2C2C2A',
  } as React.CSSProperties,
  body: { fontSize: 15.5, color: '#5F5E5A', marginBottom: 40, maxWidth: 720 },
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

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Tick />;
  if (v === false) return <Cross />;
  return <>{v}</>;
}

export default function VsGrammarlyPage() {
  const jsonLd = [organizationSchema, comparisonSchema, faqSchema];

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
              fontSize: 'clamp(26px,4.2vw,42px)',
              fontWeight: 600,
              lineHeight: 1.25,
              color: '#2C2C2A',
              maxWidth: 760,
              margin: '0 auto 20px',
            }}
          >
            Dyslexia Write vs Grammarly: which one actually helps you write with dyslexia?
          </h1>
          <p style={{ fontSize: 16, color: '#5F5E5A', maxWidth: 620, margin: '0 auto 12px', lineHeight: 1.65 }}>
            Grammarly is a very good grammar checker. It was built for people who can already get roughly
            the right words onto the page. If you&apos;re dyslexic, that&apos;s usually the hard part.
          </p>
          <p style={{ fontSize: 16, color: '#5F5E5A', maxWidth: 620, margin: '0 auto', lineHeight: 1.65 }}>
            Here&apos;s the honest comparison, from the people who built the other one.
          </p>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 80px' }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 56 }}>
            {[
              {
                name: 'Dyslexia Write',
                tag: 'Our product',
                tagColor: '#6366f1',
                price: 'Free tier, or £6.99/month',
                strengths: [
                  'Phonetic spelling correction',
                  'Homophones explained, not just flagged',
                  'Read-aloud with word highlighting',
                  'Voice dictation',
                  'Access to Work fundable',
                ],
                limitations: ['No native Word/Outlook add-in — Chrome extension and web editor today', 'Tone/style suggestions are basic, not a core focus'],
                cta: { label: 'Try free', href: '/sign-up' },
              },
              {
                name: 'Grammarly',
                tag: 'Competitor',
                tagColor: '#6b7280',
                price: 'Free tier, or from £10/month',
                strengths: ['Excellent tone and style rewrites', 'Native Word and Outlook add-ins', 'Plagiarism checking', 'Large installed base'],
                limitations: ['Struggles with spelling that sounds right but looks nothing like the word', "Doesn't explain homophones in plain English", 'No read-aloud or dictation'],
                cta: { label: 'grammarly.com', href: 'https://www.grammarly.com' },
              },
            ].map((p) => (
              <div key={p.name} style={{ border: '1px solid #E9E7E0', borderRadius: 16, padding: '28px 24px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#2C2C2A' }}>{p.name}</h2>
                  <span style={{ background: p.tagColor + '18', color: p.tagColor, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                    {p.tag}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: '#6366f1', fontWeight: 600, marginBottom: 16 }}>{p.price}</p>
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
                <a href={p.cta.href} style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 8, background: p.tagColor, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  {p.cta.label}
                </a>
              </div>
            ))}
          </div>

          {/* The short answer */}
          <h2 style={S.h2}>The short answer</h2>
          <p style={S.body}>
            If your spelling is close enough that Grammarly can guess what you meant, Grammarly is fine.
            If you type &quot;nolij&quot;, &quot;peaple&quot; or &quot;seperete&quot; and Grammarly shrugs
            — or &quot;corrects&quot; it to the wrong word entirely — that&apos;s the gap we built
            Dyslexia Write to fill.
          </p>

          {/* Side by side */}
          <h2 style={S.h2}>Side by side</h2>
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '44%' }}>Feature</th>
                  <th style={{ ...S.th, width: '28%' }}>Dyslexia Write</th>
                  <th style={{ ...S.th, width: '28%' }}>Grammarly</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map(([feat, dw, gr, note]) => (
                  <tr key={String(feat)}>
                    <td style={S.td}>
                      {String(feat)}
                      {note && <div style={S.note}>{note}</div>}
                    </td>
                    <td style={S.td}><Cell v={dw} /></td>
                    <td style={S.td}><Cell v={gr} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 56 }}>
            Grammarly comparison is against the Free and Pro (individual) tiers as of{' '}
            {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}. Pricing changes —
            check grammarly.com for the current rate before you buy.
          </p>

          {/* Where Grammarly wins */}
          <h2 style={S.h2}>Where Grammarly is genuinely better</h2>
          <p style={S.body}>
            Tone, concision, style rewrites, plagiarism checking, and native add-ins for Word and
            Outlook. If you&apos;re polishing a 40-page report for a client on your desktop, Grammarly
            earns its keep. We&apos;re not trying to beat it at that and we don&apos;t pretend to.
          </p>

          {/* Where DW wins */}
          <h2 style={S.h2}>Where we&apos;re better</h2>
          <p style={S.body}>
            Getting the sentence out in the first place. Dyslexia Write recognises spellings that
            aren&apos;t close to the target word, shows you the difference between homophones in plain
            English, and reads your work back so you catch the errors your eyes skip over. That&apos;s a
            different job.
          </p>

          {/* Can I use both */}
          <h2 style={S.h2}>Can I use both?</h2>
          <p style={S.body}>
            Yes, and plenty of our users do. Dyslexia Write to get the words down, Grammarly to tidy them
            up. They don&apos;t conflict.
          </p>

          {/* Funding */}
          <h2 style={S.h2}>If someone else is paying</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 56 }}>
            <div style={{ border: '1px solid #E9E7E0', borderRadius: 14, padding: '22px 20px' }}>
              <h3 style={S.h3}>Employed in the UK?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 14 }}>
                Access to Work grants can cover assistive writing software in full. We&apos;ll send you a
                quote and spec sheet formatted for the application.
              </p>
              <Link href="/access-to-work" style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>
                See how Access to Work funding works →
              </Link>
            </div>
            <div style={{ border: '1px solid #E9E7E0', borderRadius: 14, padding: '22px 20px' }}>
              <h3 style={S.h3}>Buying for a school?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 14 }}>
                Site licences start at £300/year for up to 30 students, with a teacher dashboard and
                staff onboarding included.
              </p>
              <Link href="/schools" style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>
                See school and college pricing →
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <h2 style={S.h2}>Frequently asked questions</h2>
          <div style={{ marginBottom: 56 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={S.h3}>Is Grammarly good for dyslexia?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6 }}>
                It helps with grammar, not with spelling that&apos;s phonetically distant from the target
                word — which is the most common dyslexic spelling pattern.
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={S.h3}>Do I have to cancel Grammarly?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6 }}>
                No. Plenty of our users run both side by side.
              </p>
            </div>
            <div>
              <h3 style={S.h3}>Can I try Dyslexia Write first?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6 }}>
                Yes — the free tier has no time limit and no card required. It has daily usage limits;
                upgrading to Pro removes them.
              </p>
            </div>
          </div>

          {/* Pricing table */}
          <h2 style={{ ...S.h2, marginBottom: 8 }}>Pricing comparison</h2>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
            Grammarly pricing changes — verify the current rate at grammarly.com before you buy.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: 56 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '34%' }}>Plan</th>
                  <th style={{ ...S.th, width: '33%' }}>Dyslexia Write</th>
                  <th style={{ ...S.th, width: '33%' }}>Grammarly</th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map(([plan, dw, gr]) => (
                  <tr key={plan}>
                    <td style={{ ...S.td, fontWeight: 500, color: '#374151' }}>{plan}</td>
                    <td style={{ ...S.td, color: '#6366f1', fontWeight: 600 }}>{dw}</td>
                    <td style={S.td}>{gr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA */}
          <div
            style={{
              padding: '40px 32px',
              background: 'linear-gradient(135deg,#667eea18 0%,#764ba218 100%)',
              borderRadius: 20,
              border: '1px solid #e0e7ff',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            <h2 style={{ ...S.h2, marginBottom: 10 }}>Start free</h2>
            <p style={{ color: '#5F5E5A', marginBottom: 24, fontSize: 15 }}>
              No card needed. Works via the Chrome extension and web editor in under two minutes.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/sign-up" style={{ padding: '12px 28px', borderRadius: 10, background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                Start free
              </Link>
              <Link href="/pricing" style={{ padding: '12px 28px', borderRadius: 10, background: '#fff', color: '#2C2C2A', fontSize: 15, fontWeight: 600, border: '1px solid #D3D1C7', textDecoration: 'none' }}>
                See pricing
              </Link>
            </div>
          </div>

          {/* Other comparisons */}
          <OtherComparisons current="grammarly" />
        </div>
      </div>
    </>
  );
}
