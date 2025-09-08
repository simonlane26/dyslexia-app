// src/app/success/SuccessClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function SuccessClient(): JSX.Element {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = useMemo(() => params?.get('session_id') ?? null, [params]);

  const { user, isLoaded, isSignedIn } = useUser();
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [tries, setTries] = useState(0);

  // Poll Clerk for updated metadata (handles slight webhook delay)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;
    let timer: any;

    const check = async () => {
      try {
        await user?.reload(); // pull latest privateMetadata
        const isPro = (user as any)?.privateMetadata?.isPro === true;
        if (isPro) {
          if (!cancelled) setStatus('ready');
          // small pause so the UI shows the success briefly, then go home
          setTimeout(() => {
            if (!cancelled) router.replace('/');
          }, 700);
          return;
        }
      } catch {
        // ignore and keep polling
      }

      // try up to ~10 seconds total
      if (!cancelled && tries < 10) {
        timer = setTimeout(() => setTries((t) => t + 1), 1000);
      } else if (!cancelled) {
        setStatus('error'); // webhook hasn’t landed yet
      }
    };

    check();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isLoaded, isSignedIn, user, tries, router]);

  const body = (() => {
    if (!isLoaded) {
      return <div>Loading…</div>;
    }
    if (!isSignedIn) {
      return <div>Please sign in to view your subscription status.</div>;
    }
    if (status === 'checking') {
      return <div>Activating your Pro features…</div>;
    }
    if (status === 'error') {
      return (
        <div>
          We’re still finalizing your upgrade. This can take a few seconds.
          <br />
          <button
            onClick={() => setTries(0)}
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
            Try again
          </button>
        </div>
      );
    }
    // status === 'ready'
    return (
      <div>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
          Subscription Activated!
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.125rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Welcome to Pro! You now have access to premium features.
        </p>
        {sessionId && (
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Checkout session: {sessionId}
          </p>
        )}
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

