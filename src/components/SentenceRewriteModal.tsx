'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Check } from 'lucide-react';
import { ModernButton } from './ModernButton';
import { CoachIntent } from './CoachIntentModal';

export interface SentenceAlternative {
  label: string;
  icon: string;
  text: string;
  explanation: string;
}

interface SentenceRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSentence: string;
  onApply: (newSentence: string) => void;
  theme: any;
  darkMode: boolean;
  intent?: CoachIntent | null;
}

type RewriteState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; alternatives: SentenceAlternative[] }
  | { kind: 'error'; message: string };

export function SentenceRewriteModal({
  isOpen,
  onClose,
  selectedSentence,
  onApply,
  theme,
  darkMode,
  intent,
}: SentenceRewriteModalProps) {
  const [state, setState] = useState<RewriteState>({ kind: 'idle' });
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  // Fetch alternatives when modal opens
  useEffect(() => {
    if (isOpen && selectedSentence) {
      fetchAlternatives();
    }
  }, [isOpen, selectedSentence]);

  async function fetchAlternatives() {
    setState({ kind: 'loading' });

    try {
      const res = await fetch('/api/coach/rewrite-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: selectedSentence,
          intent: intent || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setState({
          kind: 'error',
          message: errorData?.detail || `Server error: ${res.status}`,
        });
        return;
      }

      const raw = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(raw);
      } catch {
        setState({
          kind: 'error',
          message: 'Could not parse response. Please try again.',
        });
        return;
      }

      if (data && Array.isArray(data.alternatives) && data.alternatives.length > 0) {
        setState({ kind: 'ok', alternatives: data.alternatives });
      } else {
        setState({
          kind: 'error',
          message: 'No alternatives returned. Please try again.',
        });
      }
    } catch (e: any) {
      setState({
        kind: 'error',
        message: e?.message || 'Network error. Please check your connection.',
      });
    }
  }

  function handleApply(alternative: SentenceAlternative, index: number) {
    onApply(alternative.text);
    setAppliedIndex(index);

    // Close modal after short delay so user sees the checkmark
    setTimeout(() => {
      onClose();
      setAppliedIndex(null);
      setState({ kind: 'idle' });
    }, 800);
  }

  function handleClose() {
    onClose();
    setAppliedIndex(null);
    setState({ kind: 'idle' });
  }

  if (!isOpen) return null;

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
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: '16px',
          maxWidth: '700px',
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
              Rewrite this sentence
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              Choose an alternative that works best for you
            </p>
          </div>
          <button
            onClick={handleClose}
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
          {/* Original Sentence */}
          <div
            style={{
              padding: '16px',
              backgroundColor: darkMode ? '#374151' : '#f9fafb',
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: darkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Original
            </div>
            <div
              style={{
                fontSize: '15px',
                color: theme.text,
                lineHeight: '1.6',
              }}
            >
              {selectedSentence}
            </div>
          </div>

          {/* Loading State */}
          {state.kind === 'loading' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                gap: '16px',
              }}
            >
              <Loader2 size={32} className="animate-spin" style={{ color: theme.primary }} />
              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                }}
              >
                Generating alternatives...
              </div>
            </div>
          )}

          {/* Error State */}
          {state.kind === 'error' && (
            <div
              style={{
                padding: '20px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ef4444',
                    marginBottom: '4px',
                  }}
                >
                  Could not generate alternatives
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: theme.text,
                    lineHeight: '1.4',
                  }}
                >
                  {state.message}
                </div>
                <ModernButton
                  onClick={fetchAlternatives}
                  variant="primary"
                  size="sm"
                  style={{ marginTop: '12px' }}
                >
                  Try Again
                </ModernButton>
              </div>
            </div>
          )}

          {/* Alternatives */}
          {state.kind === 'ok' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Choose one:
              </div>
              {state.alternatives.map((alt, index) => {
                const isApplied = appliedIndex === index;

                return (
                  <div
                    key={index}
                    style={{
                      padding: '20px',
                      backgroundColor: isApplied
                        ? 'rgba(34, 197, 94, 0.1)'
                        : darkMode
                        ? '#374151'
                        : '#f9fafb',
                      border: `2px solid ${
                        isApplied
                          ? '#22c55e'
                          : theme.border
                      }`,
                      borderRadius: '12px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{alt.icon}</span>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: theme.text,
                          }}
                        >
                          {alt.label}
                        </span>
                      </div>
                      {!isApplied && (
                        <ModernButton
                          onClick={() => handleApply(alt, index)}
                          variant="primary"
                          size="sm"
                        >
                          Apply
                        </ModernButton>
                      )}
                      {isApplied && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                          }}
                        >
                          <Check size={16} />
                          Applied
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        color: theme.text,
                        lineHeight: '1.6',
                        marginBottom: '8px',
                        fontWeight: '500',
                      }}
                    >
                      {alt.text}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        lineHeight: '1.5',
                      }}
                    >
                      {alt.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          <ModernButton onClick={handleClose} variant="secondary">
            Close
          </ModernButton>
        </div>
      </div>
    </div>
  );
}
