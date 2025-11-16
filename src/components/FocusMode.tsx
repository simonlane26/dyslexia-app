// src/components/FocusMode.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { ModernButton } from './ModernButton';

interface FocusModeProps {
  text: string;
  onTextChange: (text: string) => void;
  theme: any;
  fontSize: number;
  fontFamily: string;
  bgColor: string;
  darkMode: boolean;
  editorTextColor: string;
}

export function FocusMode({
  text,
  onTextChange,
  theme,
  fontSize,
  fontFamily,
  bgColor,
  darkMode,
  editorTextColor,
}: FocusModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localText, setLocalText] = useState(text);

  // Sync with parent text
  useEffect(() => {
    setLocalText(text);
  }, [text]);

  const handleClose = () => {
    onTextChange(localText);
    setIsOpen(false);
  };

  // Expose open function globally
  useEffect(() => {
    (window as any).__openFocusMode = () => {
      setIsOpen(true);
    };
    return () => {
      delete (window as any).__openFocusMode;
    };
  }, []);

  // Handle Escape key to exit
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, localText]);

  if (!isOpen) {
    return (
      <ModernButton
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Maximize2 size={16} />
        Focus Mode
      </ModernButton>
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
        backgroundColor: darkMode ? '#0f1629' : bgColor,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
      }}
    >
      {/* Header with close button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: editorTextColor,
            margin: 0,
          }}
        >
          Focus Mode
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '14px',
              color: editorTextColor,
              opacity: 0.6,
            }}
          >
            Press ESC to exit
          </span>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: `2px solid ${theme.border}`,
              cursor: 'pointer',
              padding: '8px 16px',
              color: editorTextColor,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.primary;
              e.currentTarget.style.backgroundColor = `${theme.primary}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={16} />
            Exit Focus Mode
          </button>
        </div>
      </div>

      {/* Full-screen textarea */}
      <textarea
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder="Start writing... (Press ESC to exit Focus Mode)"
        autoFocus
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '32px',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: fontFamily,
          fontSize: `${fontSize + 2}px`,
          color: editorTextColor,
          lineHeight: 1.8,
          resize: 'none',
        }}
      />

      {/* Word count footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '16px',
          color: editorTextColor,
          opacity: 0.5,
          fontSize: '14px',
        }}
      >
        {localText.trim().split(/\s+/).filter((w) => w.length > 0).length} words •{' '}
        {localText.length} characters
      </div>
    </div>
  );
}
