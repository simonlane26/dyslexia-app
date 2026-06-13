import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import { FileText, User, School, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About DyslexiaWrite',
  description:
    'DyslexiaWrite is a UK-based AI-powered assistive technology platform for dyslexic users — providing writing support, reading assistance, and document comprehension tools.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/about' },
};

const S = {
  page: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: '#2C2C2A',
    lineHeight: 1.7,
    background: '#fff',
  } as React.CSSProperties,
  hero: {
    padding: '80px 40px 64px',
    textAlign: 'center' as const,
    background: 'linear-gradient(180deg,#EDE9FE 0%,#fff 100%)',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: 20,
    background: '#EDE9FE',
    color: '#4338CA',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 20,
    border: '1px solid #C4B5FD',
  },
  h1: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 'clamp(32px,5vw,52px)',
    fontWeight: 600,
    lineHeight: 1.2,
    color: '#2C2C2A',
    maxWidth: 760,
    margin: '0 auto 20px',
  },
  lead: {
    fontSize: 18,
    color: '#5F5E5A',
    maxWidth: 640,
    margin: '0 auto 36px',
    lineHeight: 1.7,
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  btnPrimary: {
    padding: '14px 32px',
    borderRadius: 10,
    background: '#6366f1',
    color: '#fff',
    fontSize: 15,
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-block',
  },
  btnSecondary: {
    padding: '14px 32px',
    borderRadius: 10,
    background: '#fff',
    color: '#2C2C2A',
    fontSize: 15,
    fontWeight: 500,
    border: '1px solid #D3D1C7',
    textDecoration: 'none',
    display: 'inline-block',
  },
  section: { padding: '72px 40px', maxWidth: 860, margin: '0 auto' },
  sectionGray: { padding: '72px 40px', background: '#F8F7F4' },
  sectionInner: { maxWidth: 860, margin: '0 auto' },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#6366f1',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 10,
  },
  h2: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 'clamp(24px,3.5vw,36px)',
    fontWeight: 600,
    lineHeight: 1.25,
    marginBottom: 16,
    color: '#2C2C2A',
  },
  body: { fontSize: 16, color: '#5F5E5A', lineHeight: 1.75, marginBottom: 16 },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
    marginTop: 32,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    padding: '28px 24px',
    border: '1px solid #E9E7E0',
  },
  cardIcon: { fontSize: 28, marginBottom: 12 },
  cardH3: { fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#2C2C2A' },
  cardP: { fontSize: 14, color: '#5F5E5A', lineHeight: 1.6, margin: 0 },
  compTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: 28,
    fontSize: 15,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    background: '#F8F7F4',
    fontWeight: 600,
    color: '#2C2C2A',
    borderBottom: '2px solid #E9E7E0',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #F1EFE8',
    color: '#5F5E5A',
    verticalAlign: 'top' as const,
  },
  tick: { color: '#10b981', fontWeight: 700 },
  cross: { color: '#9ca3af' },
};

