import type { Metadata } from 'next';
import Link from 'next/link';
import { organizationSchema } from '@/app/schema';
import { OtherComparisons } from '@/components/OtherComparisons';

export const metadata: Metadata = {
  title: 'Dyslexia Write vs Microsoft Immersive Reader — Do You Still Need It If It’s Free?',
  description:
    'An honest comparison of Dyslexia Write and Microsoft Immersive Reader: what the free built-in reading tool does well, and where you still need writing support.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/vs/immersive-reader' },
};

const comparisonSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Dyslexia Write vs Microsoft Immersive Reader Comparison',
  url: 'https://www.dyslexiawrite.com/vs/immersive-reader',
  description:
    'An honest comparison of Dyslexia Write and Microsoft Immersive Reader, covering reading support, writing correction, and where the free tool stops.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SoftwareApplication',
        position: 1,
        name: 'Dyslexia Write',
        url: 'https://www.dyslexiawrite.com',
        offers: { '@type': 'Offer', price: '6.99', priceCurrency: 'GBP', billingIncrement: 'P1M' },
        description: 'AI-powered writing and reading support built specifically for dyslexic writers.',
      },
      {
        '@type': 'SoftwareApplication',
        position: 2,
        name: 'Microsoft Immersive Reader',
        url: 'https://www.microsoft.com/en-us/edge/features/immersive-reader',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
        description: 'Free reading support tool built into Word, Outlook, Teams, OneNote and Microsoft Edge.',
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
      name: 'Does Immersive Reader check spelling and grammar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No. That's Microsoft Editor, a separate product. Immersive Reader is a reading tool — it reads text aloud and makes it easier to look at, but it doesn't check or correct anything you write.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is Immersive Reader really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely, and it’s built into Word, Outlook, Teams, OneNote, and Microsoft Edge. If reading support inside Microsoft apps is all you need, it’s a genuinely good option.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Immersive Reader work in Gmail or Google Docs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No — it only works inside Microsoft’s own apps and the Edge browser. Dyslexia Write’s Chrome extension works on any website, including Gmail and Google Docs.',
      },
    },
  ],
};

type Row = [string, string | boolean, string | boolean, string?];

const featureRows: Row[] = [
  ['Built for', 'Reading and writing support', 'Reading support only', 'Grammar/spelling correction is a separate Microsoft product (Editor), not part of Immersive Reader'],
  ['Cost', '£0 (free tier) or £6.99/month', '£0 — built into Microsoft 365 and Edge'],
  ['Phonetic spelling correction', true, false],
  ['Homophone help with meanings', true, false],
  ['Grammar and spelling check', 'Basic', false, 'Not an Immersive Reader feature at all'],
  ['Voice dictation', true, false],
  ['AI document decoding (explain any document in plain English)', true, false],
  ['Read-aloud with word highlighting', true, true, 'This is one of Immersive Reader’s genuine strengths'],
  ['Syllable breakdown and picture dictionary', false, true],
  ['Line focus, spacing and font customisation', 'Basic — three reading modes', true, 'Immersive Reader’s text customisation is more granular'],
  ['Translation (120+ languages)', false, true],
  ['Works outside Microsoft apps (Gmail, Google Docs, any website)', true, false, 'Immersive Reader only works inside Word, Outlook, Teams, OneNote and Edge'],
  ['Access to Work fundable', true, false, 'Nothing to fund — it’s already free'],
  ['School site licence with teacher dashboard', true, 'Included free with Microsoft 365 Education'],
];

function Tick() {
  return <span style={{ color: '#10b981', fontWeight: 700, fontSize: 16 }}>✓</span>;
}
function Cross() {
  return <span style={{ color: '#d1d5db', fontSize: 16 }}>—</span>;
}

const S = {
  page: { fontFamily: "'DM Sans', system-ui, sans-serif", color: '#2C2C2A', lineHeight: 1.7, background: '#fff' } as React.CSSProperties,
  h2: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 600, marginBottom: 16, color: '#2C2C2A' } as React.CSSProperties,
  h3: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#2C2C2A' } as React.CSSProperties,
  body: { fontSize: 15.5, color: '#5F5E5A', marginBottom: 40, maxWidth: 720 },
  th: { padding: '12px 16px', textAlign: 'left' as const, fontWeight: 700, fontSize: 14, color: '#2C2C2A', background: '#F8F7F4', borderBottom: '2px solid #E9E7E0' },
  td: { padding: '11px 16px', borderBottom: '1px solid #F1EFE8', fontSize: 14, color: '#5F5E5A', verticalAlign: 'top' as const },
  note: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
};

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Tick />;
  if (v === false) return <Cross />;
  return <>{v}</>;
}

