'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // You could verify the session with Stripe here if needed
    setLoading(false);
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Lexend, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Lexend, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        padding: '3rem',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          Subscription Activated!
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '1.125rem',
          marginBottom: '1rem',
          lineHeight: 1.6
        }}>
          Welcome to Pro! Your subscription has been activated and you now have access to:
        </p>
        
        <ul style={{
          color: '#64748b',
          fontSize: '1rem',
          marginBottom: '2rem',
          lineHeight: 1.8,
          textAlign: 'left',
          paddingLeft: '1.5rem'
        }}>
          <li>✓ Unlimited simplifications</li>
          <li>✓ All premium voices</li>
          <li>✓ MP3 export capabilities</li>
          <li>✓ Advanced font & color tools</li>
        </ul>
        
        <p style={{
          color: '#94a3b8',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          fontStyle: 'italic'
        }}>
          Your subscription will automatically renew each month. You can manage your subscription anytime from your account settings.
        </p>
        
        {sessionId && (
          <p style={{
            color: '#94a3b8',
            fontSize: '0.75rem',
            marginBottom: '2rem'
          }}>
            Session ID: {sessionId}
          </p>
        )}
        
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Start Using Pro Features
        </button>
        
        <div style={{
          color: '#94a3b8',
          fontSize: '0.75rem'
        }}>
          Need help? <a href="mailto:support@dyslexiawriter.com" style={{ color: '#3b82f6' }}>Contact support</a>
        </div>
      </div>
    </div>
  );
}
