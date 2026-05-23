import type { Metadata } from 'next';
import Link from 'next/link';
import { organizationSchema, faqSchema } from '@/app/schema';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — DyslexiaWrite',
  description:
    'Answers to common questions about DyslexiaWrite, dyslexia assistive technology, pricing, Access to Work funding, and how DyslexiaWrite compares to TextHelp Read&Write.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/faq' },
};

const faqs: { q: string; a: string }[] = [
  {
    q: 'What is the best assistive technology for dyslexia in the UK?',
    a: 'The most widely used dyslexia assistive technology tools in the UK include DyslexiaWrite, TextHelp Read&Write, and Claro Software. DyslexiaWrite offers AI-powered text simplification, document decoding, reading mode progression tracking, and an Accessibility Passport — features not found in most competitors — at a significantly lower price point. For Access to Work-funded employees and school SENCO teams requiring evidence of progression, DyslexiaWrite is a strong option.',
  },
  {
    q: 'How much does dyslexia software cost?',
    a: 'Dyslexia software varies widely in price. DyslexiaWrite starts at £6.99/month for individuals, £300/year for schools (up to 30 students), and £95/user/year for workplaces. An Access to Work licence is available at £120/year — typically 100% funded by DWP. TextHelp Read&Write costs approximately £145–200/user/year, making DyslexiaWrite around 70–80% cheaper.',
  },
  {
    q: 'Is there a cheaper alternative to TextHelp Read&Write?',
    a: 'Yes. DyslexiaWrite is a direct alternative to TextHelp Read&Write at approximately 70–80% lower cost. It offers comparable text-to-speech, grammar checking, and voice dictation, plus features TextHelp does not include: AI document decoding, reading mode progression tracking for SENCO evidence, an Accessibility Passport, and an Equality Act Compliance Pack for employers.',
  },
  {
    q: 'Can Access to Work fund dyslexia software?',
    a: "Yes. The UK Government's Access to Work scheme can fund assistive technology for employees with dyslexia or other disabilities. DyslexiaWrite offers a dedicated Access to Work licence at £120/year, which is typically 100% funded by the Department for Work and Pensions (DWP). Your employer or Access to Work assessor can include it in your support package.",
  },
  {
    q: 'What assistive technology do schools use for dyslexic students?',
    a: 'UK schools commonly use TextHelp Read&Write, Claro Software, or DyslexiaWrite for dyslexic students. DyslexiaWrite is designed specifically for school use with a SENCO class dashboard, reading mode progression tracking that generates evidence for EHCPs, vocabulary growth reporting, and auto-generated termly reports. School plans start at £300/year for up to 30 students. DyslexiaWrite is a registered Incensu education supplier.',
  },
  {
    q: 'Does DyslexiaWrite work on mobile?',
    a: 'Yes. DyslexiaWrite is a web-based PWA (Progressive Web App) that works on any device with a modern browser, including iOS and Android smartphones and tablets. The core writing, reading, and simplification tools are fully functional on mobile. A Chrome browser extension is also available for desktop use on email, Slack, and web pages.',
  },
  {
    q: "What's the difference between DyslexiaWrite and TextHelp Read&Write?",
    a: 'Both tools offer text-to-speech, grammar checking, and voice dictation. DyslexiaWrite adds AI document decoding (explaining any uploaded document in plain language), reading mode progression tracking for SENCO evidence, an Accessibility Passport, Story Mode for children, and a Meeting Survival Kit. TextHelp Read&Write has a longer track record, broader language support, and specialist maths features. DyslexiaWrite is 70–80% cheaper. See the full comparison at dyslexiawrite.com/compare.',
  },
  {
    q: 'What is DyslexiaWrite?',
    a: 'DyslexiaWrite is a UK-based AI-powered assistive technology platform for dyslexic users. It provides writing support (grammar checking, AI rewriting, voice dictation), reading assistance (text-to-speech with word-level highlighting, three reading modes), and document comprehension tools (document decoding, text simplification). It is developed by IgnisTech Ltd.',
  },
  {
    q: 'Is DyslexiaWrite free?',
    a: 'DyslexiaWrite has a free tier with daily usage limits — no credit card required. The Pro plan at £6.99/month gives unlimited access to all individual features. Schools and workplaces have separate annual plans. An Access to Work licence at £120/year is available for UK employees and is typically 100% funded by DWP.',
  },
  {
    q: 'What reading modes does DyslexiaWrite offer?',
    a: 'DyslexiaWrite offers three reading modes: Supported (adds a reading ruler, colour tint, and increased line spacing), Guided (focuses on one sentence at a time with a spotlight), and Clean (removes all distractions for confident readers). Progression through these modes is tracked over time and can be used as SENCO evidence for EHCPs.',
  },
  {
    q: 'Can DyslexiaWrite decode documents and letters?',
    a: "Yes. DyslexiaWrite's Document Decoder allows users to upload or photograph any document — a letter, form, contract, or policy — and receive a plain-English explanation instantly. This is particularly useful for legal documents, NHS letters, or workplace communications that use complex language.",
  },
  {
    q: 'What evidence does DyslexiaWrite provide for EHCP and SEN reports?',
    a: 'DyslexiaWrite tracks reading mode progression over time — from Supported to Guided to Clean — and generates reports showing vocabulary growth and writing session data. These can be used by SENCOs as objective evidence for EHCP reviews and Annual Reviews. The school dashboard provides anonymised data per student without storing any written content.',
  },
  {
    q: 'Does DyslexiaWrite have a Chrome extension?',
    a: 'Yes. DyslexiaWrite offers a Chrome browser extension that brings text simplification and reading support to any website — including email, Slack, Google Docs, and web pages. Users can highlight text and simplify it, or have it read aloud, without leaving the page they are on.',
  },
  {
    q: 'Can employers provide DyslexiaWrite as a reasonable adjustment?',
    a: 'Yes. DyslexiaWrite is designed for workplace use and counts as an assistive technology reasonable adjustment under the Equality Act 2010. The Workplace plan includes an Equality Act Compliance Pack (Reasonable Adjustment Policy template, adjustment records, and a neurodiversity awareness guide) to help HR and line managers implement support properly.',
  },
  {
    q: 'What is an Accessibility Passport?',
    a: "DyslexiaWrite's Accessibility Passport is a personal accessibility profile generated from the user's usage data — their preferred reading mode, font size, TTS voice, and vocabulary. It can be shared with employers or educational institutions to communicate support needs clearly, without the user having to explain them from scratch each time.",
  },
  {
    q: 'Is DyslexiaWrite GDPR compliant?',
    a: 'Yes. DyslexiaWrite is GDPR compliant with UK data hosting. No user-written content is stored on servers or used to train AI models. School usage data is anonymised and limited to aggregate metrics. A Data Processing Agreement is available for enterprise and school customers.',
  },
  {
    q: 'How does DyslexiaWrite help in meetings?',
    a: "DyslexiaWrite's Meeting Survival Kit provides an AI briefing in plain English before a meeting, captures a live simplified transcript in real time, then automatically generates a summary with decisions, action items, and a draft follow-up email. It uses the device microphone and the Web Speech API — no external recording software needed.",
  },
  {
    q: 'What is DyslexiaWrite Story Mode?',
    a: 'Story Mode is a feature for children that generates personalised AI stories based on a chosen theme and reading level. Stories include warmup vocabulary words before reading, karaoke-style word highlighting as the story is read aloud, and a tap-to-decode vocabulary lookup. Free users get one AI-generated story per week; Pro users get unlimited stories.',
  },
];

