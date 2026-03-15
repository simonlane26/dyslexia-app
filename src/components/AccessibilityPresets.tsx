// src/components/AccessibilityPresets.tsx
'use client';

import { useState } from 'react';
import { Palette, Eye, Moon, Zap, X } from 'lucide-react';
import { ModernButton } from './ModernButton';
import { useT } from '@/lib/i18n';

interface PresetSettings {
  bgColor: string;
  font: string;
  fontSize: number;
  highContrast: boolean;
  darkMode: boolean;
}

const PRESET_DEFS = [
  { id: 'default',             icon: <Palette size={20} />, nameKey: 'presets.default.name'      as const, descKey: 'presets.default.desc'      as const, settings: { bgColor: '#f9f7ed',  font: 'Lexend',        fontSize: 18, highContrast: false, darkMode: false } },
  { id: 'high-contrast',       icon: <Eye     size={20} />, nameKey: 'presets.highContrast.name' as const, descKey: 'presets.highContrast.desc' as const, settings: { bgColor: '#ffffff',  font: 'Lexend',        fontSize: 20, highContrast: true,  darkMode: false } },
  { id: 'dark-reader',         icon: <Moon    size={20} />, nameKey: 'presets.darkMode.name'     as const, descKey: 'presets.darkMode.desc'     as const, settings: { bgColor: '#0f1629',  font: 'Lexend',        fontSize: 18, highContrast: false, darkMode: true  } },
  { id: 'dyslexia-optimized',  icon: <Zap     size={20} />, nameKey: 'presets.dyslexia.name'     as const, descKey: 'presets.dyslexia.desc'     as const, settings: { bgColor: '#f9f7ed',  font: 'Open Dyslexic', fontSize: 20, highContrast: false, darkMode: false } },
  { id: 'minimal-distraction', icon: <Palette size={20} />, nameKey: 'presets.minimal.name'      as const, descKey: 'presets.minimal.desc'      as const, settings: { bgColor: '#ffffff',  font: 'Arial',         fontSize: 18, highContrast: false, darkMode: false } },
  { id: 'large-print',         icon: <Eye     size={20} />, nameKey: 'presets.largePrint.name'   as const, descKey: 'presets.largePrint.desc'   as const, settings: { bgColor: '#ffffff',  font: 'Verdana',       fontSize: 24, highContrast: false, darkMode: false } },
] as const;

interface AccessibilityPresetsProps {
  onApplyPreset: (settings: PresetSettings) => void;
  theme: any;
}

export function AccessibilityPresets({ onApplyPreset, theme }: AccessibilityPresetsProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <ModernButton variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
        <Zap size={16} />
        {t('presets.button')}
      </ModernButton>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
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
              {t('presets.title')}
            </h2>
            <p style={{ fontSize: '14px', color: theme.text, opacity: 0.7, margin: '4px 0 0 0' }}>
              {t('presets.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            title="Close"
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: theme.text, opacity: 0.7 }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Presets Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {PRESET_DEFS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => { onApplyPreset(preset.settings); setIsOpen(false); }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
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
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text, margin: 0 }}>
                    {t(preset.nameKey)}
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: theme.text, opacity: 0.7, margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  {t(preset.descKey)}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', color: theme.text, opacity: 0.5 }}>
                  <span>{preset.settings.font}</span>
                  <span>•</span>
                  <span>{preset.settings.fontSize}px</span>
                  {preset.settings.highContrast && (
                    <><span>•</span><span>{t('presets.tag.highContrast')}</span></>
                  )}
                  {preset.settings.darkMode && (
                    <><span>•</span><span>{t('presets.tag.dark')}</span></>
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
