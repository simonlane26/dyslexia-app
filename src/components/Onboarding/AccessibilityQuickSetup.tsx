'use client';

import { useState } from 'react';
import { ModernButton } from '../ModernButton';
import { ArrowRight } from 'lucide-react';

interface AccessibilityQuickSetupProps {
  onComplete: (settings: {
    font: string;
    bgColor: string;
    fontSize: number;
  }) => void;
  theme: any;
  darkMode: boolean;
}

const FONTS = [
  { label: 'Open Dyslexic', value: 'Open Dyslexic' },
  { label: 'Comic Sans', value: 'Comic Sans MS' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Verdana', value: 'Verdana' },
];

const COLORS = [
  { label: 'Cream', value: '#f9f7ed' },
  { label: 'Light Gray', value: '#f0f0f0' },
  { label: 'Soft Yellow', value: '#fff9db' },
  { label: 'Pale Blue', value: '#eef4ff' },
  { label: 'Pink', value: '#fff0f5' },
  { label: 'White', value: '#ffffff' },
];

const SIZES = [
  { label: 'Small', value: 16 },
  { label: 'Medium', value: 18 },
  { label: 'Large', value: 22 },
  { label: 'Extra Large', value: 26 },
];

export function AccessibilityQuickSetup({
  onComplete,
  theme,
  darkMode,
}: AccessibilityQuickSetupProps) {
  const [font, setFont] = useState('Open Dyslexic');
  const [bgColor, setBgColor] = useState('#f9f7ed');
  const [fontSize, setFontSize] = useState(18);

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
          maxWidth: '700px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: `2px solid ${theme.border}`,
        }}
      >
        {/* Header */}
        <h2
          style={{
            fontSize: '32px',
            fontWeight: '800',
            color: theme.text,
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Set up your comfort zone
        </h2>

        <p
          style={{
            fontSize: '16px',
            color: theme.text,
            opacity: 0.7,
            marginBottom: '40px',
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          Choose what feels easiest on your eyes. You can change these anytime.
        </p>

        {/* Font selection */}
        <div style={{ marginBottom: '32px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px',
            }}
          >
            Choose a font
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFont(f.value)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${
                    font === f.value ? '#667eea' : theme.border
                  }`,
                  backgroundColor: font === f.value ? 'rgba(102, 126, 234, 0.1)' : theme.surface,
                  cursor: 'pointer',
                  fontFamily: f.value,
                  fontSize: '16px',
                  fontWeight: font === f.value ? '600' : '500',
                  color: theme.text,
                  transition: 'all 0.2s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background color */}
        <div style={{ marginBottom: '32px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px',
            }}
          >
            Choose a background color
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '12px' }}>
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setBgColor(c.value)}
                title={c.label}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: c.value,
                  border: `3px solid ${
                    bgColor === c.value ? '#667eea' : theme.border
                  }`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {bgColor === c.value && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '24px',
                    }}
                  >
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div style={{ marginBottom: '40px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px',
            }}
          >
            Choose text size
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setFontSize(s.value)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${
                    fontSize === s.value ? '#667eea' : theme.border
                  }`,
                  backgroundColor: fontSize === s.value ? 'rgba(102, 126, 234, 0.1)' : theme.surface,
                  cursor: 'pointer',
                  fontSize: `${s.value}px`,
                  fontWeight: fontSize === s.value ? '600' : '500',
                  color: theme.text,
                  transition: 'all 0.2s ease',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <div style={{ textAlign: 'center' }}>
          <ModernButton
            variant="primary"
            onClick={() => onComplete({ font, bgColor, fontSize })}
            style={{ padding: '16px 48px', fontSize: '18px' }}
          >
            Continue <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </ModernButton>
        </div>

        {/* Reassurance */}
        <p
          style={{
            fontSize: '15px',
            color: theme.text,
            opacity: 0.7,
            marginTop: '24px',
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          You can change these anytime. Your comfort matters. 💙
        </p>
      </div>
    </div>
  );
}