export default function VsImmersiveReaderPage() {
  const jsonLd = [organizationSchema, comparisonSchema, faqSchema];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={S.page}>
        {/* Hero */}
        <div style={{ padding: '72px 40px 56px', textAlign: 'center', background: 'linear-gradient(180deg,#EDE9FE 0%,#fff 100%)' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: '#EDE9FE', color: '#4338CA', fontSize: 13, fontWeight: 600, marginBottom: 20, border: '1px solid #C4B5FD' }}>
            Honest comparison
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(26px,4.2vw,42px)', fontWeight: 600, lineHeight: 1.25, color: '#2C2C2A', maxWidth: 760, margin: '0 auto 20px' }}>
            Dyslexia Write vs Microsoft Immersive Reader: do you still need it if it&apos;s free?
          </h1>
          <p style={{ fontSize: 16, color: '#5F5E5A', maxWidth: 640, margin: '0 auto 12px', lineHeight: 1.65 }}>
            Immersive Reader is free, built into Word, Outlook, Teams, and Edge, and it&apos;s genuinely
            good at what it does. What it does is help you read. It doesn&apos;t check your spelling,
            explain a homophone, take dictation, or work anywhere outside Microsoft&apos;s own apps.
          </p>
          <p style={{ fontSize: 16, color: '#5F5E5A', maxWidth: 640, margin: '0 auto', lineHeight: 1.65 }}>
            Here&apos;s the honest split between the two.
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
                strengths: ['Corrects your spelling and grammar as you write', 'Explains homophones in plain English', 'Voice dictation', 'Works in Gmail, Google Docs, and any website'],
                limitations: ['Reading customisation is more basic — three preset modes, not granular controls', 'No syllable breakdown or translation'],
                cta: { label: 'Try free', href: '/sign-up' },
              },
              {
                name: 'Microsoft Immersive Reader',
                tag: 'Free tool',
                tagColor: '#6b7280',
                price: 'Free',
                strengths: ['Genuinely excellent read-aloud with highlighting', 'Syllable breakdown and picture dictionary', 'Translation into 120+ languages', 'Already built into apps you likely use'],
                limitations: ['No spelling or grammar correction — that’s a different Microsoft product (Editor)', 'No dictation', 'Only works inside Microsoft apps and Edge'],
                cta: { label: 'microsoft.com', href: 'https://www.microsoft.com/en-us/edge/features/immersive-reader' },
              },
            ].map((p) => (
              <div key={p.name} style={{ border: '1px solid #E9E7E0', borderRadius: 16, padding: '28px 24px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#2C2C2A' }}>{p.name}</h2>
                  <span style={{ background: p.tagColor + '18', color: p.tagColor, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{p.tag}</span>
                </div>
                <p style={{ fontSize: 14, color: '#6366f1', fontWeight: 600, marginBottom: 16 }}>{p.price}</p>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strengths</div>
                  {p.strengths.map((s) => (
                    <div key={s} style={{ fontSize: 13, color: '#374151', marginBottom: 3 }}><span style={{ color: '#10b981', marginRight: 6 }}>✓</span>{s}</div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Limitations</div>
                  {p.limitations.map((l) => (
                    <div key={l} style={{ fontSize: 13, color: '#6b7280', marginBottom: 3 }}><span style={{ marginRight: 6 }}>–</span>{l}</div>
                  ))}
                </div>
                <a href={p.cta.href} style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 8, background: p.tagColor, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{p.cta.label}</a>
              </div>
            ))}
          </div>

          {/* The short answer */}
          <h2 style={S.h2}>The short answer</h2>
          <p style={S.body}>
            Immersive Reader and Dyslexia Write aren&apos;t really competing for the same job. Immersive
            Reader helps you take text in — reading it, hearing it, breaking it into syllables. Dyslexia
            Write helps you put text out — writing an email, an essay, a report — and it works wherever
            you&apos;re writing it, not just inside Microsoft&apos;s apps.
          </p>

          {/* Side by side */}
          <h2 style={S.h2}>Side by side</h2>
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '44%' }}>Feature</th>
                  <th style={{ ...S.th, width: '28%' }}>Dyslexia Write</th>
                  <th style={{ ...S.th, width: '28%' }}>Immersive Reader</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map(([feat, dw, ir, note]) => (
                  <tr key={String(feat)}>
                    <td style={S.td}>{String(feat)}{note && <div style={S.note}>{note}</div>}</td>
                    <td style={S.td}><Cell v={dw} /></td>
                    <td style={S.td}><Cell v={ir} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 56 }}>
            Immersive Reader features from microsoft.com and learn.microsoft.com as of{' '}
            {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}.
          </p>

          {/* Where Immersive Reader wins */}
          <h2 style={S.h2}>Where Immersive Reader is genuinely better</h2>
          <p style={S.body}>
            Reading customisation and comprehension support: syllable breakdown, a picture dictionary,
            line focus, and translation into 120+ languages, all for free inside apps you probably
            already have open. If reading support is genuinely all you need, and you live entirely
            inside Word, Outlook, or Edge, there&apos;s a real argument for just using what&apos;s already
            there.
          </p>

          {/* Where DW wins */}
          <h2 style={S.h2}>Where we&apos;re better</h2>
          <p style={S.body}>
            Writing. Immersive Reader has no spelling correction, no grammar checking, no dictation, and
            no homophone help — that&apos;s not a gap in the product, it&apos;s simply not what it&apos;s
            for (Microsoft Editor covers grammar, separately, and still won&apos;t handle spelling that&apos;s
            phonetically distant from the target word). Dyslexia Write also works everywhere you write,
            not just inside Microsoft&apos;s own apps — Gmail, Google Docs, Slack, and the open web
            included.
          </p>

          {/* Can I use both */}
          <h2 style={S.h2}>Can I use both?</h2>
          <p style={S.body}>
            Yes, easily — they don&apos;t overlap. Use Immersive Reader to read a document Word or Teams
            handed you; use Dyslexia Write to write the reply.
          </p>

          {/* Funding */}
          <h2 style={S.h2}>If someone else is paying</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 56 }}>
            <div style={{ border: '1px solid #E9E7E0', borderRadius: 14, padding: '22px 20px' }}>
              <h3 style={S.h3}>Employed in the UK?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 14 }}>
                Access to Work grants can cover the full cost of Dyslexia Write. We&apos;ll send you a
                quote and spec sheet formatted for the application.
              </p>
              <Link href="/access-to-work" style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>
                See how Access to Work funding works →
              </Link>
            </div>
            <div style={{ border: '1px solid #E9E7E0', borderRadius: 14, padding: '22px 20px' }}>
              <h3 style={S.h3}>Buying for a school?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 14 }}>
                Site licences start at £300/year for up to 30 students — worth it once pupils need
                writing support Immersive Reader doesn&apos;t provide.
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
              <h3 style={S.h3}>Does Immersive Reader check spelling and grammar?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6 }}>
                No. That&apos;s Microsoft Editor, a separate product. Immersive Reader is a reading tool —
                it reads text aloud and makes it easier to look at, but it doesn&apos;t check or correct
                anything you write.
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={S.h3}>Is Immersive Reader really free?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6 }}>
                Yes, completely, and it&apos;s built into Word, Outlook, Teams, OneNote, and Microsoft
                Edge. If reading support inside Microsoft apps is all you need, it&apos;s a genuinely good
                option.
              </p>
            </div>
            <div>
              <h3 style={S.h3}>Does Immersive Reader work in Gmail or Google Docs?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6 }}>
                No — it only works inside Microsoft&apos;s own apps and the Edge browser. Dyslexia
                Write&apos;s Chrome extension works on any website, including Gmail and Google Docs.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: '40px 32px', background: 'linear-gradient(135deg,#667eea18 0%,#764ba218 100%)', borderRadius: 20, border: '1px solid #e0e7ff', textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ ...S.h2, marginBottom: 10 }}>Start free</h2>
            <p style={{ color: '#5F5E5A', marginBottom: 24, fontSize: 15 }}>
              No card needed. Works via the Chrome extension and web editor in under two minutes.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/sign-up" style={{ padding: '12px 28px', borderRadius: 10, background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Start free</Link>
              <Link href="/pricing" style={{ padding: '12px 28px', borderRadius: 10, background: '#fff', color: '#2C2C2A', fontSize: 15, fontWeight: 600, border: '1px solid #D3D1C7', textDecoration: 'none' }}>See pricing</Link>
            </div>
          </div>

          {/* Other comparisons */}
          <OtherComparisons current="immersive-reader" />
        </div>
      </div>
    </>
  );
}
