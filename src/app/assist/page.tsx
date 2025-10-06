'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type Suggestion = {
  id: string;
  kind: 'spelling' | 'grammar' | 'clarity' | 'style';
  original: string;
  suggestion: string;
  reason: string;        // plain-language explanation
  start: number;         // char start in text
  end: number;           // char end in text
};

export default function AssistPage() {
  // editor state
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'write' | 'assist' | 'read'>('assist');

  // AI controls
  const [level, setLevel] = useState<1 | 2 | 3>(2); // 1 basic, 2 standard, 3 advanced
  const [autoExplain, setAutoExplain] = useState(true);
  const [loading, setLoading] = useState(false);

  // suggestions
  const [sugs, setSugs] = useState<Suggestion[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // selection helpers
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- fetch suggestions (mocked here; wire to your API) ---
  async function fetchSuggestions() {
    setLoading(true);
    try {
      // Example payload – point this at /api/assist
      const res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level, explain: autoExplain })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Expect data.suggestions: Suggestion[]
      setSugs(data.suggestions || []);
      if ((data.suggestions || []).length) {
        setActiveId(data.suggestions[0].id);
      }
    } catch (e) {
      console.error('Assist error:', e);
      setSugs([]);
    } finally {
      setLoading(false);
    }
  }

  // --- apply a single suggestion ---
  function applySuggestion(s: Suggestion) {
    // Replace text in [start, end) with s.suggestion
    const before = text.slice(0, s.start);
    const after = text.slice(s.end);
    const next = before + s.suggestion + after;
    setText(next);

    // Re-map remaining suggestions’ offsets (simple approach: refetch)
    // For robust behavior, call fetchSuggestions() again:
    fetchSuggestions();
  }

  // --- apply all suggestions ---
  function applyAll() {
    // Simple strategy: apply in order from left to right to keep indices stable
    const ordered = [...sugs].sort((a, b) => a.start - b.start);
    let result = text;
    let offset = 0;
    for (const s of ordered) {
      const start = s.start + offset;
      const end = s.end + offset;
      result = result.slice(0, start) + s.suggestion + result.slice(end);
      offset += s.suggestion.length - (end - start);
    }
    setText(result);
    setSugs([]);
  }

  // --- highlight current selection in the editor preview (read mode) ---
  const previewNodes = useMemo(() => {
    if (!sugs.length) return text;
    const active = sugs.find(x => x.id === activeId);
    if (!active) return text;
    const { start, end } = active;
    return (
      <>
        {text.slice(0, start)}
        <mark style={{ background: '#fff176', padding: '0 2px', borderRadius: 4 }}>
          {text.slice(start, end)}
        </mark>
        {text.slice(end)}
      </>
    );
  }, [text, sugs, activeId]);

  // --- focus editor at suggestion position ---
  function jumpToSuggestion(s: Suggestion) {
    setActiveId(s.id);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(s.start, s.end);
      // Basic scroll-into-view approximation
      const lineHeight = 24;
      ta.scrollTop = Math.max(0, (s.start / 60) * lineHeight - 80);
    });
  }

  return (
    <div style={styles.shell}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setMode('write')}
            style={chip(mode === 'write')}
            aria-pressed={mode === 'write'}
          >✍️ Write</button>
          <button
            onClick={() => setMode('assist')}
            style={chip(mode === 'assist')}
            aria-pressed={mode === 'assist'}
          >🧠 Assist</button>
          <button
            onClick={() => setMode('read')}
            style={chip(mode === 'read')}
            aria-pressed={mode === 'read'}
          >🔊 Read</button>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={styles.label}>
            Difficulty
            <select
              value={level}
              onChange={e => setLevel(Number(e.target.value) as 1 | 2 | 3)}
              style={styles.select}
            >
              <option value={1}>Basic</option>
              <option value={2}>Standard</option>
              <option value={3}>Advanced</option>
            </select>
          </label>

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={autoExplain}
              onChange={(e) => setAutoExplain(e.target.checked)}
            />
            Explain suggestions
          </label>

          <button onClick={fetchSuggestions} style={styles.primaryBtn} disabled={loading || !text.trim()}>
            {loading ? 'Analyzing…' : 'Analyze Text'}
          </button>
          <button onClick={applyAll} style={styles.ghostBtn} disabled={!sugs.length}>
            Apply All
          </button>
        </div>
      </div>

      {/* Main content: editor + assist panel */}
      <div style={styles.main}>
        <section style={styles.editorPane} aria-label="Editor">
          {mode !== 'read' ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text…"
              style={styles.textarea}
            />
          ) : (
            <div style={styles.readPane}>{previewNodes}</div>
          )}
        </section>

        <aside style={styles.assistPane} aria-label="AI Assistant">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Suggestions ({sugs.length})</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge label="Spelling" color="#10b981" />
              <Badge label="Grammar" color="#6366f1" />
              <Badge label="Clarity" color="#f59e0b" />
              <Badge label="Style" color="#ef4444" />
            </div>
          </div>

          <div style={styles.suggestionList}>
            {sugs.length === 0 && (
              <div style={{ color: '#64748b' }}>
                {loading ? 'Looking for improvements…' : 'No suggestions yet. Click “Analyze Text”.'}
              </div>
            )}

            {sugs.map((s) => (
              <div
                key={s.id}
                style={suggestionCard(activeId === s.id)}
                onClick={() => jumpToSuggestion(s)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && jumpToSuggestion(s)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ textTransform: 'capitalize' }}>{s.kind}</strong>
                  <button onClick={(e) => { e.stopPropagation(); applySuggestion(s); }} style={styles.applyBtn}>
                    Apply
                  </button>
                </div>
                <div style={{ fontSize: 14, color: '#334155', marginBottom: 6 }}>
                  <span style={strike()}>{s.original}</span> → <span style={{ fontWeight: 600 }}>{s.suggestion}</span>
                </div>
                {autoExplain && (
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    {s.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------- tiny presentational helpers ------- */
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 12, padding: '2px 8px', borderRadius: 999,
      background: color + '22', color, border: `1px solid ${color}66`
    }}>{label}</span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { maxWidth: 1200, margin: '2rem auto', padding: 12, fontFamily: 'Arial, sans-serif', color: '#0f172a' },
  topbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 10, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff'
  },
  main: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 12, marginTop: 12, alignItems: 'stretch' },
  editorPane: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 },
  assistPane: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, height: 'min(78vh, 100%)', overflow: 'auto' },
  textarea: {
    width: '100%', minHeight: '60vh', resize: 'vertical',
    padding: 12, borderRadius: 10, border: '1px solid #cbd5e1',
    fontSize: 18, lineHeight: 1.7
  },
  readPane: {
    width: '100%', minHeight: '60vh', padding: 12, borderRadius: 10, border: '1px dashed #cbd5e1',
    fontSize: 18, lineHeight: 1.8, whiteSpace: 'pre-wrap', background: '#f8fafc'
  },
  label: { display: 'flex', flexDirection: 'column', fontWeight: 700, fontSize: 13, color: '#334155' },
  select: { marginTop: 6, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontSize: 14 },
  primaryBtn: {
    padding: '10px 14px', borderRadius: 10, border: '1px solid #2563eb',
    background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 700
  },
  ghostBtn: { padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 },
  suggestionList: { display: 'grid', gap: 10 },
  applyBtn: {
    padding: '6px 10px', borderRadius: 8, border: '1px solid #10b981',
    background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 700
  },
};

function chip(active: boolean): React.CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: 999,
    border: `2px solid ${active ? '#2563eb' : '#cbd5e1'}`,
    color: active ? '#2563eb' : '#334155',
    background: active ? '#eef2ff' : '#fff',
    cursor: 'pointer',
    fontWeight: 800
  };
}

function suggestionCard(active: boolean): React.CSSProperties {
  return {
    border: `2px solid ${active ? '#2563eb' : '#e2e8f0'}`,
    background: active ? '#f0f7ff' : '#fff',
    borderRadius: 12,
    padding: 10,
    outline: 'none'
  };
}

function strike(): React.CSSProperties {
  return { textDecoration: 'line-through', color: '#64748b' };
}
