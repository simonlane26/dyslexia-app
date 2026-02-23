'use client';

import {
  Mic,
  MicOff,
  BookOpen,
  Sparkles,
  Download,
  Save,
  Highlighter,
  SpellCheck,
  Eye,
  FileText,
  Lock,
  ChevronDown,
  Type,
  Clock,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { ModernButton } from './ModernButton';
import { ExportPDFButton } from './ExportPDFButton';
import { ExportMP3Button } from './ExportMP3Button';
import { ExportDOCXButton } from './ExportDOCXButton';
import { useState, useEffect } from 'react';
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

interface FixedToolbarProps {
  // Left side - Writing tools
  isListening: boolean;
  onDictateToggle: () => void;
  onReadAloud: () => void;
  onSimplify: () => void;
  loading: boolean;
  onRewrite: () => void;
  readingGuideEnabled: boolean;
  onReadingGuideToggle: () => void;
  highlightMode: boolean;
  onHighlightToggle: () => void;
  grammarCheckEnabled: boolean;
  onGrammarCheckToggle: () => void;
  isPro: boolean;
  onUpgradeClick: () => void;
  coachPanelOpen: boolean;
  onCoachPanelToggle: () => void;
  accessibilityPanelOpen: boolean;
  onAccessibilityPanelToggle: () => void;

  // Right side - Document actions
  isSaving: boolean;
  onSave: () => void;
  lastSaved: number | null;
  text: string;
  documentTitle: string;
  onCompare: () => void;
  simplifiedText: string;

  // Theme
  theme: Theme;
  darkMode: boolean;

  // School Mode
  copy: CopyMap;
  isSchoolMode: boolean;
}

export function FixedToolbar({
  isListening,
  onDictateToggle,
  onReadAloud,
  onSimplify,
  loading,
  onRewrite,
  readingGuideEnabled,
  onReadingGuideToggle,
  highlightMode,
  onHighlightToggle,
  grammarCheckEnabled,
  onGrammarCheckToggle,
  isPro,
  onUpgradeClick,
  coachPanelOpen,
  onCoachPanelToggle,
  accessibilityPanelOpen,
  onAccessibilityPanelToggle,
  isSaving,
  onSave,
  lastSaved,
  text,
  documentTitle,
  onCompare,
  simplifiedText,
  theme,
  darkMode,
  copy,
  isSchoolMode,
}: FixedToolbarProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // One-time feature tips (shown once via localStorage)
  const [showSimplifyTip, setShowSimplifyTip] = useState(false);
  const [showA11yTip, setShowA11yTip] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('dw-tip-simplify')) setShowSimplifyTip(true);
    if (!localStorage.getItem('dw-tip-a11y')) setShowA11yTip(true);
  }, []);

  function dismissSimplifyTip() {
    setShowSimplifyTip(false);
    localStorage.setItem('dw-tip-simplify', '1');
  }

  function dismissA11yTip() {
    setShowA11yTip(false);
    localStorage.setItem('dw-tip-a11y', '1');
  }

  // Contextual Pro upgrade popover
  const [proPopover, setProPopover] = useState<null | 'rewrite' | 'coach'>(null);

  // Calculate stats for compact display
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const readingTimeMinutes = Math.ceil(wordCount / 200);
  const readingTime = readingTimeMinutes === 0 ? '< 1m' : readingTimeMinutes === 1 ? '1m' : `${readingTimeMinutes}m`;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
      }}
    >
      {/* Left side - All Tools */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* GROUP 1 - Writing Actions (Big, Primary) */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: '10px',
            border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
          }}
        >
          <ModernButton
            variant={isListening ? 'primary' : 'secondary'}
            onClick={onDictateToggle}
            title="Toggle dictation (Ctrl+D)"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            Dictate
          </ModernButton>

          <div style={{ position: 'relative' }}>
            <ModernButton variant="secondary" onClick={() => { onSimplify(); dismissSimplifyTip(); }} disabled={loading || !text.trim()} title="Simplify text">
              <Sparkles size={18} />
              {copy.simplifyLabel}
            </ModernButton>
            {showSimplifyTip && (
              <FeatureTip
                message="Paste or type anything, then hit this to make it simpler and easier to read."
                onDismiss={dismissSimplifyTip}
              />
            )}
          </div>

          <ModernButton variant="secondary" onClick={onReadAloud} title="Read text aloud">
            <BookOpen size={18} />
            Read Aloud
          </ModernButton>
        </div>

        {/* Divider */}
        <div style={{ width: '2px', height: '32px', backgroundColor: theme.border, opacity: 0.5 }} />

        {/* GROUP 2 - Support Tools (Small toggles) */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            padding: '6px 10px',
            backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)',
            borderRadius: '10px',
            border: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
          }}
        >
          <ModernButton
            variant={grammarCheckEnabled ? 'primary' : 'secondary'}
            onClick={onGrammarCheckToggle}
            title="Toggle grammar check"
            size="sm"
          >
            <SpellCheck size={14} />
            {copy.grammarLabel}
          </ModernButton>

          <ModernButton
            variant={highlightMode ? 'primary' : 'secondary'}
            onClick={onHighlightToggle}
            title="Toggle sentence highlighting"
            size="sm"
          >
            <Highlighter size={14} />
            Highlight
          </ModernButton>

          <ModernButton
            variant={readingGuideEnabled ? 'primary' : 'secondary'}
            onClick={onReadingGuideToggle}
            title="Toggle reading guide"
            size="sm"
          >
            <Eye size={14} />
            Guide
          </ModernButton>

          {isPro ? (
            <ModernButton
              variant="secondary"
              onClick={onRewrite}
              disabled={!text.trim()}
              title="Rewrite selected sentence with multiple tones"
              size="sm"
            >
              <FileText size={14} />
              Rewrite
            </ModernButton>
          ) : (
            <div style={{ position: 'relative' }}>
              <ModernButton
                variant="secondary"
                onClick={() => setProPopover(proPopover === 'rewrite' ? null : 'rewrite')}
                title="Rewrite — Pro feature"
                size="sm"
                disabled={!text.trim()}
              >
                <span style={{ fontSize: '12px', marginRight: '2px' }}>⭐</span>
                Rewrite
              </ModernButton>
              {proPopover === 'rewrite' && (
                <ProUpgradePopover
                  message="Rewrite lets you find new ways to say what you mean — try different tones until it feels right."
                  onUpgrade={() => { setProPopover(null); onUpgradeClick(); }}
                  onDismiss={() => setProPopover(null)}
                  darkMode={darkMode}
                />
              )}
            </div>
          )}

          {isPro ? (
            <ModernButton
              variant={coachPanelOpen ? 'primary' : 'secondary'}
              onClick={onCoachPanelToggle}
              title={`Toggle ${copy.aiCoachLabel} panel`}
              size="sm"
            >
              <MessageSquare size={14} />
              {copy.aiCoachButton}
            </ModernButton>
          ) : (
            <div style={{ position: 'relative' }}>
              <ModernButton
                variant="secondary"
                onClick={() => setProPopover(proPopover === 'coach' ? null : 'coach')}
                title={`${copy.aiCoachLabel} — Pro feature`}
                size="sm"
              >
                <span style={{ fontSize: '12px', marginRight: '2px' }}>⭐</span>
                {copy.aiCoachButton}
              </ModernButton>
              {proPopover === 'coach' && (
                <ProUpgradePopover
                  message="Pro helps you write with confidence and structure — gentle tips, no jargon, no red marks."
                  onUpgrade={() => { setProPopover(null); onUpgradeClick(); }}
                  onDismiss={() => setProPopover(null)}
                  darkMode={darkMode}
                />
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '2px', height: '32px', backgroundColor: theme.border, opacity: 0.5 }} />

        {/* GROUP 3 - Document Management */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            padding: '6px 10px',
            backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
            borderRadius: '10px',
            border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
          }}
        >
          <ModernButton
            variant="success"
            onClick={onSave}
            disabled={isSaving}
            title="Save document (Ctrl+S)"
            size="sm"
          >
            <Save size={14} />
            {isSaving ? 'Saving...' : 'Save'}
          </ModernButton>

          <div style={{ position: 'relative' }}>
            <ModernButton
              variant="secondary"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              title="Export document"
              size="sm"
            >
              <Download size={14} />
              Export
              <ChevronDown size={12} />
            </ModernButton>

            {exportMenuOpen && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 30,
                  }}
                  onClick={() => setExportMenuOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '8px',
                    minWidth: '160px',
                    zIndex: 31,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <ExportPDFButton text={text} documentTitle={documentTitle} />
                  <ExportMP3Button text={text} documentTitle={documentTitle} />
                  <ExportDOCXButton text={text} documentTitle={documentTitle} />
                </div>
              </>
            )}
          </div>

          {isPro ? (
            <ModernButton
              variant="secondary"
              onClick={onCompare}
              disabled={!simplifiedText}
              title="Compare original and simplified drafts"
              size="sm"
            >
              <FileText size={14} />
              Compare
            </ModernButton>
          ) : (
            <ModernButton
              variant="secondary"
              onClick={onUpgradeClick}
              title="⭐ Pro Feature - Compare different versions of your writing"
              size="sm"
            >
              <span style={{ fontSize: '12px', marginRight: '2px' }}>⭐</span>
              Compare
            </ModernButton>
          )}

          <div style={{ position: 'relative' }}>
            <ModernButton
              variant={accessibilityPanelOpen ? 'primary' : 'secondary'}
              onClick={() => { onAccessibilityPanelToggle(); dismissA11yTip(); }}
              title="Accessibility settings"
              size="sm"
            >
              <Settings size={14} />
            </ModernButton>
            {showA11yTip && (
              <FeatureTip
                message="Change font, colours, and text size here to make reading easier."
                onDismiss={dismissA11yTip}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right side - Stats & Info */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Compact Stats Pill - Enhanced */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '8px 16px',
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)',
            borderRadius: '24px',
            border: `2px solid ${darkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`,
            boxShadow: darkMode
              ? '0 2px 8px rgba(59, 130, 246, 0.2)'
              : '0 2px 8px rgba(59, 130, 246, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Type size={16} style={{ color: theme.primary, fontWeight: 'bold' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: theme.text, lineHeight: '1' }}>
                {wordCount.toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '500', color: theme.text, opacity: 0.6, lineHeight: '1' }}>
                words
              </span>
            </div>
          </div>
          <div style={{ width: '2px', height: '28px', backgroundColor: theme.primary, opacity: 0.3, borderRadius: '2px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} style={{ color: theme.primary, fontWeight: 'bold' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: theme.text, lineHeight: '1' }}>
                {readingTime}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '500', color: theme.text, opacity: 0.6, lineHeight: '1' }}>
                read time
              </span>
            </div>
          </div>
        </div>

        {lastSaved && (
          <span
            style={{
              fontSize: '12px',
              color: theme.text,
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

function FeatureTip({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '13px',
        lineHeight: '1.5',
        maxWidth: '260px',
        whiteSpace: 'normal',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        zIndex: 50,
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: '8px' }}>{message}</div>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '6px',
          color: '#f8fafc',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 12px',
          cursor: 'pointer',
        }}
      >
        Got it
      </button>
      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '6px solid #1e293b',
        }}
      />
    </div>
  );
}

function ProUpgradePopover({
  message,
  onUpgrade,
  onDismiss,
  darkMode,
}: {
  message: string;
  onUpgrade: () => void;
  onDismiss: () => void;
  darkMode: boolean;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        border: `1px solid ${darkMode ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.25)'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        fontSize: '13px',
        lineHeight: '1.5',
        width: '220px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        zIndex: 50,
        textAlign: 'center',
        color: darkMode ? '#f8fafc' : '#1e293b',
      }}
    >
      <div style={{ marginBottom: '12px' }}>{message}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          type="button"
          onClick={onUpgrade}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          Unlock with Pro →
        </button>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: darkMode ? 'rgba(248,250,252,0.5)' : '#94a3b8',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          Maybe later
        </button>
      </div>
      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: `6px solid ${darkMode ? '#1e293b' : '#ffffff'}`,
        }}
      />
    </div>
  );
}
