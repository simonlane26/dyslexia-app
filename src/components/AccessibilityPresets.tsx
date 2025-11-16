// src/components/AccessibilityPresets.tsx
'use client';

import { useState } from 'react';
import { Palette, Eye, Moon, Zap, X } from 'lucide-react';
import { ModernButton } from './ModernButton';

interface AccessibilityPreset {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  settings: {
    bgColor: string;
    font: string;
    fontSize: number;
    highContrast: boolean;
    darkMode: boolean;
  };
}

const PRESETS: AccessibilityPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Balanced settings for most users',
    icon: <Palette size={20} />,
    settings: {
      bgColor: '#f9f7ed',
      font: 'Lexend',
      fontSize: 18,
      highContrast: false,
      darkMode: false,
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum contrast for visibility',
    icon: <Eye size={20} />,
    settings: {
      bgColor: '#ffffff',
      font: 'Lexend',
      fontSize: 20,
      highContrast: true,
      darkMode: false,
    },
  },
  {
    id: 'dark-reader',
    name: 'Dark Mode',
    description: 'Easy on the eyes in low light',
    icon: <Moon size={20} />,
    settings: {
      bgColor: '#0f1629',
      font: 'Lexend',
      fontSize: 18,
      highContrast: false,
      darkMode: true,
    },
  },
  {
    id: 'dyslexia-optimized',
    name: 'Dyslexia Optimized',
    description: 'OpenDyslexic font with cream background',
    icon: <Zap size={20} />,
    settings: {
      bgColor: '#f9f7ed',
      font: 'Open Dyslexic',
      fontSize: 20,
      highContrast: false,
      darkMode: false,
    },
  },
  {
    id: 'minimal-distraction',
    name: 'Minimal Distraction',
    description: 'Clean and simple for focus',
    icon: <Palette size={20} />,
    settings: {
      bgColor: '#ffffff',
      font: 'Arial',
      fontSize: 18,
      highContrast: false,
      darkMode: false,
    },
  },
  {
    id: 'large-print',
    name: 'Large Print',
    description: 'Bigger text for easier reading',
    icon: <Eye size={20} />,
    settings: {
      bgColor: '#ffffff',
      font: 'Verdana',
      fontSize: 24,
      highContrast: false,
      darkMode: false,
    },
  },
];

interface AccessibilityPresetsProps {
  onApplyPreset: (settings: AccessibilityPreset['settings']) => void;
  theme: any;
}

export function AccessibilityPresets({ onApplyPreset, theme }: AccessibilityPresetsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyPreset = (preset: AccessibilityPreset) => {
    onApplyPreset(preset.settings);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <ModernButton
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Zap size={16} />
        Quick Presets
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
          maxWidth: '800px',
          width: '100%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: 0 }}>
              Accessibility Presets
            </h2>
            <p style={{ fontSize: '14px', color: theme.text, opacity: 0.7, margin: '4px 0 0 0' }}>
              Apply pre-configured settings with one click
            </p>
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

        {/* Presets Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${theme.border}`,
                  backgroundColor: theme.surface,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: `${theme.primary}15`,
                      color: theme.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {preset.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: theme.text,
                      margin: 0,
                    }}
                  >
                    {preset.name}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    color: theme.text,
                    opacity: 0.7,
                    margin: '0 0 12px 0',
                    lineHeight: 1.5,
                  }}
                >
                  {preset.description}
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    fontSize: '11px',
                    color: theme.text,
                    opacity: 0.5,
                  }}
                >
                  <span>{preset.settings.font}</span>
                  <span>•</span>
                  <span>{preset.settings.fontSize}px</span>
                  {preset.settings.highContrast && (
                    <>
                      <span>•</span>
                      <span>High Contrast</span>
                    </>
                  )}
                  {preset.settings.darkMode && (
                    <>
                      <span>•</span>
                      <span>Dark</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
