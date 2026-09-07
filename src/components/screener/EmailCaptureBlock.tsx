'use client';

import { useState, type FormEvent } from 'react';
import { IconCircleCheck } from '@tabler/icons-react';
import styles from './Screener.module.css';

type Audience = 'self' | 'parent-sen' | 'employer';
type ScreenerResultCode = 'likely' | 'possible' | 'unlikely';
type Status = 'idle' | 'submitting' | 'success' | 'error';

interface EmailCaptureBlockProps {
  screenerResult: ScreenerResultCode;
  resultTitle: string;
  source?: string;
}

const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: 'self', label: 'Me' },
  { value: 'parent-sen', label: 'My child or student' },
  { value: 'employer', label: 'My team at work' },
];

export function EmailCaptureBlock({ screenerResult, resultTitle, source = 'free-screener' }: EmailCaptureBlockProps) {
  const [email, setEmail] = useState('');
  const [audience, setAudience] = useState<Audience | null>(null);
  const [company, setCompany] = useState(''); // honeypot — left empty by real visitors
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/screener/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          audience,
          company, // honeypot
          screener_result: screenerResult,
          result_title: resultTitle,
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

  if (status === 'success') {
    return (
      <div className={styles.leadBox}>
        <div className={styles.leadSuccess}>
          <IconCircleCheck aria-hidden="true" size={22} stroke={1.75} color="#1D9E75" />
          <div>
            <div className={styles.leadSuccessTitle}>Sent — check your inbox in the next minute.</div>
            <div className={styles.leadSuccessSub}>
              Not there? Check spam, or add results@dyslexiawrite.com to your contacts.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.leadBox}>
      <div className={styles.leadHeadline}>Get your screener results by email</div>
      <p className={styles.leadSub}>
        We&apos;ll send your result plus a 1-page guide: 5 writing workarounds that help most adults with
        dyslexia — and how to ask your employer or school to fund assistive tech.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — visually hidden from sighted users, skipped by screen readers */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor="lead-company">Company</label>
          <input
            id="lead-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <label htmlFor="lead-email" className={styles.leadLabel}>
          Your email
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.leadInput}
        />

        <fieldset className={styles.leadFieldset}>
          <legend className={styles.leadLabel}>This is for… (optional)</legend>
          <div className={styles.leadRadioRow}>
            {AUDIENCE_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.leadRadioOption}>
                <input
                  type="radio"
                  name="audience"
                  value={opt.value}
                  checked={audience === opt.value}
                  onChange={() => setAudience(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        {status === 'error' && (
          <div className={styles.leadError} role="alert">
            {errorMsg}
          </div>
        )}

        <button type="submit" className={styles.leadButton} disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Email me my results'}
        </button>
        <div className={styles.leadMicro}>One email now, occasional tips after. Unsubscribe anytime.</div>
      </form>
    </div>
  );
}
