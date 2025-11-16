// src/components/KeyboardShortcutsHelp.tsx
'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { ModernButton } from './ModernButton';
import { formatShortcut, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  theme: any;
}

export function KeyboardShortcutsHelp({ shortcuts, theme }: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          padding: '12px',
          borderRadius: '50%',
          border: `1px solid ${theme.border}`,
          backgroundColor: theme.surface,
          color: theme.text,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s',
          zIndex: 100,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Keyboard Shortcuts (press ?)"
      >
        <Keyboard size={20} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          backgroundColor: theme.bg,
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: theme.bg,
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Keyboard size={24} style={{ color: theme.primary }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: 0 }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: theme.text,
              opacity: 0.7,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <span style={{ color: theme.text, fontSize: '14px' }}>
                  {shortcut.description}
                </span>
                <kbd
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: theme.bg,
                    border: `1px solid ${theme.border}`,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: theme.primary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: `${theme.primary}15`,
              border: `1px solid ${theme.primary}30`,
            }}
          >
            <p style={{ fontSize: '14px', color: theme.text, margin: 0, opacity: 0.8 }}>
              <strong>Pro Tip:</strong> Press <kbd style={{
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: theme.bg,
                fontFamily: 'monospace',
                fontSize: '12px',
              }}>?</kbd> anytime to view this help panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
