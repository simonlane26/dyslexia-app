'use client';

import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';
import { CHROME_EXTENSION_ID } from '@/lib/chromeExtension';

// Chrome injects a limited chrome.runtime global into pages whose origin an
// installed extension lists in externally_connectable — regular sites don't
// have this, so its presence (plus a successful DW_PING round-trip) is how
// we tell whether the extension is actually installed before offering the
// one-click connect button instead of the copy/paste fallback.
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback: (response: unknown) => void
        ) => void;
        lastError?: { message?: string };
      };
    };
  }
}

function sendToExtension(message: unknown): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const runtime = window.chrome?.runtime;
    if (!runtime?.sendMessage) {
      resolve({ ok: false, error: 'not available' });
      return;
    }
    try {
      runtime.sendMessage(CHROME_EXTENSION_ID, message, (response: any) => {
        if (runtime.lastError || !response?.ok) {
          resolve({ ok: false, error: runtime.lastError?.message || response?.error });
        } else {
          resolve({ ok: true });
        }
      });
    } catch {
      resolve({ ok: false, error: 'send failed' });
    }
  });
}

export default function ExtensionConnectPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    sendToExtension({ type: 'DW_PING' }).then((res) => setExtensionDetected(res.ok));
  }, []);

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

  const connectDirectly = useCallback(async () => {
    if (!token) return;
    setConnecting(true);
    setConnectError('');
    const res = await sendToExtension({ type: 'DW_CONNECT_TOKEN', token });
    setConnecting(false);
    if (res.ok) {
      setConnected(true);
    } else {
      setConnectError("Couldn't reach the extension automatically — use the manual steps below instead.");
      setShowManual(true);
    }
  }, [token]);

  if (!isLoaded) return null;

  const email = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FBF7EF, #FBEEDA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '480px', width: '100%', boxShadow: '0 8px 40px rgba(217,140,43,0.12)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #D98C2B, #B06F1D)', borderRadius: '14px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>✨</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#2B2A28', margin: '0 0 8px' }}>Connect your account</h1>
          <p style={{ fontSize: '14px', color: '#6B6558', lineHeight: '1.6', margin: 0 }}>
            Link your DyslexiaWrite account to the Chrome extension to unlock AI Simplify.
          </p>
        </div>

        {!isSignedIn ? (
          /* Not signed in */
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#6B6558', marginBottom: '20px' }}>
              Sign in to your DyslexiaWrite account first.
            </p>
            <SignInButton mode="modal">
              <button style={{ background: 'linear-gradient(135deg, #D98C2B, #B06F1D)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                Sign in
              </button>
            </SignInButton>
            <p style={{ fontSize: '13px', color: '#9C9686', marginTop: '16px' }}>
              Don&apos;t have an account?{' '}
              <a href="https://dyslexiawrite.com" style={{ color: '#D98C2B', textDecoration: 'none', fontWeight: '600' }}>Sign up free</a>
            </p>
          </div>

        ) : !token ? (
          /* Signed in — generate token */
          <div>
            <div style={{ background: '#F4EEDE', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #D98C2B, #B06F1D)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', fontWeight: '700', flexShrink: 0 }}>
                {email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#2B2A28' }}>{email}</div>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>Signed in</div>
              </div>
            </div>

            <button
              onClick={getToken}
              disabled={loading}
              style={{ width: '100%', background: loading ? '#E6DECB' : 'linear-gradient(135deg, #D98C2B, #B06F1D)', color: loading ? '#9C9686' : 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Generating token…' : 'Get my connection token'}
            </button>

            {error && (
              <p style={{ fontSize: '13px', color: '#dc2626', marginTop: '12px', textAlign: 'center' }}>{error}</p>
            )}
          </div>

        ) : connected ? (
          /* Connected automatically — the whole point of the one-click path */
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '22px', fontWeight: '700' }}>✓</div>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#2B2A28', margin: '0 0 8px' }}>Connected!</h2>
            <p style={{ fontSize: '14px', color: '#6B6558', lineHeight: '1.6', margin: 0 }}>
              AI Simplify is now unlocked. You can close this tab and start writing.
            </p>
          </div>

        ) : extensionDetected && !showManual ? (
          /* Extension found on this device — skip the copy/paste entirely */
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#166534', textAlign: 'center' }}>
              DyslexiaWrite extension detected on this browser
            </div>

            <button
              onClick={connectDirectly}
              disabled={connecting}
              style={{ width: '100%', background: connecting ? '#E6DECB' : 'linear-gradient(135deg, #D98C2B, #B06F1D)', color: connecting ? '#9C9686' : 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: connecting ? 'not-allowed' : 'pointer', marginBottom: '12px' }}
            >
              {connecting ? 'Connecting…' : 'Connect extension'}
            </button>

            {connectError && (
              <p style={{ fontSize: '13px', color: '#dc2626', marginBottom: '12px', textAlign: 'center' }}>{connectError}</p>
            )}

            <button
              onClick={() => setShowManual(true)}
              style={{ width: '100%', background: 'transparent', color: '#6B6558', border: 'none', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Connect manually instead
            </button>
          </div>

        ) : (
          /* Manual fallback — extension not detected on this device/browser,
             or the user asked for the copy/paste path directly */
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Your token is ready</div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6B6558', wordBreak: 'break-all', lineHeight: '1.6', background: 'white', borderRadius: '6px', padding: '8px 10px', border: '1px solid #E6DECB' }}>
                {token}
              </div>
            </div>

            <button
              onClick={copy}
              style={{ width: '100%', background: copied ? '#16a34a' : 'linear-gradient(135deg, #D98C2B, #B06F1D)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '20px', transition: 'background 0.2s' }}
            >
              {copied ? 'Copied!' : 'Copy token'}
            </button>

            <div style={{ background: '#FBEEDA', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#D98C2B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next steps</div>
              <ol style={{ paddingLeft: '18px', margin: 0 }}>
                {['Open the DyslexiaWrite extension in Chrome.', 'Click "Connect account" in the extension.', 'Paste the token and click Connect.', 'AI Simplify is now unlocked.'].map((step, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#7A4A14', lineHeight: '1.7', marginBottom: i < 3 ? '4px' : 0 }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
