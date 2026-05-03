'use client';

import { useState } from 'react';
import { X, Volume2, RotateCcw } from 'lucide-react';

interface VocabWord {
  id: string;
  word: string;
  phonetic: string | null;
  syllables: string[] | null;
  definition: string | null;
  example_sentence: string | null;
  interval_days: number;
  review_count: number;
}

interface VocabularyReviewProps {
  words: VocabWord[];
  onClose: () => void;
  onComplete: (reviewed: number) => void;
  theme: any;
  darkMode: boolean;
}

const SYLLABLE_COLORS = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

const QUALITY_BUTTONS = [
  { label: 'Again', quality: 0, bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', hint: 'Completely forgot' },
  { label: 'Hard', quality: 1, bg: '#ffedd5', color: '#9a3412', border: '#fdba74', hint: 'Got it with difficulty' },
  { label: 'Good', quality: 2, bg: '#dbeafe', color: '#1e40af', border: '#93c5fd', hint: 'Got it with effort' },
  { label: 'Easy', quality: 3, bg: '#dcfce7', color: '#166534', border: '#86efac', hint: 'Recalled instantly' },
];

export function VocabularyReview({ words, onClose, onComplete, theme, darkMode }: VocabularyReviewProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [done, setDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const card = words[index];

  async function speak(text: string) {
    if (speaking) return;
    setSpeaking(true);
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const ctx = new AudioContext();
        const decoded = await ctx.decodeAudioData(buf);
        const src = ctx.createBufferSource();
        src.buffer = decoded;
        src.connect(ctx.destination);
        src.onended = () => setSpeaking(false);
        src.start();
      }
    } catch {
      // fall back to browser TTS
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-GB';
      utt.onend = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    } finally {
      if (!speaking) setSpeaking(false);
    }
  }

  async function handleQuality(quality: number) {
    // Submit to SRS API (fire and forget)
    void fetch('/api/vocabulary/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId: card.id, quality }),
    });

    const next = index + 1;
    if (next >= words.length) {
      setDone(true);
      onComplete(reviewed + 1);
    } else {
      setIndex(next);
      setRevealed(false);
      setReviewed(r => r + 1);
    }
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  };

  const modal: React.CSSProperties = {
    background: darkMode ? '#1e293b' : '#fff',
    borderRadius: 20, width: '100%', maxWidth: 520,
    boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  };

  if (done) {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={{ ...modal, padding: 48, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 26, color: darkMode ? '#f1f5f9' : '#1e293b', marginBottom: 8 }}>
            Session complete!
          </h2>
          <p style={{ fontSize: 15, color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 32 }}>
            You reviewed <strong>{reviewed + 1}</strong> word{reviewed + 1 !== 1 ? 's' : ''}. Keep it up — your vocabulary is growing.
          </p>
          <button
            onClick={onClose}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
          <span style={{ fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
            {index + 1} of {words.length}
          </span>
          <div style={{ flex: 1, margin: '0 16px', height: 6, background: darkMode ? '#334155' : '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((index) / words.length) * 100}%`, background: '#7c3aed', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: darkMode ? '#94a3b8' : '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Card */}
        <div style={{ padding: '40px 32px 32px', textAlign: 'center' }}>
          {/* Word */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 42, fontWeight: 600, color: darkMode ? '#f1f5f9' : '#1e293b', margin: 0 }}>
              {card.word}
            </h2>
            <button
              onClick={() => speak(card.word)}
              style={{ background: speaking ? '#ede9fe' : 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#7c3aed', transition: 'background 0.15s' }}
              title="Hear pronunciation"
            >
              <Volume2 size={22} />
            </button>
          </div>

          {/* Phonetic */}
          {card.phonetic && (
            <p style={{ fontSize: 16, color: darkMode ? '#7c3aed' : '#7c3aed', marginBottom: 12, fontStyle: 'italic' }}>
              {card.phonetic}
            </p>
          )}

          {/* Syllables */}
          {card.syllables && card.syllables.length > 0 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              {card.syllables.map((s, i) => (
                <span key={i} style={{ padding: '4px 10px', borderRadius: 20, background: `${SYLLABLE_COLORS[i % SYLLABLE_COLORS.length]}20`, color: SYLLABLE_COLORS[i % SYLLABLE_COLORS.length], fontSize: 14, fontWeight: 600 }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Prompt before reveal */}
          {!revealed && (
            <>
              <p style={{ fontSize: 14, color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 28 }}>
                What does this word mean?
              </p>
              <button
                onClick={() => speak(card.word)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 20px' }}
              >
                <Volume2 size={14} /> Hear it
              </button>
              <button
                onClick={() => { setRevealed(true); speak(card.word); }}
                style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 40px', fontSize: 16, fontWeight: 600, cursor: 'pointer', width: '100%' }}
              >
                Show answer
              </button>
            </>
          )}

          {/* Revealed */}
          {revealed && (
            <>
              <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Definition</p>
                <p style={{ fontSize: 16, color: darkMode ? '#e2e8f0' : '#1e293b', lineHeight: 1.6, margin: 0 }}>
                  {card.definition || 'No definition saved.'}
                </p>
              </div>

              {card.example_sentence && (
                <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0891b2', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Example</p>
                  <p style={{ fontSize: 15, color: darkMode ? '#cbd5e1' : '#334155', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                    "{card.example_sentence}"
                  </p>
                </div>
              )}

              {/* Rating buttons */}
              <p style={{ fontSize: 12, color: darkMode ? '#64748b' : '#94a3b8', marginBottom: 12 }}>How well did you remember it?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {QUALITY_BUTTONS.map(({ label, quality, bg, color, border, hint }) => (
                  <button
                    key={label}
                    onClick={() => handleQuality(quality)}
                    title={hint}
                    style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 4px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                  >
                    {label}
                    <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>{hint}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => { setIndex(0); setRevealed(false); setReviewed(0); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: darkMode ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <RotateCcw size={12} /> Restart session
          </button>
        </div>
      </div>
    </div>
  );
}
