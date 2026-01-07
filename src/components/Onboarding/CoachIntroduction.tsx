'use client';

import { ModernButton } from '../ModernButton';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface CoachIntroductionProps {
  onComplete: () => void;
  theme: any;
  darkMode: boolean;
}

export function CoachIntroduction({
  onComplete,
  theme,
  darkMode,
}: CoachIntroductionProps) {
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
        {/* Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MessageSquare size={40} style={{ color: '#8b5cf6' }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '28px',
            fontWeight: '800',
            color: theme.text,
            marginBottom: '20px',
          }}
        >
          Meet your Writing Coach
        </h2>

        {/* Message */}
        <div
          style={{
            backgroundColor: theme.surface,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            border: `1px solid ${theme.border}`,
          }}
        >
          <p
            style={{
              fontSize: '18px',
              color: theme.text,
              lineHeight: '1.8',
              marginBottom: '16px',
            }}
          >
            "If you ever want help improving your writing, click{' '}
            <span style={{ fontWeight: '700', color: '#8b5cf6' }}>Coach</span> — I'll be here when you need me 😊"
          </p>
          <p
            style={{
              fontSize: '15px',
              color: theme.text,
              opacity: 0.7,
              lineHeight: '1.6',
            }}
          >
            No tutorial. No stress. Just gentle guidance whenever you're ready.
          </p>
        </div>

        {/* Continue button */}
        <ModernButton
          variant="primary"
          onClick={onComplete}
          style={{ padding: '16px 48px', fontSize: '18px' }}
        >
          Got it, thanks! <ArrowRight size={20} style={{ marginLeft: '8px' }} />
        </ModernButton>

        {/* Final reassurance */}
        <p
          style={{
            fontSize: '14px',
            color: theme.text,
            opacity: 0.6,
            marginTop: '20px',
            fontStyle: 'italic',
          }}
        >
          You're all set. Let's start writing! ✨
        </p>
      </div>
    </div>
  );
}
