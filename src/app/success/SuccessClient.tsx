// src/app/success/SuccessClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

type Status = 'checking' | 'readyPro' | 'readyFree' | 'error';

export default function SuccessClient(): JSX.Element {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = useMemo(() => params?.get('session_id') ?? null, [params]);
  const planParam = useMemo(() => (params?.get('plan') ?? '').toLowerCase(), [params]); // optional hint: ?plan=free

  const { user, isLoaded, isSignedIn } = useUser();
  const [status, setStatus] = useState<Status>('checking');
  const triesRef = useRef(0);
  const redirectedRef = useRef(false);

  const goHome = () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    router.replace('/'); // change destination if you prefer
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // If there's NO Stripe session, assume Free flow (or generic success)
    const isFreeFlow = !sessionId || planParam === 'free';

    if (isFreeFlow) {
      setStatus('readyFree');
      const t = setTimeout(goHome, 800);
      return () => clearTimeout(t);
    }

    // Otherwise, we came from Checkout → poll for Pro activation briefly
    let cancelled = false;

    const isProFromPublic = () =>
      (user?.publicMetadata as Record<string, unknown> | undefined)?.['isPro'] === true;

    const tick = async () => {
      try {
        await user?.reload?.();
        await new Promise((r) => setTimeout(r, 150));

        if (isProFromPublic()) {
          if (!cancelled) setStatus('readyPro');
          setTimeout(() => !cancelled && goHome(), 600);
          return;
        }
      } catch {
        /* ignore */
      }

      if (triesRef.current < 10 && !cancelled) {
        triesRef.current += 1;
        setTimeout(() => !cancelled && tick(), 1000); // ~10s total
      } else if (!cancelled) {
        setStatus('error');
        setTimeout(() => !cancelled && goHome(), 3000);
      }
    };

    // If already Pro, short-circuit
    if (isProFromPublic()) {
      setStatus('readyPro');
      const t = setTimeout(goHome, 600);
      return () => clearTimeout(t);
    }

    tick();

    // Absolute safety timeout
    const absolute = setTimeout(() => !cancelled && goHome(), 8000);
    return () => {
      cancelled = true;
      clearTimeout(absolute);
    };
  }, [isLoaded, isSignedIn, user, sessionId, planParam, router]);

  const body = (() => {
    if (!isLoaded) return <div>Loading…</div>;
    if (!isSignedIn) return <div>Please sign in to view your subscription status.</div>;

    if (status === 'readyFree') {
      return (
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            You’re all set!
          </h1>
          <p style={{ color: '#64748b' }}>You’re on the Free plan. Taking you to the app…</p>
        </div>
      );
    }

    if (status === 'checking') {
      // This only shows for checkout flows now (not Free)
      return <div>Activating your Pro features…</div>;
    }

    if (status === 'readyPro') {
      return (
        <div>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
            Subscription Activated!
          </h1>
          <p style={{ color: '#64748b' }}>Redirecting to your app…</p>
          {sessionId && (
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Checkout session: {sessionId}
            </p>
          )}
        </div>
      );
    }

    // status === 'error'
    return (
      <div>
        We’re still finalizing your upgrade. This can take a few seconds.
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
        {sessionId && (
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 8 }}>
            Checkout session: {sessionId}
          </div>
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