export default function FAQPage() {
  const jsonLd = [organizationSchema, faqSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          color: '#2C2C2A',
          lineHeight: 1.7,
          background: '#fff',
        }}
      >
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
            Frequently Asked Questions
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
            Questions about DyslexiaWrite and dyslexia assistive technology
          </h1>
          <p
            style={{
              fontSize: 17,
              color: '#5F5E5A',
              maxWidth: 580,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Straightforward answers to the questions people actually ask.
          </p>
        </div>

        {/* FAQ list */}
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px 80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {faqs.map((faq, i) => (
              <details
                key={i}
                style={{
                  borderBottom: '1px solid #E9E7E0',
                  paddingBottom: 0,
                }}
              >
                <summary
                  style={{
                    padding: '20px 0',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#2C2C2A',
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    style={{
                      fontSize: 20,
                      color: '#6366f1',
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    +
                  </span>
                </summary>
                <div
                  style={{
                    paddingBottom: 20,
                    fontSize: 15,
                    color: '#5F5E5A',
                    lineHeight: 1.75,
                  }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: 64,
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
              Still have questions?
            </h2>
            <p style={{ color: '#5F5E5A', marginBottom: 24, fontSize: 15 }}>
              Try DyslexiaWrite free — no credit card needed — or compare it with
              TextHelp Read&amp;Write.
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
                Try free
              </Link>
              <Link
                href="/compare"
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
                See comparison
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
