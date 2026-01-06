'use client';

import { X } from 'lucide-react';
import { ModernButton } from './ModernButton';
import { AccessibilityPresets } from './AccessibilityPresets';
import { WritingTemplates } from './WritingTemplates';
import { FocusMode } from './FocusMode';
import { useEffect } from 'react';

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

interface AccessibilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  bgColor: string;
  setBgColor: (color: string) => void;
  font: string;
  setFont: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  voiceId: string;
  setVoiceId: (id: string) => void;
  resetSettings: () => void;
  theme: Theme;
  getFontFamily: () => string;
  text: string;
  onTextChange: (text: string) => void;
  onApplyPreset: (preset: any) => void;
  onSelectTemplate: (template: string) => void;
  editorTextColor: string;
}

const FREE_COLOR_HEXES = new Set<string>([
  "#f9f7ed", // Cream
  "#f0f0f0", // Light Gray
  "#fff0f5", // Pink
  "#ffffff", // White
]);

const COLOR_SWATCHES = [
  { name: 'Cream', value: '#f9f7ed' },
  { name: 'Light Gray', value: '#f0f0f0' },
  { name: 'Soft Yellow', value: '#fff9db' },
  { name: 'Pale Blue', value: '#eef4ff' },
  { name: 'Pink', value: '#fff0f5' },
  { name: 'White', value: '#ffffff' },
  { name: 'Mint', value: '#ECFDF5' },
  { name: 'Aqua', value: '#ECFEFF' },
  { name: 'Sage', value: '#F1F8F5' },
  { name: 'Lavender', value: '#F5F3FF' },
  { name: 'Lilac', value: '#EEF2FF' },
  { name: 'Peach', value: '#FFF4E6' },
  { name: 'Buff', value: '#F3E7C9' },
  { name: 'Sepia Light', value: '#F5E6C8' },
  { name: 'Off-White Warm', value: '#FAFAF7' },
  { name: 'Pale Teal', value: '#E6FAF5' },
] as const;

export function AccessibilityDrawer({
  isOpen,
  onClose,
  isPro,
  bgColor,
  setBgColor,
  font,
  setFont,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  darkMode,
  setDarkMode,
  voiceId,
  setVoiceId,
  resetSettings,
  theme,
  getFontFamily,
  text,
  onTextChange,
  onApplyPreset,
  onSelectTemplate,
  editorTextColor,
}: AccessibilityDrawerProps) {
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
          width: '500px',
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
            ⚙️ Accessibility Settings
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
          {/* Quick Actions */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: theme.text }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <AccessibilityPresets onApplyPreset={onApplyPreset} theme={theme} />
              <WritingTemplates onSelectTemplate={onSelectTemplate} theme={theme} />
              <FocusMode
                text={text}
                onTextChange={onTextChange}
                theme={theme}
                fontSize={fontSize}
                fontFamily={getFontFamily()}
                bgColor={bgColor}
                darkMode={darkMode}
                editorTextColor={editorTextColor}
              />
            </div>
          </div>

          {/* Font Settings */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: theme.text }}>
              Font
            </h3>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                color: theme.text,
                fontSize: '14px',
                marginBottom: '12px',
              }}
            >
              <option value="Open Dyslexic">Open Dyslexic</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
            </select>

            <label style={{ display: 'block', fontSize: '13px', color: theme.text, marginBottom: '8px' }}>
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Background Color */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: theme.text }}>
              Background Color
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: '8px',
              }}
            >
              {COLOR_SWATCHES.map((swatch) => {
                const isFree = FREE_COLOR_HEXES.has(swatch.value);
                const isLocked = !isPro && !isFree;
                return (
                  <button
                    key={swatch.value}
                    onClick={() => {
                      if (!isLocked) {
                        setBgColor(swatch.value);
                      }
                    }}
                    disabled={isLocked}
                    title={isLocked ? `${swatch.name} (Pro)` : swatch.name}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      backgroundColor: swatch.value,
                      border: bgColor === swatch.value ? `3px solid ${theme.primary}` : `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    {isLocked && <span style={{ fontSize: '16px' }}>🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Mode */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: theme.text }}>
              Display Mode
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <ModernButton
                variant={darkMode ? 'secondary' : 'primary'}
                onClick={() => setDarkMode(false)}
                size="sm"
              >
                ☀️ Light
              </ModernButton>
              <ModernButton
                variant={darkMode ? 'primary' : 'secondary'}
                onClick={() => setDarkMode(true)}
                size="sm"
              >
                🌙 Dark
              </ModernButton>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              <span style={{ fontSize: '14px', color: theme.text }}>High Contrast Mode</span>
            </label>
          </div>

          {/* Voice Settings */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: theme.text }}>
              Text-to-Speech Voice
            </h3>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                color: theme.text,
                fontSize: '14px',
              }}
            >
              <option value="en-GB-Standard-A">British Female</option>
              <option value="en-GB-Standard-B">British Male</option>
              <option value="en-US-Standard-C">American Female</option>
              <option value="en-US-Standard-D">American Male</option>
              <option value="en-AU-Standard-A">Australian Female</option>
              <option value="en-AU-Standard-B">Australian Male</option>
            </select>
          </div>

          {/* Reset Button */}
          <ModernButton variant="danger" onClick={resetSettings} size="sm">
            Reset All Settings
          </ModernButton>
        </div>
      </div>
    </>
  );
}