export default function AboutPage() {
  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={S.hero}>
        <div style={S.badge}>About DyslexiaWrite</div>
        <h1 style={S.h1}>
          Assistive technology built around how dyslexic people actually think
        </h1>
        <p style={S.lead}>
          DyslexiaWrite is a UK-based AI platform that helps dyslexic individuals, students,
          and employees read and write with confidence — in the classroom, at work, and at home.
        </p>
        <div style={S.actions}>
          <Link href="/sign-up" style={S.btnPrimary}>Try it free</Link>
          <Link href="/pricing" style={S.btnSecondary}>See pricing</Link>
        </div>
      </div>

      {/* What we do */}
      <div style={S.section}>
        <div style={S.sectionLabel}>What we do</div>
        <h2 style={S.h2}>The platform</h2>
        <p style={S.body}>
          DyslexiaWrite provides AI-powered writing assistance, text-to-speech with word-level
          synchronisation, document decoding, a Chrome browser extension, and three reading
          modes — Supported, Guided, and Clean — that track progression over time.
        </p>
        <p style={S.body}>
          Every feature is designed around the specific challenges dyslexia creates: homophones,
          letter reversals, working memory load, and the anxiety that comes with written
          communication. Tools are plain, purposeful, and fast.
        </p>

        <div style={S.grid3}>
          {([
            {
              icon: <img src="/images/Notebookpencil.png" alt="" width={52} height={52} style={{ borderRadius: '8px' }} />,
              title: 'Writing support',
              desc: 'Dyslexia-aware grammar checking, AI sentence rewriting, voice dictation, and a plain-English writing mentor.',
            },
            {
              icon: <img src="/images/Brainbook.png" alt="" width={52} height={52} style={{ borderRadius: '8px' }} />,
              title: 'Reading assistance',
              desc: 'Three reading modes with a spotlight, ruler, and tint. Read-aloud with karaoke word highlighting via ElevenLabs.',
            },
            {
              icon: <FileText size={28} />,
              title: 'Document decoding',
              desc: 'Upload or photograph any document — letter, form, contract — and get a plain-English summary instantly.',
            },
            {
              icon: <img src="/images/LessonCapture.png" alt="" width={52} height={52} style={{ borderRadius: '8px' }} />,
              title: 'Lesson Capture',
              desc: 'Live simplified transcription in class. Generates revision notes, key facts, and a quick quiz automatically.',
            },
            {
              icon: <img src="/images/Brainstorm.png" alt="" width={52} height={52} style={{ borderRadius: '8px' }} />,
              title: 'Meeting Survival Kit',
              desc: 'Prep briefing before meetings. Live simplified transcript. Auto-generated action items and follow-up email.',
            },
            {
              icon: <img src="/images/Storytime.png" alt="" width={52} height={52} style={{ borderRadius: '8px' }} />,
              title: 'Story Mode',
              desc: 'AI-generated personalised stories for children with warmup words, karaoke highlighting, and vocab tracking.',
            },
          ] as { icon: React.ReactNode; title: string; desc: string }[]).map((f) => (
            <div key={f.title} style={S.card}>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
              <h3 style={S.cardH3}>{f.title}</h3>
              <p style={S.cardP}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Who we serve */}
      <div style={S.sectionGray}>
        <div style={S.sectionInner}>
          <div style={S.sectionLabel}>Who we serve</div>
          <h2 style={S.h2}>Three audiences, one platform</h2>
          <div style={{ ...S.grid3, marginTop: 32 }}>
            {([
              {
                icon: <User size={28} />,
                title: 'Individuals',
                desc: 'From £6.99/month. Free tier available with daily usage limits. Access to Work licence at £120/year — typically 100% funded by DWP.',
              },
              {
                icon: <School size={28} />,
                title: 'Schools',
                desc: 'From £300/year for 30 students. Class dashboard, reading mode progression as SENCO evidence, vocabulary growth tracking, and auto-generated termly reports.',
              },
              {
                icon: <Building2 size={28} />,
                title: 'Workplaces',
                desc: 'From £95/user/year. Equality Act Compliance Pack, admin dashboard, Data Processing Agreement, and SSO for enterprise.',
              },
            ] as { icon: React.ReactNode; title: string; desc: string }[]).map((a) => (
              <div key={a.title} style={{ ...S.card, background: '#fff' }}>
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.icon}</div>
                <h3 style={S.cardH3}>{a.title}</h3>
                <p style={S.cardP}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={S.section}>
        <div style={S.sectionLabel}>How we compare</div>
        <h2 style={S.h2}>DyslexiaWrite vs TextHelp Read&amp;Write</h2>
        <p style={S.body}>
          DyslexiaWrite is 70–80% cheaper than TextHelp Read&amp;Write, and includes several
          features TextHelp does not offer.
        </p>
        <table style={S.compTable}>
          <thead>
            <tr>
              <th style={S.th}>Feature</th>
              <th style={S.th}>DyslexiaWrite</th>
              <th style={S.th}>TextHelp R&amp;W</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['AI document decoding', true, false],
              ['Reading mode progression tracking', true, false],
              ['Accessibility Passport', true, false],
              ['Equality Act Compliance Pack', true, false],
              ['Text-to-speech with word highlighting', true, true],
              ['Grammar and spell check', true, true],
              ['Voice dictation', true, true],
              ['Chrome extension', true, true],
              ['Maths support', false, true],
              ['Broad language support', false, true],
            ].map(([label, dw, th]) => (
              <tr key={String(label)}>
                <td style={S.td}>{String(label)}</td>
                <td style={S.td}>
                  {dw ? <span style={S.tick}>✓</span> : <span style={S.cross}>—</span>}
                </td>
                <td style={S.td}>
                  {th ? <span style={S.tick}>✓</span> : <span style={S.cross}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Company */}
      <div style={S.sectionGray}>
        <div style={S.sectionInner}>
          <div style={S.sectionLabel}>The company</div>
          <h2 style={S.h2}>Built in the UK</h2>
          <p style={S.body}>
            DyslexiaWrite is developed by IgnisTech Ltd, based in the UK. The platform is
            GDPR compliant with UK data hosting, and is a registered Incensu education supplier.
          </p>
          <p style={S.body}>
            It is available at{' '}
            <a href="https://www.dyslexiawrite.com" style={{ color: '#6366f1' }}>
              dyslexiawrite.com
            </a>
            , with a free tier and no credit card required to start.
          </p>
          <div style={S.actions}>
            <Link href="/sign-up" style={S.btnPrimary}>Start for free</Link>
            <Link href="/enterprise" style={S.btnSecondary}>Enterprise enquiry</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
