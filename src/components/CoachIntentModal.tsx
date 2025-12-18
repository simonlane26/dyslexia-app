'use client';

import React, { useState } from 'react';
import { X, Users, Target, MessageSquare } from 'lucide-react';
import { ModernButton } from './ModernButton';

export interface CoachIntent {
  audience: 'friend' | 'teacher' | 'boss' | 'general';
  purpose: 'inform' | 'persuade' | 'explain' | 'story';
  tone: 'casual' | 'neutral' | 'formal';
}

interface CoachIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (intent: CoachIntent) => void;
  theme: any;
  darkMode: boolean;
}

export function CoachIntentModal({
  isOpen,
  onClose,
  onSubmit,
  theme,
  darkMode,
}: CoachIntentModalProps) {
  const [audience, setAudience] = useState<CoachIntent['audience']>('general');
  const [purpose, setPurpose] = useState<CoachIntent['purpose']>('inform');
  const [tone, setTone] = useState<CoachIntent['tone']>('neutral');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ audience, purpose, tone });
  };

  const audiences = [
    { value: 'friend' as const, label: 'A friend', icon: '👋', desc: 'Casual, relaxed writing' },
    { value: 'teacher' as const, label: 'My teacher', icon: '📚', desc: 'Clear and organized' },
    { value: 'boss' as const, label: 'My boss', icon: '💼', desc: 'Professional and direct' },
    { value: 'general' as const, label: 'Anyone', icon: '🌍', desc: 'Easy for everyone to read' },
  ];

  const purposes = [
    { value: 'inform' as const, label: 'Explain something', icon: '💡', desc: 'Help them understand' },
    { value: 'persuade' as const, label: 'Change their mind', icon: '🎯', desc: 'Convince them to agree' },
    { value: 'explain' as const, label: 'Give instructions', icon: '📝', desc: 'Show them how to do it' },
    { value: 'story' as const, label: 'Tell a story', icon: '📖', desc: 'Entertain or share' },
  ];

  const tones = [
    { value: 'casual' as const, label: 'Casual', desc: 'Like texting a friend' },
    { value: 'neutral' as const, label: 'Neutral', desc: 'Not too formal, not too casual' },
    { value: 'formal' as const, label: 'Formal', desc: 'Like a business email' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '4px',
              }}
            >
              Before we start...
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              Help me understand what you're trying to write
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: theme.text,
              opacity: 0.6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Question 1: Who is this for? */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <Users size={20} style={{ color: theme.primary }} />
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                }}
              >
                Who is this for?
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {audiences.map((aud) => (
                <button
                  key={aud.value}
                  onClick={() => setAudience(aud.value)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${
                      audience === aud.value ? theme.primary : theme.border
                    }`,
                    backgroundColor:
                      audience === aud.value
                        ? darkMode
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'rgba(59, 130, 246, 0.05)'
                        : darkMode
                        ? '#374151'
                        : '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {aud.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.text,
                      marginBottom: '4px',
                    }}
                  >
                    {aud.label}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {aud.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: What should they do? */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <Target size={20} style={{ color: theme.primary }} />
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                }}
              >
                What should they do after reading?
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {purposes.map((purp) => (
                <button
                  key={purp.value}
                  onClick={() => setPurpose(purp.value)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${
                      purpose === purp.value ? theme.primary : theme.border
                    }`,
                    backgroundColor:
                      purpose === purp.value
                        ? darkMode
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'rgba(59, 130, 246, 0.05)'
                        : darkMode
                        ? '#374151'
                        : '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {purp.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.text,
                      marginBottom: '4px',
                    }}
                  >
                    {purp.label}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {purp.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: How formal? */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <MessageSquare size={20} style={{ color: theme.primary }} />
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                }}
              >
                How formal should it be?
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${
                      tone === t.value ? theme.primary : theme.border
                    }`,
                    backgroundColor:
                      tone === t.value
                        ? darkMode
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'rgba(59, 130, 246, 0.05)'
                        : darkMode
                        ? '#374151'
                        : '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.text,
                      marginBottom: '4px',
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '24px',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <ModernButton onClick={onClose} variant="secondary">
            Cancel
          </ModernButton>
          <ModernButton onClick={handleSubmit} variant="primary">
            Get Writing Tips
          </ModernButton>
        </div>
      </div>
    </div>
  );
}
