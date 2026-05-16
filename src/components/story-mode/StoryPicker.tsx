'use client';

import { useState } from 'react';
import { Sparkles, Lock, Crown } from 'lucide-react';
import type { GeneratedStory, StoryTheme, ReadingLevel } from '@/types/story';

const LIBRARY: Array<{
  id: string;
  emoji: string;
  title: string;
  level: ReadingLevel;
  theme: StoryTheme;
  free: boolean;
  warmupWords: GeneratedStory['warmupWords'];
  paragraphs: GeneratedStory['paragraphs'];
}> = [
  {
    id: 'captain-whiskers-1',
    emoji: '🏴‍☠️',
    title: 'Captain Whiskers and the Missing Map',
    level: 'easy',
    theme: 'pirates',
    free: true,
    warmupWords: [
      {
        word: 'treasure',
        phonetic: 'TREZH-er',
        syllables: ['trea', 'sure'],
        definition: 'Something very valuable that is hidden or saved.',
      },
      {
        word: 'compass',
        phonetic: 'KOM-pas',
        syllables: ['com', 'pass'],
        definition: 'A tool that always points north to help you find your way.',
      },
      {
        word: 'voyage',
        phonetic: 'VOY-ij',
        syllables: ['voy', 'age'],
        definition: 'A long journey, usually by sea.',
      },
    ],
    paragraphs: [
      {
        sentences: [
          'Captain Whiskers was a small orange cat who sailed the seven seas.',
          'His ship was called The Purring Pearl.',
          'Every sailor on the ship loved Captain Whiskers.',
        ],
      },
      {
        sentences: [
          'One morning, Captain Whiskers woke up and found his treasure map was gone!',
          'He searched high and low, but could not find it anywhere.',
          '"Who took my map?" he cried.',
        ],
      },
      {
        sentences: [
          'Then his first mate, a wise old parrot named Percy, had an idea.',
          '"Captain, did you check under your hat?" Percy asked.',
          'Captain Whiskers lifted his big hat — and there was the map!',
        ],
      },
      {
        sentences: [
          'Everyone on the ship laughed and cheered.',
          'Captain Whiskers laughed too.',
          '"Set sail!" he shouted, and The Purring Pearl sailed toward the treasure.',
        ],
      },
    ],
  },
  {
    id: 'star-rocket-1',
    emoji: '🚀',
    title: 'Zara and the Star Rocket',
    level: 'medium',
    theme: 'space',
    free: false,
    warmupWords: [
      {
        word: 'orbit',
        phonetic: 'OR-bit',
        syllables: ['or', 'bit'],
        definition: 'The path an object travels around a planet or star.',
      },
      {
        word: 'gravity',
        phonetic: 'GRAV-i-tee',
        syllables: ['grav', 'i', 'ty'],
        definition: 'The force that pulls things down toward the ground.',
      },
    ],
    paragraphs: [
      {
        sentences: [
          'Zara had dreamed of going to space ever since she was four years old.',
          'She built rockets out of cardboard and drew stars on her bedroom ceiling.',
          'One day, she got her chance.',
        ],
      },
      {
        sentences: [
          'Zara climbed into her shiny silver rocket and strapped in tight.',
          'She counted down — ten, nine, eight… three, two, one — BLAST OFF!',
          'The rocket shot up through the clouds and into the dark, starry sky.',
        ],
      },
      {
        sentences: [
          'In orbit, Zara floated weightlessly and pressed her nose to the window.',
          'The Earth glowed blue and green below her.',
          '"It is the most beautiful thing I have ever seen," she whispered.',
        ],
      },
      {
        sentences: [
          'Zara collected moon dust in a little jar to take home.',
          'She waved at the stars before pointing her rocket back toward Earth.',
          'When she landed, she knew — one day she would go back.',
        ],
      },
    ],
  },
];

