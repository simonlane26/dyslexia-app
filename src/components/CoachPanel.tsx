// src/components/CoachPanel.tsx
'use client';

import React, { useState } from 'react';
import { Sparkles, Volume2, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';

type Props = {
  /** Raw text from the editor */
  sourceText: string;
  /** Feature gating */
  isPro: boolean;

  /** Theme bridge so the panel matches your editor colors */
  coachBg: string;       // e.g. darkMode ? '#374151' : bgColor
  coachText: string;     // e.g. editorTextColor
  coachBorder: string;   // e.g. darkMode ? '#6b7280' : (highContrast ? '#000000' : '#e5e7eb')
};

type CoachState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; tips: string[]; raw?: string }
  | { kind: 'error'; message: string; detail?: any };

export default function CoachPanel({
  sourceText,
  isPro,
  coachBg,
  coachText,
  coachBorder,
}: Props) {
  const [state, setState] = useState<CoachState>({ kind: 'idle' });

  async function askCoach() {
    const text = sourceText?.trim() || '';
    if (!text) {
      setState({ kind: 'error', message: 'Write something first so I can help.' });
      return;
    }

    setState({ kind: 'loading' });

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        // Read text once and try to show a helpful error
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

      // ✅ Robust success handling: read as text first, then try JSON.
      const ct = res.headers.get('content-type') || '';
      const raw = await res.text();

      let data: any = null;
      if (ct.includes('application/json')) {
        try { data = JSON.parse(raw); } catch { /* ignore */ }
      }

      // Prefer structured tips, else fall back to bulletizing whatever we got.
      const tips: string[] =
        Array.isArray(data?.tips) && data.tips.length
          ? data.tips
          : normalizeToBullets(String(data?.text ?? raw));

      if (!tips.length) {
        setState({
          kind: 'error',
          message: 'I could not find any tips in the response.',
          detail: data ?? raw,
        });
        return;
      }

      setState({ kind: 'ok', tips, raw: data?.text ?? raw });
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
      state.kind === 'ok' ? state.tips.join('. ') : (sourceText || '');
    try {
      (window as any).__dwSpeak?.(combined);
    } catch {
      // ignore if not available
    }
  }

  function clearTips() {
    setState({ kind: 'idle' });
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
            onClick={state.kind === 'loading' ? undefined : askCoach}
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

      {/* Body (everything renders inside the panel – no popups) */}
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
        <div className="mt-2 space-y-2">
          <ul className="pl-5 leading-7 list-disc">
  {state.tips.map((t, i) => {
    // Split on the first ":" or "–" or "." as a divider
    const match = t.match(/^([^:–\-\.]+)([:–\-\.]\s*)(.*)$/);
    if (match) {
      return (
        <li key={i} className="text-sm">
          <strong>{match[1].trim()}</strong>
          {match[2]}
          {match[3]}
        </li>
      );
    }
    return (
      <li key={i} className="text-sm">
        <strong>{t.split(' ')[0]}</strong>{' '}
        {t.split(' ').slice(1).join(' ')}
      </li>
    );
  })}
</ul>

        </div>
      )}

      {!isPro && (
        <p className="mt-3 text-xs opacity-70">
          Tip quality improves with Pro.
        </p>
      )}
    </aside>
  );
}

/** Turn a free-form string into bullets by splitting on newlines or bullets */
function normalizeToBullets(s: string): string[] {
  if (!s) return [];
  // If the server returns a single block, try to break on obvious bullet/separator patterns first
  const lined = s
    .split(/\r?\n/)
    .map((l) => l.replace(/^[•\-\*\d\.\)\s]+/, '').trim())
    .filter(Boolean);
  if (lined.length > 1) return lined;

  // Some models prefix sections like "Outline:", "Tips:"—strip them
  const cleaned = s.replace(/^([A-Za-z ]+:\s*)+/g, '').trim();

  // Fallback: split by sentence-ish boundaries
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Simple alpha helper for subtle error bg */
function withAlpha(hexOrRgb: string, alpha: number) {
  if (hexOrRgb.startsWith('#') && (hexOrRgb.length === 7 || hexOrRgb.length === 4)) {
    const hex = hexOrRgb.length === 4
      ? '#' + hexOrRgb.slice(1).split('').map((c) => c + c).join('')
      : hexOrRgb;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return 'rgba(0,0,0,0.06)';
}


