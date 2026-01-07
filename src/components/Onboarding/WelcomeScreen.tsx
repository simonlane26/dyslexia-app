'use client';

import { ModernButton } from '../ModernButton';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStartWriting: () => void;
  onCustomizeSettings: () => void;
  theme: any;
  darkMode: boolean;
}

export function WelcomeScreen({
  onStartWriting,
  onCustomizeSettings,
  theme,
  darkMode,
}: WelcomeScreenProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          backgroundColor: theme.bg,
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          border: `2px solid ${theme.border}`,
        }}
      >
        {/* Sparkle icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={40} style={{ color: '#667eea' }} />
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '36px',
            fontWeight: '800',
            color: theme.text,
            marginBottom: '16px',
            lineHeight: '1.2',
          }}
        >
          Let's make writing easier 😊
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: '20px',
            color: theme.text,
            opacity: 0.8,
            marginBottom: '40px',
            lineHeight: '1.6',
          }}
        >
          I'll help you write clearly, confidently, and comfortably.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          <ModernButton
            variant="primary"
            onClick={onStartWriting}
            style={{
              fontSize: '18px',
              padding: '16px 32px',
              width: '100%',
            }}
          >
            ✔ Start Writing
          </ModernButton>

          <ModernButton
            variant="secondary"
            onClick={onCustomizeSettings}
            style={{
              fontSize: '16px',
              padding: '14px 28px',
              width: '100%',
            }}
          >
            Or customise comfort settings
          </ModernButton>
        </div>

        {/* Reassurance text */}
        <p
          style={{
            fontSize: '14px',
            color: theme.text,
            opacity: 0.6,
            marginTop: '24px',
            fontStyle: 'italic',
          }}
        >
          You can change everything later. No pressure.
        </p>
      </div>
    </div>
  );
}
