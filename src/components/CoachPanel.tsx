// src/components/CoachPanel.tsx
'use client';

import React, { useState } from 'react';
import { Sparkles, Volume2, RotateCcw, Loader2, AlertTriangle, Lightbulb, Edit3, List, CheckCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { CoachIntentModal, CoachIntent } from './CoachIntentModal';
import type { CopyMap } from '@/lib/schoolCopy';
import { DEFAULT_COPY } from '@/lib/schoolCopy';

type Props = {
  /** Raw text from the editor */
  sourceText: string;
  /** Feature gating */
  isPro: boolean;

  /** Theme bridge so the panel matches your editor colors */
  coachBg: string;       // e.g. darkMode ? '#374151' : bgColor
  coachText: string;     // e.g. editorTextColor
  coachBorder: string;   // e.g. darkMode ? '#6b7280' : (highContrast ? '#000000' : '#e5e7eb')

  /** Callback to apply suggestion to editor */
  onApplySuggestion?: (before: string, after: string) => void;

  /** Theme for modals */
  theme?: any;
  darkMode?: boolean;

  /** School Mode */
  isSchoolMode?: boolean;
  copy?: CopyMap;
};

type TipCategory = 'clarity' | 'simplicity' | 'structure' | 'grammar' | 'strength';
type TipSeverity = 'high' | 'medium' | 'low';

interface Tip {
  category: TipCategory;
  severity: TipSeverity;
  message: string;
  suggestion: string;
  sentenceText?: string;
  before?: string;
  after?: string;
}

interface Stats {
  avgSentenceLength: number;
  longSentences: number;
  complexWords: number;
  readingLevel: 'Easy' | 'Medium' | 'Hard';
}

interface CoachResponse {
  tips: Tip[];
  stats: Stats;
  strengths: string[];
  motivation: string;
}

type CoachState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; data: CoachResponse }
  | { kind: 'error'; message: string; detail?: any };

