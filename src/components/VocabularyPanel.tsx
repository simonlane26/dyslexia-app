'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, BookOpen, Flame, Trophy, Clock, ChevronRight } from 'lucide-react';
import { VocabularyReview } from './VocabularyReview';

interface VocabWord {
  id: string;
  word: string;
  phonetic: string | null;
  syllables: string[] | null;
  definition: string | null;
  example_sentence: string | null;
  source_type: string;
  interval_days: number;
  review_count: number;
  next_review_at: string;
  times_seen: number;
  times_correct: number;
  created_at: string;
}

interface Stats {
  total: number;
  due: number;
  mastered: number;
  learning: number;
}

interface VocabularyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: any;
  darkMode: boolean;
}

function masteryLabel(word: VocabWord): { label: string; color: string; bg: string } {
  if (word.interval_days >= 21) return { label: 'Mastered', color: '#166534', bg: '#dcfce7' };
  if (word.interval_days >= 4)  return { label: 'Reviewing', color: '#92400e', bg: '#fef3c7' };
  return { label: 'Learning', color: '#1e40af', bg: '#dbeafe' };
}

function dueLabel(nextReview: string): string {
  const diff = new Date(nextReview).getTime() - Date.now();
  if (diff <= 0) return 'Due now';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days}d`;
}

export function VocabularyPanel({ isOpen, onClose, theme, darkMode }: VocabularyPanelProps) {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, due: 0, mastered: 0, learning: 0 });
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vocabulary/list');
      if (res.ok) {
        const data = await res.json();
        setWords(data.words ?? []);
        setStats(data.stats ?? { total: 0, due: 0, mastered: 0, learning: 0 });
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const dueWords = words.filter(w => w.next_review_at <= new Date().toISOString());

  const bg = darkMode ? '#1e293b' : '#fff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text = darkMode ? '#f1f5f9' : '#1e293b';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const surface = darkMode ? '#0f172a' : '#f8fafc';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1400 }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 380, maxWidth: '95vw',
        background: bg,
        borderLeft: `1px solid ${border}`,
        zIndex: 1401,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookOpen size={22} style={{ color: '#7c3aed', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: text, margin: 0 }}>My Vocabulary</h2>
            <p style={{ fontSize: 12, color: muted, margin: 0 }}>Words you&apos;ve decoded — growing over time</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: muted }}>
            <X size={20} />
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: border, borderBottom: `1px solid ${border}` }}>
          {[
            { icon: <BookOpen size={14} />, value: stats.total, label: 'Total', color: '#7c3aed' },
            { icon: <Flame size={14} />, value: stats.due, label: 'Due today', color: '#dc2626' },
            { icon: <Trophy size={14} />, value: stats.mastered, label: 'Mastered', color: '#166534' },
          ].map(s => (
            <div key={s.label} style={{ background: bg, padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: s.color, marginBottom: 2 }}>
                {s.icon}
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Fraunces',Georgia,serif" }}>{s.value}</span>
              </div>
              <div style={{ fontSize: 11, color: muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Review CTA */}
        {stats.due > 0 && (
          <div style={{ padding: '12px 16px', background: darkMode ? '#2d1b69' : '#ede9fe', borderBottom: `1px solid ${border}` }}>
            <button
              onClick={() => setShowReview(true)}
              style={{
                width: '100%', background: '#7c3aed', color: '#fff', border: 'none',
                borderRadius: 10, padding: '11px 16px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Flame size={16} />
              Start review — {stats.due} word{stats.due !== 1 ? 's' : ''} due
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Word list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: muted, fontSize: 14 }}>Loading your words…</div>
          )}
          {!loading && words.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
              <p style={{ fontSize: 14, color: text, fontWeight: 600, marginBottom: 6 }}>No words yet</p>
              <p style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>
                Double-click any word in the editor, or tap a word while reading a story, to decode it and add it here.
              </p>
            </div>
          )}
          {!loading && words.map(w => {
            const mastery = masteryLabel(w);
            const due = w.next_review_at <= new Date().toISOString();
            return (
              <div key={w.id} style={{
                padding: '14px 16px',
                borderBottom: `1px solid ${border}`,
                background: due ? (darkMode ? '#2d1b69' : '#faf5ff') : bg,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: text, fontFamily: "'Fraunces',Georgia,serif" }}>
                        {w.word}
                      </span>
                      {w.phonetic && (
                        <span style={{ fontSize: 12, color: '#7c3aed', fontStyle: 'italic' }}>{w.phonetic}</span>
                      )}
                      {due && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: '#dc2626', color: '#fff', borderRadius: 4, padding: '2px 6px' }}>DUE</span>
                      )}
                    </div>
                    {w.definition && (
                      <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                        {w.definition}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: mastery.bg, color: mastery.color }}>
                      {mastery.label}
                    </span>
                    <span style={{ fontSize: 10, color: muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={10} /> {dueLabel(w.next_review_at)}
                    </span>
                    {w.times_seen > 1 && (
                      <span style={{ fontSize: 10, color: muted }}>seen {w.times_seen}×</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {words.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: muted }}>
              {stats.learning} learning · {stats.total - stats.mastered - stats.learning} reviewing · {stats.mastered} mastered
            </span>
          </div>
        )}
      </div>

      {/* Review modal */}
      {showReview && dueWords.length > 0 && (
        <VocabularyReview
          words={dueWords}
          onClose={() => { setShowReview(false); load(); }}
          onComplete={(n) => { load(); }}
          theme={theme}
          darkMode={darkMode}
        />
      )}
    </>
  );
}
