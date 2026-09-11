'use client';

import { useState, type FormEvent } from 'react';
import { landing } from '@/lib/landingTheme';

type ApplyingVia = 'access-to-work' | 'school-university' | 'employer' | 'not-sure';
type Status = 'idle' | 'submitting' | 'success' | 'error';

const APPLYING_VIA_OPTIONS: { value: ApplyingVia; label: string }[] = [
  { value: 'access-to-work', label: "I'm applying via Access to Work" },
  { value: 'school-university', label: 'School or university' },
  { value: 'employer', label: 'My employer' },
  { value: 'not-sure', label: 'Not sure yet' },
];

const BULLETS = [
  'A step-by-step breakdown of the Access to Work application for assistive software',
  'The exact wording that speeds up approval for writing tools like Dyslexia Write',
  'A funding request template you can hand to your employer, SENCO, or Access to Work assessor',
  "A check-in email in a few weeks with tips on chasing your application if you haven't heard back",
];

interface AccessToWorkGuideOptInProps {
  source?: string;
}

export function AccessToWorkGuideOptIn({ source = 'homepage' }: AccessToWorkGuideOptInProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [applyingVia, setApplyingVia] = useState<ApplyingVia | ''>('');
  const [company, setCompany] = useState(''); // honeypot — left empty by real visitors
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/access-to-work-guide/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          applying_via: applyingVia || null,
          company, // honeypot
          source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data?.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  const cardStyle: React.CSSProperties = {
    background: landing.panel,
    border: `1px solid ${landing.line}`,
    borderRadius: '20px',
    padding: '44px 40px',
    maxWidth: '720px',
    margin: '0 auto',
  };

  if (status === 'success') {
    return (
      <div style={{ maxWidth: '1160px', margin: '56px auto', padding: '0 20px' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: landing.tealTint,
              color: landing.teal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '22px',
              fontWeight: 700,
            }}
            aria-hidden="true"
          >
            ✓
          </div>
          <h3
            style={{
              fontFamily: landing.fontDisplay,
              fontSize: '22px',
              fontWeight: 600,
              color: landing.ink,
              marginBottom: '8px',
            }}
          >
            Thanks — check your inbox
          </h3>
          <p style={{ color: landing.inkMuted, fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            Your guide&apos;s on its way, and we&apos;ll follow up in a few weeks to see how the
            application&apos;s going.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1160px', margin: '56px auto', padding: '0 20px' }}>
      <div style={cardStyle}>
        <div
          style={{
            display: 'inline-block',
            fontSize: '13px',
            fontWeight: 700,
            color: landing.teal,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '14px',
          }}
        >
          Not ready to start today?
        </div>
        <h2
          style={{
            fontFamily: landing.fontDisplay,
            fontSize: 'clamp(22px, 3.2vw, 28px)',
            fontWeight: 600,
            color: landing.ink,
            marginBottom: '10px',
            maxWidth: '520px',
          }}
        >
          Waiting on Access to Work funding? Don&apos;t lose your spot in the queue.
        </h2>
        <p style={{ color: landing.inkMuted, fontSize: '15.5px', lineHeight: 1.65, marginBottom: '20px', maxWidth: '560px' }}>
          Get our free guide to the Access to Work assessment process — plus a heads-up when
          you&apos;re ready to start your trial.
        </p>

        <p style={{ color: landing.inkMuted, fontSize: '14.5px', lineHeight: 1.7, marginBottom: '16px', maxWidth: '580px' }}>
          Access to Work aims to decide within 25 working days — but current DWP-reported backlogs
          mean many applicants are waiting several months for a decision. That&apos;s a long time
          to sit on a &ldquo;yes&rdquo; with no plan.
        </p>
        <p style={{ color: landing.ink, fontSize: '14.5px', fontWeight: 600, marginBottom: '10px' }}>
          While you wait, we&apos;ll send you:
        </p>
        <ul style={{ margin: '0 0 24px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {BULLETS.map((b) => (
            <li key={b} style={{ display: 'flex', gap: '10px', fontSize: '14.5px', color: landing.inkMuted, lineHeight: 1.6 }}>
              <span style={{ color: landing.teal, flexShrink: 0 }} aria-hidden="true">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: '13.5px', color: landing.inkFaint, marginBottom: '28px' }}>
          No spam, no sales calls. Just what you need to get funded and get started.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot — visually hidden from sighted users, skipped by screen readers */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
            <label htmlFor={`atw-company-${source}`}>Company</label>
            <input
              id={`atw-company-${source}`}
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: '2 1 220px' }}>
              <label htmlFor={`atw-email-${source}`} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: landing.ink, marginBottom: '6px' }}>
                Email address
              </label>
              <input
                id={`atw-email-${source}`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${landing.line}`,
                  fontSize: '14.5px',
                  fontFamily: landing.fontBody,
                  color: landing.ink,
                  background: '#fff',
                }}
              />
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <label htmlFor={`atw-name-${source}`} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: landing.ink, marginBottom: '6px' }}>
                First name <span style={{ fontWeight: 400, color: landing.inkFaint }}>(optional)</span>
              </label>
              <input
                id={`atw-name-${source}`}
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${landing.line}`,
                  fontSize: '14.5px',
                  fontFamily: landing.fontBody,
                  color: landing.ink,
                  background: '#fff',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label htmlFor={`atw-applying-via-${source}`} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: landing.ink, marginBottom: '6px' }}>
              I&apos;m applying via <span style={{ fontWeight: 400, color: landing.inkFaint }}>(optional)</span>
            </label>
            <select
              id={`atw-applying-via-${source}`}
              name="applyingVia"
              value={applyingVia}
              onChange={(e) => setApplyingVia(e.target.value as ApplyingVia)}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '11px 14px',
                borderRadius: '10px',
                border: `1px solid ${landing.line}`,
                fontSize: '14.5px',
                fontFamily: landing.fontBody,
                color: landing.ink,
                background: '#fff',
              }}
            >
              <option value="">Choose one…</option>
              {APPLYING_VIA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {status === 'error' && (
            <div
              role="alert"
              style={{ fontSize: '13.5px', color: '#9A3412', background: '#FFF1E5', border: '1px solid #FDBA74', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              background: landing.teal,
              color: '#fff',
              fontWeight: 700,
              fontSize: '15px',
              padding: '13px 28px',
              borderRadius: '24px',
              border: 'none',
              cursor: status === 'submitting' ? 'default' : 'pointer',
              opacity: status === 'submitting' ? 0.7 : 1,
            }}
          >
            {status === 'submitting' ? 'Sending…' : 'Send me the funding guide'}
          </button>
          <p style={{ fontSize: '12.5px', color: landing.inkFaint, marginTop: '12px', lineHeight: 1.5, maxWidth: '480px' }}>
            We&apos;ll email it straight away. Unsubscribe any time — this isn&apos;t a marketing
            list, it&apos;s a heads-up service for people mid-funding.
          </p>
        </form>
      </div>
    </div>
  );
}
