'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, BookOpen, Volume2, ChevronRight, RotateCcw } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface Chunk { id: number; text: string; }
interface KeyFact { icon: string; text: string; }
interface Summary { num: number; text: string; chunkIndex: number; }
interface WordData { phonetic: string; syllables: string[]; definition: string; example: string; count: number; }
interface PopupState { word: string; data: WordData | null; loading: boolean; x: number; y: number; }
interface ResumeInfo { chunkIndex: number; readChunks: number[]; summaries: Summary[]; lastSummary: string; }

interface Props {
  text: string;
  documentId?: string;
  isPro: boolean;
  onClose: () => void;
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
}

// ── Constants ─────────────────────────────────────────────────────────────

const FREE_WORD_LIMIT = 5;
const CHECKPOINT_EVERY = 3; // show checkpoint after every N chunks read

// ── Helpers ───────────────────────────────────────────────────────────────

function chunkText(text: string): Chunk[] {
  const paras = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 20);
  const chunks: Chunk[] = [];
  let id = 0;
  for (const para of paras) {
    if (para.length <= 600) {
      chunks.push({ id: id++, text: para });
    } else {
      const sentences = para.match(/[^.!?]+[.!?]+[\s]*/g) ?? [para];
      let buf = '';
      for (const s of sentences) {
        if (buf && (buf + s).length > 500) {
          chunks.push({ id: id++, text: buf.trim() });
          buf = s;
        } else {
          buf += s;
        }
      }
      if (buf.trim()) chunks.push({ id: id++, text: buf.trim() });
    }
  }
  return chunks.length ? chunks : [{ id: 0, text: text.trim() }];
}

function extractKeyFacts(text: string): KeyFact[] {
  const facts: KeyFact[] = [];
  const seen = new Set<string>();
  function add(icon: string, t: string) {
    const key = t.toLowerCase().slice(0, 30);
    if (!seen.has(key)) { seen.add(key); facts.push({ icon, text: t }); }
  }
  // Dates
  const dates = text.match(/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi) ?? [];
  dates.slice(0, 2).forEach(d => add('📅', d));
  // Deadlines
  const deadlines = text.match(/deadline[:\s]+([^\n.]{3,40})/gi) ?? [];
  deadlines.slice(0, 1).forEach(d => add('⏰', d.replace(/^deadline[:\s]+/i, 'Deadline: ')));
  // Money
  const money = text.match(/[£$€]\d[\d,]*(?:\.\d{2})?(?:\s*(?:million|thousand|k))?\b/gi) ?? [];
  money.slice(0, 2).forEach(m => add('💷', m));
  // Names (Mrs/Mr/Dr/Ms)
  const names = text.match(/\b(?:Mrs|Mr|Dr|Ms|Miss|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g) ?? [];
  names.slice(0, 2).forEach(n => add('👤', n));
  // Room numbers
  const rooms = text.match(/\bRoom\s+\d+[^.,\n]{0,20}/gi) ?? [];
  rooms.slice(0, 1).forEach(r => add('📍', r.trim()));
  // Email addresses
  const emails = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g) ?? [];
  emails.slice(0, 1).forEach(e => add('📧', e));
  return facts.slice(0, 6);
}

function storageKey(text: string, documentId?: string) {
  return 'dw-reader-' + (documentId ?? text.slice(0, 50).replace(/\W+/g, '-'));
}

// ── Component ─────────────────────────────────────────────────────────────

