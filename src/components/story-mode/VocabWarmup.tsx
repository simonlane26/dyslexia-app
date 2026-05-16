'use client';

import { useState } from 'react';
import { ChevronRight, Volume2 } from 'lucide-react';
import type { WarmupWord } from '@/types/story';

interface Props {
  words: WarmupWord[];
  storyTitle: string;
  onDone: () => void;
}

export function VocabWarmup({ words, storyTitle, onDone }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const word = words[current];
  const isLast = current === words.length - 1;

  if (!word) {
    onDone();
    return null;
  }

  const handleNext = () => {
    if (isLast) {
      onDone();
    } else {
      setFlipped(false);
      // brief delay so the card resets before advancing
      setTimeout(() => setCurrent((c) => c + 1), 120);
    }
  };

  const speak = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(word.word);
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ marginBottom: 6, color: '#6b7280', fontSize: 14 }}>
        Getting ready for: <strong style={{ color: '#374151' }}>{storyTitle}</strong>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#1f2937' }}>
        Warm-Up Words
      </h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>
        Word {current + 1} of {words.length}
      </p>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        {words.map((_, i) => (
          <div
            key={i}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i < current ? '#10b981' : i === current ? '#6366f1' : '#e5e7eb',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Flip card */}
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{
          background: '#fff',
          borderRadius: 20,
          border: `2px solid ${flipped ? '#c7d2fe' : '#e0e7ff'}`,
          padding: '40px 32px',
          marginBottom: 24,
          cursor: 'pointer',
          minHeight: 210,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(99,102,241,0.08)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(99,102,241,0.14)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.08)'; }}
      >
        {!flipped ? (
          <>
            <div style={{ fontSize: 38, fontWeight: 900, color: '#1f2937', marginBottom: 8 }}>
              {word.word}
            </div>
            <div style={{ fontSize: 17, color: '#6366f1', letterSpacing: 1, marginBottom: 16 }}>
              {word.phonetic}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
              {word.syllables.map((s, i) => (
                <span
                  key={i}
                  style={{
                    background: '#e0e7ff', color: '#4338ca',
                    borderRadius: 6, padding: '3px 10px',
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Tap to see meaning</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 14 }}>
              {word.word}
            </div>
            <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.65, margin: 0 }}>
              {word.definition}
            </p>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={speak}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', background: '#f3f4f6',
            color: '#374151', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Volume2 size={15} /> Hear it
        </button>
        <button
          onClick={handleNext}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 28px', background: '#6366f1',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {isLast ? 'Start Reading' : 'Next Word'} <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
