'use client';

import { useAuth } from '@clerk/nextjs';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function WelcomeClient() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  if (!isLoaded) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '480px', width: '100%', boxShadow: '0 8px 40px rgba(124,58,237,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: '14px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>✨</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 10px' }}>You&apos;re in!</h1>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
            The DyslexiaWrite extension is installed. One more step: connect it to your
            account to unlock AI Simplify, read-aloud, and spelling help in Gmail, Outlook,
            Slack, Teams, and anywhere else you write.
          </p>
        </div>

        {isSignedIn ? (
          <div>
            <button
              onClick={() => router.push('/extension-connect')}
              style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
            >
              Continue to connect your extension
            </button>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '14px', textAlign: 'center' }}>
              Takes about 30 seconds.
            </p>
          </div>
        ) : (
          <div>
            <SignUpButton mode="modal">
              <button style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' }}>
                Sign up free — no card needed
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button style={{ width: '100%', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                Already have an account? Sign in
              </button>
            </SignInButton>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '14px', textAlign: 'center' }}>
              After signing in you&apos;ll connect the extension in about 30 seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
