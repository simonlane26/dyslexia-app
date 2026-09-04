'use client';

import Link from 'next/link';
import { landing } from '@/lib/landingTheme';
import { Reveal } from './Reveal';

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
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
        {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: landing.fontDisplay,
          fontSize: 'clamp(26px, 4vw, 32px)',
          fontWeight: 600,
          marginBottom: '14px',
          color: landing.ink,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function SubBlock({ title, children }: { title: string; children: string }) {
  return (
    <div
      style={{
        background: landing.panel,
        border: `1px solid ${landing.line}`,
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      <h3
        style={{
          fontFamily: landing.fontDisplay,
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '10px',
          color: landing.ink,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '15px', color: landing.inkMuted, lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}

export function HomeInfoSections() {
  return (
    <>
      {/* Who Dyslexia Write is for */}
      <div style={{ padding: '70px 20px', backgroundColor: landing.bgAlt }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Reveal>
            <SectionHead eyebrow="Who it's for" title="Who Dyslexia Write is for" />
            <p
              style={{
                color: landing.inkMuted,
                fontSize: '15.5px',
                maxWidth: '640px',
                margin: '0 auto 32px',
                lineHeight: 1.65,
                textAlign: 'center',
              }}
            >
              Dyslexia Write is built for two groups: adults who need to write confidently at work, and
              students who need to keep up with reading and writing at school, college, or university.
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Reveal>
              <SubBlock title="For adults writing at work">
                At work, Dyslexia Write helps you write emails, reports, and messages without worrying
                about spelling or grammar mistakes standing out. It works inside the tools you already
                use, and — for UK employees — is fundable through the government&apos;s Access to Work
                scheme.
              </SubBlock>
            </Reveal>
            <Reveal>
              <SubBlock title="For students and university writers">
                For students, Dyslexia Write supports essays, coursework, and exam preparation with
                reading modes, a vocabulary builder, and lesson capture tools. Schools and colleges can
                license it site-wide, with a teacher dashboard and no student writing stored.
              </SubBlock>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Access to Work funding */}
      <div style={{ padding: '70px 20px', backgroundColor: landing.bg }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Reveal>
            <SectionHead eyebrow="Funding" title="Getting Dyslexia Write funded through Access to Work" />
            <p
              style={{
                color: landing.inkMuted,
                fontSize: '15.5px',
                maxWidth: '640px',
                margin: '0 auto 32px',
                lineHeight: 1.65,
                textAlign: 'center',
              }}
            >
              If you&apos;re an employee in the UK, Dyslexia Write can be funded in full through the
              government&apos;s Access to Work scheme — most applicants pay nothing themselves.
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            <Reveal>
              <SubBlock title="Am I eligible?">
                If you&apos;re employed or self-employed in the UK, have dyslexia, and it affects your
                work, you can apply for an Access to Work grant. The grant can cover the full cost of
                Dyslexia Write plus training. You apply directly on GOV.UK — you don&apos;t need a
                diagnosis report in every case, and your employer doesn&apos;t pay.
              </SubBlock>
            </Reveal>
            <Reveal>
              <SubBlock title="How to name Dyslexia Write on your application">
                When you speak to your Access to Work assessor, mention Dyslexia Write by name and
                explain that you&apos;ve already tried it — assessors are more likely to recommend a tool
                you have hands-on experience with. If they recommend a different product, you can still
                request Dyslexia Write instead; you have the right to choose the tool that works best for
                you.
              </SubBlock>
            </Reveal>
          </div>
          <Reveal>
            <div style={{ textAlign: 'center' }}>
              <Link
                href="/access-to-work"
                style={{ fontSize: '15px', fontWeight: 700, color: landing.teal }}
              >
                Read the full Access to Work application guide →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* School and college site licences */}
      <div style={{ padding: '70px 20px', backgroundColor: landing.bgAlt }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <SectionHead eyebrow="For schools" title="School and college site licences" />
            <p style={{ color: landing.inkMuted, fontSize: '15.5px', lineHeight: 1.65, marginBottom: '24px' }}>
              Dyslexia Write offers whole-school and college site licences, priced by number of students,
              with a teacher dashboard, child-safe copy with no grades or red marks, and GDPR-compliant EU
              data hosting. Book a demo with your SENCO or inclusion lead to see it in your setting.
            </p>
            <Link
              href="/schools"
              style={{ fontSize: '15px', fontWeight: 700, color: landing.teal }}
            >
              See school and college pricing →
            </Link>
          </Reveal>
        </div>
      </div>
    </>
  );
}
