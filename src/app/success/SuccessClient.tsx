'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';

type Status = 'checking' | 'readyPro' | 'readyFree' | 'error';

export default function SuccessClient(): JSX.Element {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<Status>('checking');
  const redirectedRef = useRef(false);

  const goHome = () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    window.location.replace('/'); // or '/pricing'
  };

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    const check = async () => {
      try {
        await user?.reload?.();
        await new Promise((r) => setTimeout(r, 150));

        const isPro =
          (user?.publicMetadata as any)?.isPro === true ||
          (user as any)?.unsafeMetadata?.isPro === true;

        setStatus(isPro ? 'readyPro' : 'readyFree');

        // brief pause to show success/ready, then send home
        setTimeout(() => !cancelled && goHome(), 600);
      } catch {
        setStatus('error');
        setTimeout(() => !cancelled && goHome(), 2000);
      }
    };

    check();

    // absolute timeout safety
    const t = setTimeout(() => !cancelled && goHome(), 8000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isLoaded, user]);

  const body = (() => {
    if (!isLoaded || status === 'checking') return <div>Activating your account…</div>;
    if (status === 'readyPro')
      return (
        <div>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Subscription Activated!
          </h1>
          <p style={{ color: '#64748b' }}>Redirecting to your app…</p>
        </div>
      );
    if (status === 'readyFree')
      return (
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            You’re all set.
          </h1>
          <p style={{ color: '#64748b' }}>Redirecting…</p>
        </div>
      );
    return (
      <div>
        We’re still finalizing things. This can take a few seconds.
        <br />
        <button
          onClick={goHome}
          style={{
            marginTop: 12,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          Go to app now
        </button>
      </div>
    );
  })();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Lexend, sans-serif',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          maxWidth: '520px',
          width: '100%',
        }}
      >
        {body}
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem' }}>
          Need help?{' '}
          <a href="mailto:support@dyslexiawrite.com" style={{ color: '#3b82f6' }}>
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}