export default function CoachPanel({
  sourceText,
  isPro,
  coachBg,
  coachText,
  coachBorder,
  onApplySuggestion,
  theme,
  darkMode = false,
  isSchoolMode = false,
  copy = DEFAULT_COPY,
}: Props) {
  const [state, setState] = useState<CoachState>({ kind: 'idle' });
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<CoachIntent | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  function trackProgress(stats: Stats) {
    try {
      const history = JSON.parse(localStorage.getItem('coach-history') || '[]');
      const currentSession = {
        avgSentenceLength: stats.avgSentenceLength,
        longSentences: stats.longSentences,
        complexWords: stats.complexWords,
        timestamp: Date.now(),
      };

      history.push(currentSession);
      // Keep last 10 sessions
      const recentHistory = history.slice(-10);
      localStorage.setItem('coach-history', JSON.stringify(recentHistory));

      // Check for improvement
      if (recentHistory.length > 1) {
        const previous = recentHistory[recentHistory.length - 2];
        const current = recentHistory[recentHistory.length - 1];

        const sentenceImprovement = previous.avgSentenceLength - current.avgSentenceLength;
        const complexWordsImprovement = previous.complexWords - current.complexWords;

        if (sentenceImprovement > 2) {
          setProgressMessage(
            `📈 Your sentences are ${Math.round(sentenceImprovement)} words shorter than last time! Keep it up!`
          );
        } else if (complexWordsImprovement > 2) {
          setProgressMessage(
            `📈 You're using ${complexWordsImprovement} fewer complex words! Your writing is getting clearer!`
          );
        } else if (sentenceImprovement > 0 || complexWordsImprovement > 0) {
          setProgressMessage(`📈 You're making progress! Your writing is getting clearer.`);
        }
      }
    } catch (e) {
      console.warn('Failed to track progress:', e);
    }
  }

  function startCoaching() {
    const text = sourceText?.trim() || '';
    if (!text) {
      setState({ kind: 'error', message: 'Write something first so I can help.' });
      return;
    }

    // Show intent modal first
    setShowIntentModal(true);
  }

  async function askCoach(intent: CoachIntent) {
    const text = sourceText?.trim() || '';
    if (!text) {
      setState({ kind: 'error', message: 'Write something first so I can help.' });
      return;
    }

    setCurrentIntent(intent);
    setShowIntentModal(false);
    setState({ kind: 'loading' });

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, intent, isSchoolMode }),
      });

      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const raw = await res.text();
        let payload: any = null;
        if (ct.includes('application/json')) {
          try { payload = JSON.parse(raw); } catch {}
        }
        const msg =
          payload?.error ||
          `Coach error ${res.status}${res.statusText ? `: ${res.statusText}` : ''}`;
        setState({ kind: 'error', message: msg, detail: payload || raw });
        return;
      }

      const ct = res.headers.get('content-type') || '';
      const raw = await res.text();

      let data: any = null;
      if (ct.includes('application/json')) {
        try { data = JSON.parse(raw); } catch { /* ignore */ }
      } else {
        // Try to parse as JSON even if content-type is text/plain
        try { data = JSON.parse(raw); } catch { /* ignore */ }
      }

      // Validate structured response
      if (data && Array.isArray(data.tips)) {
        setState({ kind: 'ok', data: data as CoachResponse });

        // Track progress in localStorage
        trackProgress(data.stats);
      } else {
        setState({
          kind: 'error',
          message: 'Could not parse coach response. Please try again.',
          detail: data ?? raw,
        });
      }
    } catch (e: any) {
      setState({
        kind: 'error',
        message: 'Network error while contacting the coach.',
        detail: e?.message || e,
      });
    }
  }

  function speakAll() {
    const combined =
      state.kind === 'ok'
        ? state.data.tips.map(t => t.message).join('. ')
        : (sourceText || '');
    try {
      (window as any).__dwSpeak?.(combined);
    } catch {
      // ignore if not available
    }
  }

  function clearTips() {
    setState({ kind: 'idle' });
    setExpandedTips(new Set());
  }

  function toggleTip(index: number) {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTips(newExpanded);
  }

  function getCategoryIcon(category: TipCategory) {
    switch (category) {
      case 'clarity': return <Lightbulb size={16} />;
      case 'simplicity': return <Edit3 size={16} />;
      case 'structure': return <List size={16} />;
      case 'grammar': return <CheckCircle size={16} />;
      case 'strength': return <Star size={16} />;
    }
  }

  function getCategoryColor(category: TipCategory) {
    switch (category) {
      case 'clarity': return '#3b82f6'; // blue
      case 'simplicity': return '#10b981'; // green
      case 'structure': return '#f59e0b'; // amber
      case 'grammar': return '#ef4444'; // red
      case 'strength': return '#8b5cf6'; // purple
    }
  }

  function getSeverityBadge(severity: TipSeverity) {
    const badges = {
      high: { icon: '⭐', label: copy.coachBadgeHigh, bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
      medium: { icon: '💡', label: copy.coachBadgeMedium, bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
      low: { icon: '🤔', label: 'Optional', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', text: '#64748b' },
    };
    const b = badges[severity];
    return (
      <span
        style={{
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: b.bg,
          border: `1px solid ${b.border}`,
          color: b.text,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>{b.icon}</span>
        <span>{b.label}</span>
      </span>
    );
  }

  return (
    <aside
      className="p-4 border shadow-sm rounded-2xl"
      style={{
        backgroundColor: coachBg,
        color: coachText,
        borderColor: coachBorder,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h2 className="text-lg font-semibold">Writing Coach</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={speakAll}
            className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm"
            style={{ borderColor: coachBorder }}
            title="Read aloud"
            disabled={state.kind !== 'ok' && !sourceText}
          >
            <Volume2 size={16} />
            Read
          </button>

          <button
            onClick={state.kind === 'loading' ? undefined : startCoaching}
            className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm"
            style={{ borderColor: coachBorder }}
            title="Get tips"
          >
            {state.kind === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Thinking…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Get tips
              </>
            )}
          </button>

          {state.kind === 'ok' && (
            <button
              onClick={clearTips}
              className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm"
              style={{ borderColor: coachBorder }}
              title="Clear tips"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {state.kind === 'idle' && (
        <p className="text-sm opacity-80">
          Press <strong>Get tips</strong> to see suggestions here.
        </p>
      )}

      {state.kind === 'loading' && (
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Loader2 size={16} className="animate-spin" />
          Generating tips…
        </div>
      )}

      {state.kind === 'error' && (
        <div
          className="p-3 mt-2 text-sm border rounded-xl"
          style={{ borderColor: coachBorder, backgroundColor: withAlpha(coachText, 0.06) }}
        >
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} />
            Error
          </div>
          <div className="mt-1 opacity-90">{state.message}</div>
          {process.env.NODE_ENV !== 'production' && state.detail && (
            <pre className="mt-2 overflow-auto text-xs opacity-70">
              {typeof state.detail === 'string'
                ? state.detail
                : JSON.stringify(state.detail, null, 2)}
            </pre>
          )}
        </div>
      )}

      {state.kind === 'ok' && (
        <div className="mt-3 space-y-3">
          {/* Stats Dashboard */}
          <div
            className="p-3 border rounded-xl"
            style={{ borderColor: coachBorder, backgroundColor: withAlpha(coachText, 0.03) }}
          >
            <h3 className="text-sm font-semibold mb-2">📊 Text Analysis</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="opacity-70">Avg Sentence Length</div>
                <div className="font-semibold">{state.data.stats.avgSentenceLength} words</div>
              </div>
              <div>
                <div className="opacity-70">Long Sentences</div>
                <div className="font-semibold">{state.data.stats.longSentences}</div>
              </div>
              <div>
                <div className="opacity-70">Complex Words</div>
                <div className="font-semibold">{state.data.stats.complexWords}</div>
              </div>
              <div>
                <div className="opacity-70">Reading Level</div>
                <div className="font-semibold">{state.data.stats.readingLevel}</div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {state.data.strengths.length > 0 && (
            <div
              className="p-3 border rounded-xl"
              style={{
                borderColor: 'rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
              }}
            >
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Star size={16} style={{ color: '#22c55e' }} />
                Strengths
              </h3>
              <ul className="text-xs space-y-1">
                {state.data.strengths.map((s, i) => (
                  <li key={i} className="opacity-90">✓ {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">💡 Suggestions</h3>
            {state.data.tips.map((tip, i) => {
              const isExpanded = expandedTips.has(i);
              const categoryColor = getCategoryColor(tip.category);

              return (
                <div
                  key={i}
                  className="border rounded-xl overflow-hidden"
                  style={{ borderColor: coachBorder }}
                >
                  {/* Tip Header */}
                  <div
                    className="p-3 cursor-pointer"
                    style={{ backgroundColor: withAlpha(categoryColor, 0.05) }}
                    onClick={() => toggleTip(i)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div style={{ color: categoryColor, marginTop: '2px' }}>
                          {getCategoryIcon(tip.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase opacity-70">
                              {tip.category}
                            </span>
                            {getSeverityBadge(tip.severity)}
                          </div>
                          <div className="text-sm font-medium">{tip.message}</div>
                        </div>
                      </div>
                      <div style={{ color: coachText, opacity: 0.5 }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div
                      className="p-3 border-t text-sm space-y-2"
                      style={{
                        borderColor: coachBorder,
                        backgroundColor: withAlpha(coachText, 0.02),
                      }}
                    >
                      {tip.suggestion && (
                        <div>
                          <div className="text-xs font-semibold opacity-70 mb-1">Suggestion:</div>
                          <div className="opacity-90">{tip.suggestion}</div>
                        </div>
                      )}

                      {tip.sentenceText && (
                        <div>
                          <div className="text-xs font-semibold opacity-70 mb-1">Found in:</div>
                          <div
                            className="p-2 rounded border text-xs italic"
                            style={{
                              borderColor: coachBorder,
                              backgroundColor: withAlpha(coachText, 0.03),
                            }}
                          >
                            "{tip.sentenceText}"
                          </div>
                        </div>
                      )}

                      {tip.before && tip.after && (
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs font-semibold opacity-70 mb-1">Before:</div>
                            <div
                              className="p-2 rounded border text-xs"
                              style={{
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                              }}
                            >
                              {tip.before}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold opacity-70 mb-1">After:</div>
                            <div
                              className="p-2 rounded border text-xs"
                              style={{
                                borderColor: 'rgba(34, 197, 94, 0.3)',
                                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                              }}
                            >
                              {tip.after}
                            </div>
                          </div>
                          {onApplySuggestion && (
                            <button
                              onClick={() => onApplySuggestion(tip.before!, tip.after!)}
                              className="w-full px-3 py-2 text-xs font-semibold rounded-lg"
                              style={{
                                backgroundColor: categoryColor,
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Apply This Change
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Message */}
          {progressMessage && (
            <div
              className="p-3 border rounded-xl text-sm font-medium"
              style={{
                borderColor: 'rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                color: '#22c55e',
              }}
            >
              {progressMessage}
            </div>
          )}

          {/* Motivation */}
          {state.data.motivation && (
            <div
              className="p-3 border rounded-xl text-sm italic"
              style={{
                borderColor: 'rgba(139, 92, 246, 0.3)',
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
              }}
            >
              💪 {state.data.motivation}
            </div>
          )}
        </div>
      )}

      {!isPro && (
        <p className="mt-3 text-xs opacity-70">
          Tip quality improves with Pro.
        </p>
      )}

      {/* Intent Modal */}
      {theme && (
        <CoachIntentModal
          isOpen={showIntentModal}
          onClose={() => setShowIntentModal(false)}
          onSubmit={askCoach}
          theme={theme}
          darkMode={darkMode}
        />
      )}

      {/* Display current intent */}
      {currentIntent && state.kind === 'ok' && (
        <div
          className="mt-3 p-3 border rounded-xl text-xs"
          style={{
            borderColor: coachBorder,
            backgroundColor: withAlpha(coachText, 0.03),
          }}
        >
          <div className="font-semibold opacity-70 mb-1">Writing context:</div>
          <div className="opacity-90">
            For: <strong>{currentIntent.audience}</strong> •
            To: <strong>{currentIntent.purpose}</strong> •
            Tone: <strong>{currentIntent.tone}</strong>
          </div>
        </div>
      )}
    </aside>
  );
}

/** Simple alpha helper for subtle backgrounds */
function withAlpha(hexOrRgb: string, alpha: number) {
  if (!hexOrRgb) return `rgba(0,0,0,${alpha})`;

  if (hexOrRgb.startsWith('#') && (hexOrRgb.length === 7 || hexOrRgb.length === 4)) {
    const hex = hexOrRgb.length === 4
      ? '#' + hexOrRgb.slice(1).split('').map((c) => c + c).join('')
      : hexOrRgb;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(0,0,0,${alpha})`;
}
