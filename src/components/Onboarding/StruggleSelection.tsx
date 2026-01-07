'use client';

import { useState } from 'react';
import { ModernButton } from '../ModernButton';
import { BookOpen, SpellCheck, Focus, Brain, Heart, ArrowRight } from 'lucide-react';

interface Struggle {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface StruggleSelectionProps {
  onComplete: (selected: string[]) => void;
  onSkip: () => void;
  theme: any;
  darkMode: boolean;
}

export function StruggleSelection({
  onComplete,
  onSkip,
  theme,
  darkMode,
}: StruggleSelectionProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const struggles: Struggle[] = [
    {
      id: 'reading',
      label: 'Reading long blocks of text',
      icon: <BookOpen size={24} />,
      color: '#10b981',
    },
    {
      id: 'spelling',
      label: 'Spelling + grammar',
      icon: <SpellCheck size={24} />,
      color: '#ef4444',
    },
    {
      id: 'focus',
      label: 'Staying focused',
      icon: <Focus size={24} />,
      color: '#f59e0b',
    },
    {
      id: 'expression',
      label: 'Getting words out of my head',
      icon: <Brain size={24} />,
      color: '#3b82f6',
    },
    {
      id: 'confidence',
      label: 'Confidence',
      icon: <Heart size={24} />,
      color: '#ec4899',
    },
  ];

  const toggleStruggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

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
          What do you struggle with?
        </h2>

        <p
          style={{
            fontSize: '16px',
            color: theme.text,
            opacity: 0.7,
            marginBottom: '32px',
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          Select all that apply. This helps us tailor the experience for you.
        </p>

        {/* Struggle checkboxes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {struggles.map((struggle) => {
            const isSelected = selected.includes(struggle.id);
            return (
              <button
                key={struggle.id}
                onClick={() => toggleStruggle(struggle.id)}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: `2px solid ${
                    isSelected ? struggle.color : theme.border
                  }`,
                  backgroundColor: isSelected
                    ? `${struggle.color}15`
                    : theme.surface,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'left',
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: `2px solid ${
                      isSelected ? struggle.color : theme.border
                    }`,
                    backgroundColor: isSelected ? struggle.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <span style={{ color: '#ffffff', fontSize: '16px' }}>✓</span>
                  )}
                </div>

                {/* Icon */}
                <div
                  style={{
                    color: isSelected ? struggle.color : theme.text,
                    opacity: isSelected ? 1 : 0.6,
                    flexShrink: 0,
                  }}
                >
                  {struggle.icon}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: isSelected ? '600' : '500',
                    color: theme.text,
                    opacity: isSelected ? 1 : 0.8,
                  }}
                >
                  {struggle.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <ModernButton
            variant="secondary"
            onClick={onSkip}
            style={{ padding: '12px 24px' }}
          >
            Skip for now
          </ModernButton>

          <ModernButton
            variant="primary"
            onClick={() => onComplete(selected)}
            disabled={selected.length === 0}
            style={{ padding: '12px 32px' }}
          >
            Continue <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </ModernButton>
        </div>

        {/* Reassurance */}
        <p
          style={{
            fontSize: '13px',
            color: theme.text,
            opacity: 0.6,
            marginTop: '20px',
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          Your answers are private and only used to personalize your experience.
        </p>
      </div>
    </div>
  );
}
