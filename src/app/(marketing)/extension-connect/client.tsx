'use client';

import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { useState } from 'react';

export default function ExtensionConnectPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getToken() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/extension-token', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!isLoaded) return null;

  const email = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '480px', width: '100%', boxShadow: '0 8px 40px rgba(124,58,237,0.1)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: '14px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>✨</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>Connect your account</h1>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
            Link your Dyslexia Write account to the Chrome extension to unlock AI Simplify.
          </p>
        </div>

        {!isSignedIn ? (
          /* Not signed in */
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Sign in to your Dyslexia Write account first.
            </p>
            <SignInButton mode="modal">
              <button style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                Sign in
              </button>
            </SignInButton>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '16px' }}>
              Don&apos;t have an account?{' '}
              <a href="https://dyslexiawrite.com" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}>Sign up free</a>
            </p>
          </div>

        ) : !token ? (
          /* Signed in — generate token */
          <div>
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', fontWeight: '700', flexShrink: 0 }}>
                {email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{email}</div>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>Signed in</div>
              </div>
            </div>

            <button
              onClick={getToken}
              disabled={loading}
              style={{ width: '100%', background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed, #2563eb)', color: loading ? '#94a3b8' : 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Generating token…' : 'Get my connection token'}
            </button>

            {error && (
              <p style={{ fontSize: '13px', color: '#dc2626', marginTop: '12px', textAlign: 'center' }}>{error}</p>
            )}
          </div>

        ) : (
          /* Token ready */
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Your token is ready</div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#475569', wordBreak: 'break-all', lineHeight: '1.6', background: 'white', borderRadius: '6px', padding: '8px 10px', border: '1px solid #e2e8f0' }}>
                {token}
              </div>
            </div>

            <button
              onClick={copy}
              style={{ width: '100%', background: copied ? '#16a34a' : 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '20px', transition: 'background 0.2s' }}
            >
              {copied ? 'Copied!' : 'Copy token'}
            </button>

            <div style={{ background: '#ede9fe', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#7c3aed', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next steps</div>
              <ol style={{ paddingLeft: '18px', margin: 0 }}>
                {['Open the Dyslexia Write extension in Chrome.', 'Click "Connect account" in the extension.', 'Paste the token and click Connect.', 'AI Simplify is now unlocked.'].map((step, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#4c1d95', lineHeight: '1.7', marginBottom: i < 3 ? '4px' : 0 }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
