'use client';

import { X } from 'lucide-react';
import { ModernButton } from './ModernButton';
import CoachPanel from './CoachPanel';
import { useEffect } from 'react';
import type { CopyMap } from '@/lib/schoolCopy';

interface Theme {
  bg: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}

interface CoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  isPro: boolean;
  theme: Theme;
  darkMode: boolean;
  onApplySuggestion: (before: string, after: string) => void;
  copy: CopyMap;
  isSchoolMode: boolean;
}

export function CoachDrawer({
  isOpen,
  onClose,
  sourceText,
  isPro,
  theme,
  darkMode,
  onApplySuggestion,
  copy,
  isSchoolMode,
}: CoachDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const coachBg = darkMode ? '#1e293b' : '#f8fafc';
  const coachText = darkMode ? '#f1f5f9' : '#1e293b';
  const coachBorder = darkMode ? '#334155' : '#e2e8f0';

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            transition: 'opacity 0.3s ease',
          }}
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '600px',
          maxWidth: '90vw',
          backgroundColor: theme.bg,
          borderLeft: `1px solid ${theme.border}`,
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '-4px 0 24px rgba(0, 0, 0, 0.15)' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.surface,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: theme.text,
            }}
          >
            ✨ {copy.aiCoachLabel}
          </h2>
          <ModernButton
            variant="secondary"
            onClick={onClose}
            title="Close panel (Esc)"
            size="sm"
          >
            <X size={18} />
          </ModernButton>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}
        >
          {isPro ? (
            <CoachPanel
              sourceText={sourceText}
              isPro={isPro}
              coachBg={coachBg}
              coachText={coachText}
              coachBorder={coachBorder}
              theme={theme}
              darkMode={darkMode}
              onApplySuggestion={onApplySuggestion}
              isSchoolMode={isSchoolMode}
              copy={copy}
            />
          ) : (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: theme.text,
              }}
            >
              <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                {copy.aiCoachLabel} is a Pro feature
              </p>
              <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px' }}>
                Upgrade to unlock personalised writing tips, structure analysis, and guidance.
              </p>
              <ModernButton variant="primary" onClick={() => window.location.href = '/pricing'}>
                Upgrade to Pro
              </ModernButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
