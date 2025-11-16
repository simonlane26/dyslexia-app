// src/components/TextComparison.tsx
'use client';

import { useState } from 'react';
import { X, ArrowRight, GitCompare } from 'lucide-react';
import { ModernButton } from './ModernButton';

interface TextComparisonProps {
  originalText: string;
  simplifiedText: string;
  theme: any;
  fontSize: number;
  fontFamily: string;
  bgColor: string;
  darkMode: boolean;
  editorTextColor: string;
}

export function TextComparison({
  originalText,
  simplifiedText,
  theme,
  fontSize,
  fontFamily,
  bgColor,
  darkMode,
  editorTextColor,
}: TextComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate statistics
  const getStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgWordLength =
      words.length > 0
        ? Math.round(words.reduce((sum, word) => sum + word.length, 0) / words.length * 10) / 10
        : 0;

    return {
      words: words.length,
      characters: text.length,
      sentences: sentences.length,
      avgWordLength,
    };
  };

  const originalStats = getStats(originalText);
  const simplifiedStats = getStats(simplifiedText);

  const calculateDifference = (original: number, simplified: number) => {
    if (original === 0) return 0;
    const diff = ((simplified - original) / original) * 100;
    return Math.round(diff * 10) / 10;
  };

  if (!isOpen) {
    return (
      <ModernButton
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={!simplifiedText}
      >
        <GitCompare size={16} />
        Compare
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
        zIndex: 1500,
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
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GitCompare size={24} style={{ color: theme.primary }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: 0 }}>
              Text Comparison
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

        {/* Statistics comparison */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.border}`,
            backgroundColor: `${theme.primary}08`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: theme.text, marginBottom: '12px' }}>
            Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <StatComparisonItem
              label="Words"
              original={originalStats.words}
              simplified={simplifiedStats.words}
              theme={theme}
            />
            <StatComparisonItem
              label="Characters"
              original={originalStats.characters}
              simplified={simplifiedStats.characters}
              theme={theme}
            />
            <StatComparisonItem
              label="Sentences"
              original={originalStats.sentences}
              simplified={simplifiedStats.sentences}
              theme={theme}
            />
            <StatComparisonItem
              label="Avg Word Length"
              original={originalStats.avgWordLength}
              simplified={simplifiedStats.avgWordLength}
              theme={theme}
              decimals
            />
          </div>
        </div>

        {/* Side-by-side text comparison */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
          {/* Original text */}
          <div
            style={{
              flex: 1,
              padding: '24px',
              borderRight: `1px solid ${theme.border}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: theme.text,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: `${theme.danger}20`,
                color: theme.danger,
                fontSize: '12px',
              }}>
                ORIGINAL
              </span>
            </h3>
            <div
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: darkMode ? '#374151' : bgColor,
                borderRadius: '8px',
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                color: editorTextColor,
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {originalText || 'No original text'}
            </div>
          </div>

          {/* Simplified text */}
          <div
            style={{
              flex: 1,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: theme.text,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: `${theme.success}20`,
                color: theme.success,
                fontSize: '12px',
              }}>
                SIMPLIFIED
              </span>
            </h3>
            <div
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: darkMode ? '#374151' : bgColor,
                borderRadius: '8px',
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                color: editorTextColor,
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {simplifiedText || 'No simplified text'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for stat comparison
function StatComparisonItem({
  label,
  original,
  simplified,
  theme,
  decimals = false,
}: {
  label: string;
  original: number;
  simplified: number;
  theme: any;
  decimals?: boolean;
}) {
  const diff = original === 0 ? 0 : ((simplified - original) / original) * 100;
  const diffRounded = Math.round(diff * 10) / 10;
  const displayOriginal = decimals ? original.toFixed(1) : original;
  const displaySimplified = decimals ? simplified.toFixed(1) : simplified;

  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div style={{ fontSize: '12px', color: theme.text, opacity: 0.7, marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
        <span style={{ fontWeight: 600, color: theme.text }}>{displayOriginal}</span>
        <ArrowRight size={14} style={{ color: theme.primary }} />
        <span style={{ fontWeight: 600, color: theme.text }}>{displaySimplified}</span>
        {diffRounded !== 0 && (
          <span
            style={{
              fontSize: '11px',
              color: diffRounded > 0 ? theme.danger : theme.success,
              fontWeight: 500,
            }}
          >
            ({diffRounded > 0 ? '+' : ''}{diffRounded}%)
          </span>
        )}
      </div>
    </div>
  );
}