export function MemoryReader({ text, documentId, isPro, onClose, darkMode, fontSize, fontFamily }: Props) {
  const [mode, setMode] = useState<'clean' | 'guided' | 'supported'>('supported');
  const [chunks] = useState(() => chunkText(text));
  const [keyFacts] = useState(() => extractKeyFacts(text));
  const [currentChunk, setCurrentChunk] = useState(0);
  const [readChunks, setReadChunks] = useState<number[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [lookedUpWords, setLookedUpWords] = useState<Record<string, WordData>>({});
  const [wordPopup, setWordPopup] = useState<PopupState | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [wordLookupCount, setWordLookupCount] = useState(0);
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<number | null>(null);
  const [dismissedResume, setDismissedResume] = useState(false);
  const [checkpointsDismissed, setCheckpointsDismissed] = useState<Set<number>>(new Set());
  const mainRef = useRef<HTMLDivElement>(null);

  // ── Load saved position ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(text, documentId));
      if (saved) {
        const d = JSON.parse(saved);
        if (d.currentChunk > 0) {
          setResumeInfo({ chunkIndex: d.currentChunk, readChunks: d.readChunks ?? [], summaries: d.summaries ?? [], lastSummary: d.lastSummary ?? '' });
        }
      }
    } catch { /* ignore */ }
  }, []);

  // ── Save position ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!readChunks.length) return;
    try {
      localStorage.setItem(storageKey(text, documentId), JSON.stringify({
        currentChunk, readChunks, summaries, mode,
        lastSummary: summaries[summaries.length - 1]?.text ?? '',
        timestamp: Date.now(),
      }));
    } catch { /* ignore */ }
  }, [currentChunk, readChunks, summaries, mode]);

  // ── Resume from saved position ─────────────────────────────────────────
  function handleResume() {
    if (!resumeInfo) return;
    setCurrentChunk(resumeInfo.chunkIndex);
    setReadChunks(resumeInfo.readChunks);
    setSummaries(resumeInfo.summaries);
    setDismissedResume(true);
    setTimeout(() => {
      const el = mainRef.current?.querySelector(`[data-chunk="${resumeInfo.chunkIndex}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // ── Mark chunk as read ─────────────────────────────────────────────────
  const markRead = useCallback(async (index: number) => {
    if (readChunks.includes(index)) return;
    const newRead = [...readChunks, index];
    setReadChunks(newRead);
    setCurrentChunk(index + 1);

    // Scroll to next
    setTimeout(() => {
      const next = mainRef.current?.querySelector(`[data-chunk="${index + 1}"]`);
      if (next) next.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);

    // Generate summary (Pro only)
    if (isPro) {
      setSummaryLoading(index);
      try {
        const res = await fetch('/api/reader/summarise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chunks[index].text }),
        });
        if (res.ok) {
          const { summary } = await res.json();
          if (summary) {
            setSummaries(prev => [...prev, { num: newRead.length, text: summary, chunkIndex: index }]);
          }
        }
      } catch { /* ignore */ }
      setSummaryLoading(null);
    }
  }, [readChunks, chunks, isPro]);

  // ── Word tap ───────────────────────────────────────────────────────────
  async function handleWordTap(e: React.MouseEvent<HTMLSpanElement>, word: string) {
    e.stopPropagation();
    const clean = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
    if (clean.length < 2) return;

    // Free limit
    if (!isPro && wordLookupCount >= FREE_WORD_LIMIT && !lookedUpWords[clean]) {
      const rect = e.currentTarget.getBoundingClientRect();
      setWordPopup({ word: clean, data: null, loading: false, x: rect.left, y: rect.bottom + 8 });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setWordPopup({ word: clean, data: lookedUpWords[clean] ?? null, loading: !lookedUpWords[clean], x: rect.left, y: rect.bottom + 8 });

    if (lookedUpWords[clean]) {
      setLookedUpWords(prev => ({ ...prev, [clean]: { ...prev[clean], count: prev[clean].count + 1 } }));
      return;
    }

    if (!isPro) setWordLookupCount(c => c + 1);

    try {
      const res = await fetch('/api/stories/word-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: clean, context: '', readingLevel: 2 }),
      });
      if (res.ok) {
        const data = await res.json();
        const wordData: WordData = { phonetic: data.phonetic ?? '', syllables: data.syllables ?? [], definition: data.definition ?? '', example: data.example ?? '', count: 1 };
        setLookedUpWords(prev => ({ ...prev, [clean]: wordData }));
        setWordPopup(prev => prev?.word === clean ? { ...prev, data: wordData, loading: false } : prev);

        // Save to vocabulary (Pro only)
        if (isPro) {
          void fetch('/api/vocabulary/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: clean, phonetic: data.phonetic, syllables: data.syllables, definition: data.definition, example: data.example, sourceType: 'editor' }),
          });
        }
      }
    } catch {
      setWordPopup(prev => prev?.word === clean ? { ...prev, loading: false } : prev);
    }
  }

  function speakWord(word: string) {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(word);
      u.rate = 0.8; u.lang = 'en-GB';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }

  // ── Colours ────────────────────────────────────────────────────────────
  const bg = darkMode ? '#0f172a' : '#FDF6E3';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const sidebarBg = darkMode ? '#0f172a' : '#F8F7F4';
  const border = darkMode ? '#334155' : '#E8E6DE';
  const textColor = darkMode ? '#e2e8f0' : '#2C2C2A';
  const muted = darkMode ? '#94a3b8' : '#888780';
  const teal = '#1D9E75';
  const tealLight = darkMode ? '#0d3d2b' : '#E1F5EE';
  const purple = '#534AB7';
  const purpleLight = darkMode ? '#2d1b69' : '#EEEDFE';
  const amber = '#BA7517';
  const amberLight = darkMode ? '#3d2800' : '#FAEEDA';

  const SYLLABLE_COLORS = ['#7c3aed','#0891b2','#059669','#d97706','#dc2626'];

  // ── Render word tokens ─────────────────────────────────────────────────
  function renderWords(chunkText: string) {
    return chunkText.split(/(\s+)/).map((token, i) => {
      if (/^\s+$/.test(token)) return token;
      const clean = token.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
      const wasLookedUp = !!lookedUpWords[clean];
      return (
        <span
          key={i}
          onClick={(e) => handleWordTap(e, token)}
          style={{
            cursor: 'pointer',
            borderRadius: 3,
            padding: '0 1px',
            borderBottom: wasLookedUp ? `2px dotted ${purple}` : 'none',
            color: wasLookedUp ? purple : 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = purpleLight; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {token}
        </span>
      );
    });
  }

  // ── Checkpoint logic ───────────────────────────────────────────────────
  function shouldShowCheckpoint(afterChunkIndex: number): boolean {
    if (!isPro) return false;
    if (checkpointsDismissed.has(afterChunkIndex)) return false;
    const readCount = readChunks.filter(c => c <= afterChunkIndex).length;
    return readCount > 0 && readCount % CHECKPOINT_EVERY === 0 && readChunks.includes(afterChunkIndex);
  }

  // ── Progress ───────────────────────────────────────────────────────────
  const progress = chunks.length > 0 ? Math.round((readChunks.length / chunks.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: bg, display: 'flex', flexDirection: 'column', fontFamily: "'Lexend', system-ui, sans-serif" }}
      onClick={() => setWordPopup(null)}
    >
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: cardBg, borderBottom: `1px solid ${border}`, flexShrink: 0, zIndex: 110 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#085041', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>📖</span> Memory Reading
        </span>
        <div style={{ flex: 1 }} />
        {/* Mode switcher */}
        <div style={{ display: 'flex', gap: 2, background: border, borderRadius: 8, padding: 2 }}>
          {(['clean','guided','supported'] as const).map(m => (
            <button key={m} type="button"
              onClick={() => setMode(m)}
              style={{ padding: '6px 13px', borderRadius: 6, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                background: mode === m ? cardBg : 'transparent',
                color: mode === m ? textColor : muted,
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        {/* Sidebar toggle (Pro) */}
        {isPro && mode !== 'clean' && (
          <button type="button" onClick={() => setShowSidebar(s => !s)}
            style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${showSidebar ? teal : border}`, fontSize: 12, cursor: 'pointer', background: showSidebar ? tealLight : cardBg, color: showSidebar ? '#085041' : muted, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            📋 Summary
          </button>
        )}
        {/* Read aloud */}
        <button type="button"
          onClick={() => {
            const chunk = chunks[currentChunk];
            if (chunk && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(chunk.text);
              u.rate = 0.85; u.lang = 'en-GB';
              window.speechSynthesis.speak(u);
            }
          }}
          style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${border}`, fontSize: 12, cursor: 'pointer', background: cardBg, color: muted, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <Volume2 size={14} /> Read
        </button>
        {/* Close */}
        <button type="button" onClick={onClose}
          style={{ padding: '6px 10px', borderRadius: 7, border: `1px solid ${border}`, fontSize: 12, cursor: 'pointer', background: cardBg, color: muted, display: 'flex', alignItems: 'center' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height: 3, background: border, flexShrink: 0, zIndex: 105 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: teal, transition: 'width 0.5s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* ── Key facts strip (free + pro) ── */}
      {keyFacts.length > 0 && mode !== 'clean' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 16px', background: amberLight, borderBottom: `2px solid #F0D49C`, flexShrink: 0, zIndex: 100 }}>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: amber, padding: '4px 0', alignSelf: 'center' }}>📌 Key facts</span>
          {keyFacts.map((f, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500, color: '#633806' }}>
              {f.icon} {f.text}
            </span>
          ))}
        </div>
      )}

      {/* ── Resume banner (free + pro) ── */}
      {resumeInfo && !dismissedResume && (
        <div style={{ padding: '12px 20px', background: purpleLight, borderBottom: `1px solid #CECBF6`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, animation: 'fadeUp 0.4s ease' }}>
          <span style={{ fontSize: 20 }}>📖</span>
          <div style={{ flex: 1, fontSize: 13, color: purple, lineHeight: 1.5 }}>
            <strong style={{ color: textColor }}>Welcome back.</strong>
            {resumeInfo.lastSummary
              ? ` Last time you read about ${resumeInfo.lastSummary.toLowerCase()}. You stopped at section ${resumeInfo.chunkIndex + 1}.`
              : ` You stopped at section ${resumeInfo.chunkIndex + 1}.`}
          </div>
          <button type="button" onClick={handleResume}
            style={{ padding: '6px 14px', borderRadius: 6, background: purple, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}
          >
            Continue reading
          </button>
          <button type="button" onClick={() => setDismissedResume(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 16, padding: 4 }}
          >✕</button>
        </div>
      )}

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar (Pro only) ── */}
        {isPro && showSidebar && mode !== 'clean' && (
          <div style={{ width: 280, background: sidebarBg, borderRight: `1px solid ${border}`, padding: 16, overflowY: 'auto', flexShrink: 0 }}>

            {/* Running summary */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: teal, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📋</span> Running summary
              </div>
              {summaries.length === 0 ? (
                <p style={{ fontSize: 12, color: muted, fontStyle: 'italic', padding: 8, textAlign: 'center' }}>Summaries will appear here as you read each section</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {summaries.map((s, i) => (
                    <li key={i}
                      onClick={() => {
                        const el = mainRef.current?.querySelector(`[data-chunk="${s.chunkIndex}"]`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      style={{ padding: '8px 10px', marginBottom: 4, borderRadius: 8, fontSize: 12, lineHeight: 1.5, color: textColor, background: i === summaries.length - 1 ? tealLight : cardBg, border: `1px solid ${i === summaries.length - 1 ? teal : border}`, cursor: 'pointer', fontWeight: i === summaries.length - 1 ? 500 : 400 }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 600, color: teal, marginRight: 4 }}>{s.num}.</span>{s.text}
                    </li>
                  ))}
                  {summaryLoading !== null && (
                    <li style={{ padding: '8px 10px', fontSize: 12, color: muted, fontStyle: 'italic' }}>Summarising…</li>
                  )}
                </ul>
              )}
            </div>

            {/* Looked-up words */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: purple, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📚</span> Words looked up
              </div>
              {Object.keys(lookedUpWords).length === 0 ? (
                <p style={{ fontSize: 12, color: muted, fontStyle: 'italic', padding: 8, textAlign: 'center' }}>Tap any word to look it up</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {Object.entries(lookedUpWords).map(([word, data]) => (
                    <li key={word} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', marginBottom: 3, borderRadius: 6, fontSize: 12, background: cardBg, border: `1px solid ${border}` }}>
                      <span style={{ fontWeight: 600, color: purple }}>{word}</span>
                      <span style={{ color: muted, fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.definition}</span>
                      <span style={{ fontSize: 10, color: muted, background: border, padding: '1px 6px', borderRadius: 10 }}>{data.count}×</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Reading area ── */}
        <div ref={mainRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 40px', maxWidth: 760, margin: '0 auto', width: '100%' }}
          onClick={() => setWordPopup(null)}
        >
          {chunks.map((chunk, i) => {
            const isRead = readChunks.includes(i);
            const isCurrent = i === currentChunk;
            const isLocked = mode === 'supported' && i > currentChunk && !isRead;
            const isUpcoming = isLocked && i === currentChunk + 1;

            let chunkStyle: React.CSSProperties = {
              marginBottom: 8,
              padding: '20px 24px',
              borderRadius: 12,
              border: '2px solid transparent',
              transition: 'all 0.4s ease',
              lineHeight: 1.9,
              fontSize: isRead && mode === 'supported' ? 15 : fontSize || 17,
              fontFamily,
              color: textColor,
              letterSpacing: '0.02em',
              wordSpacing: '0.08em',
              position: 'relative',
            };

            if (mode === 'supported') {
              if (isRead) {
                chunkStyle = { ...chunkStyle, opacity: 0.45, lineHeight: 1.7, padding: '12px 24px', borderRadius: 8 };
              } else if (isCurrent) {
                chunkStyle = { ...chunkStyle, background: cardBg, borderColor: border, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
              } else if (isLocked) {
                chunkStyle = { ...chunkStyle, filter: isUpcoming ? 'blur(1.5px)' : 'blur(3px)', opacity: isUpcoming ? 0.2 : 0.1, pointerEvents: 'none', userSelect: 'none' };
              }
            } else if (mode === 'guided') {
              if (isCurrent) chunkStyle = { ...chunkStyle, background: cardBg, borderColor: border, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };
            }

            return (
              <div key={chunk.id}>
                <div data-chunk={i} style={chunkStyle} onClick={e => e.stopPropagation()}>
                  {renderWords(chunk.text)}
                </div>

                {/* Continue button — supported mode, current chunk not yet read */}
                {mode === 'supported' && isCurrent && !isRead && (
                  <div style={{ textAlign: 'center', padding: '14px', margin: '4px 0 8px' }}>
                    <button type="button" onClick={() => markRead(i)}
                      style={{ padding: '11px 32px', borderRadius: 10, background: teal, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                    >
                      I&apos;ve read this <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Checkpoint — Pro only, every N chunks */}
                {mode === 'supported' && isPro && shouldShowCheckpoint(i) && (
                  <div style={{ margin: '12px 0', padding: '16px 20px', borderRadius: 12, background: darkMode ? '#1a2744' : '#E6F1FB', border: '1px solid #B8D8F5', animation: 'fadeUp 0.4s ease' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#378ADD', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🧠</span> Let&apos;s check in — here&apos;s what you&apos;ve covered so far
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
                      {summaries.filter(s => s.chunkIndex <= i).map((s, si) => (
                        <li key={si} style={{ fontSize: 13, color: '#1A5C94', padding: '3px 0', display: 'flex', gap: 6, lineHeight: 1.5 }}>
                          <span>✓</span> {s.text}
                        </li>
                      ))}
                    </ul>
                    <button type="button"
                      onClick={() => setCheckpointsDismissed(prev => new Set(Array.from(prev).concat(i)))}
                      style={{ padding: '8px 20px', borderRadius: 8, background: '#378ADD', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}
                    >
                      Got it — continue reading
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Finished */}
          {mode === 'supported' && readChunks.length === chunks.length && chunks.length > 0 && (
            <div style={{ margin: '16px 0', padding: '20px 24px', borderRadius: 12, background: tealLight, border: '1px solid #9FE1CB', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#085041', marginBottom: 4 }}>You&apos;ve finished reading!</p>
              <p style={{ fontSize: 13, color: '#0F6E56' }}>Your full summary is in the sidebar. You can review it anytime.</p>
            </div>
          )}

          {/* Free user upgrade nudge */}
          {!isPro && wordLookupCount >= FREE_WORD_LIMIT && (
            <div style={{ margin: '16px 0', padding: '14px 20px', borderRadius: 10, background: purpleLight, border: `1px solid #CECBF6` }}>
              <p style={{ fontSize: 13, color: purple, margin: 0 }}>
                You&apos;ve used your 5 free word lookups for this document.{' '}
                <strong>Upgrade to Pro</strong> for unlimited word lookups and vocabulary tracking across all your documents.
              </p>
            </div>
          )}

          <div style={{ height: 80 }} />
        </div>
      </div>

      {/* ── Word popup ── */}
      {wordPopup && (
        <div
          style={{ position: 'fixed', zIndex: 2100, left: Math.min(wordPopup.x, typeof window !== 'undefined' ? window.innerWidth - 290 : wordPopup.x), top: Math.min(wordPopup.y, typeof window !== 'undefined' ? window.innerHeight - 200 : wordPopup.y), background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', maxWidth: 280, animation: 'popIn 0.2s ease' }}
          onClick={e => e.stopPropagation()}
        >
          <button type="button" onClick={() => setWordPopup(null)}
            style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', fontSize: 16, color: muted, cursor: 'pointer' }}
          >✕</button>

          {!isPro && wordLookupCount >= FREE_WORD_LIMIT && !lookedUpWords[wordPopup.word] ? (
            <p style={{ fontSize: 13, color: textColor, margin: 0 }}>Upgrade to Pro for unlimited word lookups.</p>
          ) : wordPopup.loading ? (
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>Looking up <em>{wordPopup.word}</em>…</p>
          ) : wordPopup.data ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 600, color: purple, marginBottom: 2 }}>{wordPopup.word}</div>
              {wordPopup.data.phonetic && <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>{wordPopup.data.phonetic}</div>}
              {wordPopup.data.syllables.length > 0 && (
                <div style={{ display: 'flex', gap: 3, marginBottom: 8, flexWrap: 'wrap' }}>
                  {wordPopup.data.syllables.map((s, i) => (
                    <span key={i} style={{ padding: '3px 8px', borderRadius: 4, background: `${SYLLABLE_COLORS[i % SYLLABLE_COLORS.length]}20`, color: SYLLABLE_COLORS[i % SYLLABLE_COLORS.length], fontSize: 12, fontWeight: 500 }}>{s}</span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 13, color: muted, lineHeight: 1.5, marginBottom: 8 }}>{wordPopup.data.definition}</div>
              <button type="button" onClick={() => speakWord(wordPopup.word)}
                style={{ padding: '5px 12px', borderRadius: 6, background: tealLight, color: '#085041', border: 'none', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <Volume2 size={12} /> Listen
              </button>
            </>
          ) : null}
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes popIn  { from { opacity:0; transform:scale(0.95) }       to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  );
}
