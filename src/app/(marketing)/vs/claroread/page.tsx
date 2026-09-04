import type { Metadata } from 'next';
import Link from 'next/link';
import { organizationSchema } from '@/app/schema';
import { OtherComparisons } from '@/components/OtherComparisons';

export const metadata: Metadata = {
  title: 'Dyslexia Write vs ClaroRead — Which One Actually Helps You Write with Dyslexia?',
  description:
    'An honest comparison of Dyslexia Write and ClaroRead: phonetic spelling correction, word prediction, OCR scanning, pricing, and Access to Work funding.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/vs/claroread' },
};

const comparisonSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Dyslexia Write vs ClaroRead Comparison',
  url: 'https://www.dyslexiawrite.com/vs/claroread',
  description:
    'An honest comparison of Dyslexia Write and ClaroRead, covering phonetic spelling correction, word prediction, OCR scanning, pricing, and Access to Work funding.',
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
        name: 'ClaroRead',
        url: 'https://www.everway.com/en-gb/products/claroread/',
        description: 'Literacy support software for schools and Access to Work, made by Everway (formerly Texthelp).',
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
      name: 'Is ClaroRead the same company as TextHelp Read&Write?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes, effectively. Claro Software was acquired by the Texthelp Group, and Texthelp has since rebranded to Everway. ClaroRead and Read&Write are now sibling products from the same company.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does ClaroRead have word prediction?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — word prediction is one of its real strengths. Dyslexia Write does not currently offer word prediction; it focuses on correcting what you have already typed or dictated.',
      },
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
  ['Built for', 'Dyslexic writers', 'Dyslexic/SEN readers and writers — schools and Access to Work'],
  ['Same vendor as TextHelp Read&Write', false, true, 'ClaroRead is made by Everway, formerly Texthelp Group'],
  ['Phonetic spelling correction ("nolij" → knowledge)', true, true, 'ClaroRead’s speaking spellchecker is genuinely strong here too'],
  ['Homophone help, meanings shown in plain English', true, 'Partial'],
  ['Word prediction as you type', false, true, 'A real ClaroRead strength — Dyslexia Write focuses on correcting what you’ve already written'],
  ['OCR — scan paper documents to text', false, true, 'Another genuine ClaroRead strength if you work from printed material'],
  ['AI document decoding (explain any document in plain English)', true, false],
  ['Read-aloud with word highlighting', true, true],
  ['Voice dictation', true, 'Via bundled Dragon', 'ClaroRead dictation requires a separate Dragon Professional licence'],
  ['Modern AI-based correction (not dictionary lookup)', true, false],
  ['Native Word / Outlook add-in', false, true],
  ['Chrome extension (Gmail, Docs, Slack, web)', true, false],
  ['Access to Work fundable', true, true],
  ['School / college site licence', true, true],
];