const THEMES: { value: StoryTheme; label: string; emoji: string }[] = [
  { value: 'pirates', label: 'Pirates', emoji: '🏴‍☠️' },
  { value: 'space', label: 'Space', emoji: '🚀' },
  { value: 'animals', label: 'Animals', emoji: '🐾' },
  { value: 'magic', label: 'Magic', emoji: '✨' },
  { value: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕' },
  { value: 'underwater', label: 'Underwater', emoji: '🐠' },
];

const LEVELS: { value: ReadingLevel; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Short words, simple sentences' },
  { value: 'medium', label: 'Medium', desc: 'Some new words, mixed sentences' },
  { value: 'harder', label: 'Harder', desc: 'Richer vocabulary, longer text' },
];

interface Props {
  isPro: boolean;
  onSelect: (story: GeneratedStory) => void;
}

export function StoryPicker({ isPro, onSelect }: Props) {
  const [theme, setTheme] = useState<StoryTheme>('pirates');
  const [level, setLevel] = useState<ReadingLevel>('easy');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, readingLevel: level, isPro }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === 'free_limit' ? 'free_limit' : 'Failed to generate story. Please try again.');
        return;
      }
      onSelect(data as GeneratedStory);
    } catch {
      setError('Could not connect. Check your internet and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleLibrarySelect = (item: typeof LIBRARY[0]) => {
    if (!item.free && !isPro) return;
    onSelect({
      id: item.id,
      title: item.title,
      theme: item.theme,
      readingLevel: item.level,
      warmupWords: item.warmupWords,
      paragraphs: item.paragraphs,
      vocabDB: Object.fromEntries(
        item.warmupWords.map((w) => [w.word.toLowerCase(), w]),
      ),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📚</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#1f2937' }}>
          Story Time
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Choose a story from the library, or create a brand-new one with AI.
        </p>
      </div>

      {/* Library */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Story Library
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 44,
        }}
      >
        {LIBRARY.map((item) => {
          const locked = !item.free && !isPro;
          return (
            <button
              key={item.id}
              onClick={() => handleLibrarySelect(item)}
              disabled={locked}
              style={{
                background: locked ? '#f9fafb' : '#fff',
                border: `2px solid ${locked ? '#e5e7eb' : '#e0e7ff'}`,
                borderRadius: 16,
                padding: '24px 20px',
                textAlign: 'left',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.65 : 1,
                position: 'relative',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!locked) {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.12)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = locked ? '#e5e7eb' : '#e0e7ff';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {locked && (
                <div style={{ position: 'absolute', top: 12, right: 12, color: '#9ca3af' }}>
                  <Lock size={15} />
                </div>
              )}
              {!item.free && !locked && (
                <span
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#fbbf24', color: '#000',
                    borderRadius: 6, padding: '2px 7px',
                    fontSize: 11, fontWeight: 700,
                  }}
                >
                  PRO
                </span>
              )}
              {item.free && (
                <span
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#d1fae5', color: '#065f46',
                    borderRadius: 6, padding: '2px 7px',
                    fontSize: 11, fontWeight: 700,
                  }}
                >
                  FREE
                </span>
              )}
              <div style={{ fontSize: 38, marginBottom: 12 }}>{item.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#1f2937' }}>
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Level: {item.level}</div>
            </button>
          );
        })}
      </div>

      {/* Generate section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea12 0%, #764ba212 100%)',
          borderRadius: 20,
          padding: 32,
          border: '1px solid #e0e7ff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <Sparkles size={22} color="#6366f1" />
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1f2937' }}>
            Generate a New Story
          </h2>
          {!isPro && (
            <span
              style={{
                background: '#f3f4f6', color: '#6b7280',
                borderRadius: 6, padding: '2px 9px', fontSize: 12,
              }}
            >
              1 free per week
            </span>
          )}
        </div>

        {/* Theme selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#374151' }}>
            Choose a theme
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                style={{
                  padding: '8px 16px', borderRadius: 50,
                  border: `2px solid ${theme === t.value ? '#6366f1' : '#e5e7eb'}`,
                  background: theme === t.value ? '#e0e7ff' : '#fff',
                  color: theme === t.value ? '#4338ca' : '#374151',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#374151' }}>
            Reading level
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                style={{
                  padding: '10px 20px', borderRadius: 12,
                  border: `2px solid ${level === l.value ? '#6366f1' : '#e5e7eb'}`,
                  background: level === l.value ? '#e0e7ff' : '#fff',
                  color: level === l.value ? '#4338ca' : '#374151',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div>{l.label}</div>
                <div style={{ fontSize: 12, fontWeight: 400, color: '#6b7280' }}>{l.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Free limit upsell */}
        {error === 'free_limit' && (
          <div
            style={{
              background: '#fef3c7', border: '1px solid #fcd34d',
              borderRadius: 12, padding: '16px 20px', marginBottom: 20,
            }}
          >
            <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
              Weekly story used
            </div>
            <p style={{ margin: '0 0 12px', color: '#92400e', fontSize: 14 }}>
              You have used your free story this week. Upgrade to Pro for unlimited AI stories.
            </p>
            <a
              href="/pricing"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#fbbf24', color: '#000',
                padding: '8px 18px', borderRadius: 8,
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}
            >
              <Crown size={15} /> Upgrade to Pro
            </a>
          </div>
        )}

        {error && error !== 'free_limit' && (
          <div
            style={{
              background: '#fee2e2', borderRadius: 12,
              padding: '12px 16px', marginBottom: 20,
              color: '#991b1b', fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px',
            background: generating ? '#a5b4fc' : '#6366f1',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 700,
            cursor: generating ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <Sparkles size={18} />
          {generating ? 'Creating your story…' : 'Create Story'}
        </button>
      </div>
    </div>
  );
}