const pricingRows: [string, string, string][] = [
  ['Free tier', 'Yes — daily limits, no time limit', 'No — paid licence required'],
  ['Individual / annual', '~£84/year (£6.99/month)', 'From £250/year'],
  ['Access to Work licence', '£120/year — typically 100% DWP-funded', '~£250/year — also Access to Work eligible'],
  ['School site licence (30 students)', '£300/year', 'From £1,250/year'],
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

export default function VsClaroReadPage() {
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
            Dyslexia Write vs ClaroRead: which one actually helps you write with dyslexia?
          </h1>
          <p style={{ fontSize: 16, color: '#5F5E5A', maxWidth: 640, margin: '0 auto 12px', lineHeight: 1.65 }}>
            ClaroRead is a genuine dyslexia-specific tool, not a general grammar checker — it&apos;s a fair
            fight, and we&apos;re not going to pretend otherwise. It also happens to be made by Everway,
            the same company behind TextHelp Read&amp;Write, since Claro Software was folded into the
            Texthelp Group a few years ago.
          </p>
          <p style={{ fontSize: 16, color: '#5F5E5A', maxWidth: 640, margin: '0 auto', lineHeight: 1.65 }}>
            Here&apos;s where each one actually wins.
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
                strengths: ['Modern AI-based correction, not dictionary lookup', 'AI document decoding', 'Homophones explained in plain English', 'Access to Work fundable', 'Roughly a third of the price'],
                limitations: ['No word prediction', 'No OCR / paper scanning', 'No native Word/Outlook add-in — Chrome extension and web editor today'],
                cta: { label: 'Try free', href: '/sign-up' },
              },
              {
                name: 'ClaroRead',
                tag: 'Competitor',
                tagColor: '#6b7280',
                price: 'From £250/year',
                strengths: ['Word prediction as you type', 'OCR — scan paper documents to text', 'Native Word and Outlook add-ins', '20+ year track record in UK schools'],
                limitations: ['Significantly more expensive', 'Dictation needs a separate Dragon licence', 'Traditional dictionary-based correction, not AI'],
                cta: { label: 'everway.com', href: 'https://www.everway.com/en-gb/products/claroread/' },
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
            If you need to scan printed worksheets or want word prediction as you type, ClaroRead does
            those things and Dyslexia Write doesn&apos;t — not yet. If you want AI that understands what
            you meant to type, explains any document in plain English, and costs a third of the price,
            that&apos;s us.
          </p>

          {/* Side by side */}
          <h2 style={S.h2}>Side by side</h2>
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '44%' }}>Feature</th>
                  <th style={{ ...S.th, width: '28%' }}>Dyslexia Write</th>
                  <th style={{ ...S.th, width: '28%' }}>ClaroRead</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map(([feat, dw, cr, note]) => (
                  <tr key={String(feat)}>
                    <td style={S.td}>{String(feat)}{note && <div style={S.note}>{note}</div>}</td>
                    <td style={S.td}><Cell v={dw} /></td>
                    <td style={S.td}><Cell v={cr} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 56 }}>
            ClaroRead pricing and features from everway.com as of{' '}
            {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}. Pricing changes —
            check everway.com for the current rate before you buy.
          </p>

          {/* Where ClaroRead wins */}
          <h2 style={S.h2}>Where ClaroRead is genuinely better</h2>
          <p style={S.body}>
            Word prediction as you type, OCR scanning of printed documents, and native Word/Outlook
            add-ins. It also has a two-decade track record in UK schools and Access to Work assessments —
            plenty of assessors already know it by name. If those specific things matter most to you,
            ClaroRead is a solid, established choice.
          </p>

          {/* Where DW wins */}
          <h2 style={S.h2}>Where we&apos;re better</h2>
          <p style={S.body}>
            Dyslexia Write uses AI to understand what you meant, not a fixed dictionary — so it handles
            spelling that&apos;s further from the target word. It explains any document in plain English,
            costs roughly a third of ClaroRead&apos;s individual price, and doesn&apos;t require a separate
            licence for dictation. It&apos;s also a newer product, which cuts both ways: fewer legacy
            features, but built for how people actually write today.
          </p>

          {/* Funding */}
          <h2 style={S.h2}>If someone else is paying</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 56 }}>
            <div style={{ border: '1px solid #E9E7E0', borderRadius: 14, padding: '22px 20px' }}>
              <h3 style={S.h3}>Employed in the UK?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 14 }}>
                Both products are Access to Work eligible. We&apos;ll send you a quote and spec sheet
                formatted for the application.
              </p>
              <Link href="/access-to-work" style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>
                See how Access to Work funding works →
              </Link>
            </div>
            <div style={{ border: '1px solid #E9E7E0', borderRadius: 14, padding: '22px 20px' }}>
              <h3 style={S.h3}>Buying for a school?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 14 }}>
                Site licences start at £300/year for up to 30 students — roughly a quarter of ClaroRead&apos;s
                published school pricing.
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
              <h3 style={S.h3}>Is ClaroRead the same company as TextHelp Read&amp;Write?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6 }}>
                Yes, effectively. Claro Software was acquired by the Texthelp Group, and Texthelp has
                since rebranded to Everway. ClaroRead and Read&amp;Write are now sibling products from
                the same company.
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={S.h3}>Does ClaroRead have word prediction?</h3>
              <p style={{ fontSize: 14.5, color: '#5F5E5A', lineHeight: 1.6 }}>
                Yes — it&apos;s one of its real strengths. Dyslexia Write doesn&apos;t currently offer
                word prediction; it focuses on correcting what you&apos;ve already typed or dictated.
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
            ClaroRead pricing changes — verify the current rate at everway.com before you buy.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: 56 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '34%' }}>Plan</th>
                  <th style={{ ...S.th, width: '33%' }}>Dyslexia Write</th>
                  <th style={{ ...S.th, width: '33%' }}>ClaroRead</th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map(([plan, dw, cr]) => (
                  <tr key={plan}>
                    <td style={{ ...S.td, fontWeight: 500, color: '#374151' }}>{plan}</td>
                    <td style={{ ...S.td, color: '#6366f1', fontWeight: 600 }}>{dw}</td>
                    <td style={S.td}>{cr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <OtherComparisons current="claroread" />
        </div>
      </div>
    </>
  );
}
