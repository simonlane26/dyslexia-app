'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Eye,
  Zap,
  Volume2,
  X,
  ChevronRight,
} from 'lucide-react';
import type { GeneratedStory, ReadingMode } from '@/types/story';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface Props {
  story: GeneratedStory;
  isPro: boolean;
  onNewStory: () => void;
}

// Flatten all words with their paragraph/sentence context
function buildWordList(story: GeneratedStory) {
  const list: Array<{
    raw: string;
    clean: string;
    paragraphIndex: number;
    sentenceIndex: number;
    globalIndex: number;
  }> = [];
  let g = 0;
  story.paragraphs.forEach((para, pIdx) => {
    para.sentences.forEach((sentence, sIdx) => {
      sentence.split(/\s+/).filter(Boolean).forEach((raw) => {
        list.push({
          raw,
          clean: raw.replace(/[.,!?;:'"()]/g, '').toLowerCase(),
          paragraphIndex: pIdx,
          sentenceIndex: sIdx,
          globalIndex: g++,
        });
      });
    });
  });
  return list;
}

// Build a flat sentence list mapping sentence → global word start
function buildSentenceMap(story: GeneratedStory) {
  const map: Array<{ pIdx: number; sIdx: number; start: number; end: number }> = [];
  let g = 0;
  story.paragraphs.forEach((para, pIdx) => {
    para.sentences.forEach((sentence, sIdx) => {
      const count = sentence.split(/\s+/).filter(Boolean).length;
      map.push({ pIdx, sIdx, start: g, end: g + count - 1 });
      g += count;
    });
  });
  return map;
}

const MODE_LABELS: { value: ReadingMode; label: string; icon: React.ReactNode }[] = [
  { value: 'supported', label: 'Supported', icon: <Eye size={14} /> },
  { value: 'guided', label: 'Guided', icon: <Zap size={14} /> },
  { value: 'clean', label: 'Clean', icon: <BookOpen size={14} /> },
];

export function StoryReader({ story, isPro, onNewStory }: Props) {
  const [mode, setMode] = useState<ReadingMode>('supported');
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordsLookedUp, setWordsLookedUp] = useState<string[]>([]);
  const [showComplete, setShowComplete] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timestampsRef = useRef<WordTimestamp[]>([]);
  const audioUrlRef = useRef<string>('');
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());
  const wordEls = useRef<Map<number, HTMLSpanElement>>(new Map());

  const wordList = buildWordList(story);
  const sentenceMap = buildSentenceMap(story);
  const fullText = story.paragraphs.flatMap((p) => p.sentences).join(' ');

  const syncHighlight = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !timestampsRef.current.length) return;
    const t = audio.currentTime;
    const idx = timestampsRef.current.findIndex((w) => t >= w.start && t < w.end);
    setCurrentWordIdx(idx);
    const el = wordEls.current.get(idx);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    rafRef.current = requestAnimationFrame(syncHighlight);
  }, []);

  const saveProgress = useCallback(
    async (completed: boolean) => {
      await fetch('/api/story/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          wordsRead: completed ? wordList.length : Math.max(currentWordIdx, 0),
          totalWords: wordList.length,
          wordsLookedUp,
          readingMode: mode,
          duration: Math.round((Date.now() - startTimeRef.current) / 1000),
          completed,
        }),
      }).catch(() => {});
    },
    [story.id, wordList.length, currentWordIdx, wordsLookedUp, mode],
  );

  const loadAndPlay = useCallback(async () => {
    // Reuse already-loaded audio
    if (audioRef.current && audioUrlRef.current) {
      audioRef.current.play();
      setPlaying(true);
      rafRef.current = requestAnimationFrame(syncHighlight);
      return;
    }

    setLoadingAudio(true);
    try {
      // Reuse existing stories/speak endpoint (supports word timestamps)
      const res = await fetch('/api/stories/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      });
      if (!res.ok) return;
      const data = await res.json();

      // Convert WordTiming (ms) to seconds for our timestamps
      const ts: WordTimestamp[] = (data.wordTimings ?? []).map(
        (wt: { word: string; startMs: number; endMs: number }) => ({
          word: wt.word,
          start: wt.startMs / 1000,
          end: wt.endMs / 1000,
        }),
      );
      timestampsRef.current = ts;

      const blob = new Blob(
        [Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0))],
        { type: 'audio/mpeg' },
      );
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setPlaying(false);
        setCurrentWordIdx(-1);
        cancelAnimationFrame(rafRef.current);
        saveProgress(true);
        setShowComplete(true);
      };
      audio.play();
      setPlaying(true);
      rafRef.current = requestAnimationFrame(syncHighlight);
    } finally {
      setLoadingAudio(false);
    }
  }, [fullText, syncHighlight, saveProgress]);

  const handlePause = () => {
    audioRef.current?.pause();
    setPlaying(false);
    cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const handleWordClick = (clean: string) => {
    const entry =
      story.vocabDB?.[clean] ??
      story.warmupWords.find((w) => w.word.toLowerCase() === clean);
    if (entry) {
      setSelectedWord(clean);
      if (!wordsLookedUp.includes(clean)) {
        setWordsLookedUp((prev) => [...prev, clean]);
      }
    }
  };

  const vocabEntry =
    selectedWord
      ? story.vocabDB?.[selectedWord] ??
        story.warmupWords.find((w) => w.word.toLowerCase() === selectedWord)
      : null;

  // Sentence for guided-mode opacity
  const activeSentence =
    currentWordIdx >= 0
      ? sentenceMap.find(
          (s) => currentWordIdx >= s.start && currentWordIdx <= s.end,
        )
      : null;

  // --- Complete screen ---
  if (showComplete) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '80px auto',
          padding: '0 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#1f2937' }}>
          Amazing reading!
        </h2>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>
          You finished &ldquo;{story.title}&rdquo;
        </p>

        {wordsLookedUp.length > 0 && (
          <div
            style={{
              background: '#e0e7ff',
              borderRadius: 12,
              padding: '14px 20px',
              marginBottom: 24,
            }}
          >
            <p style={{ fontWeight: 700, color: '#4338ca', marginBottom: 4 }}>
              Words you explored: {wordsLookedUp.length}
            </p>
            <p style={{ color: '#6366f1', fontSize: 13, margin: 0 }}>
              {wordsLookedUp.join(', ')}
            </p>
          </div>
        )}

        <button
          onClick={onNewStory}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={18} /> Read Another Story
        </button>
      </div>
    );
  }

  // --- Reader ---
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#1f2937' }}>
            {story.title}
          </h1>
          <span
            style={{
              background: '#f3f4f6',
              color: '#6b7280',
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 12,
            }}
          >
            {story.readingLevel}
          </span>
        </div>
        <button
          onClick={onNewStory}
          title="Choose another story"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: 4,
            flexShrink: 0,
          }}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Mode switcher */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          background: '#f3f4f6',
          borderRadius: 10,
          padding: 4,
        }}
      >
        {MODE_LABELS.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '8px 10px',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.15s',
              background: mode === value ? '#fff' : 'transparent',
              color: mode === value ? '#6366f1' : '#6b7280',
              boxShadow: mode === value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Audio controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          background: '#f8f9ff',
          borderRadius: 12,
          border: '1px solid #e0e7ff',
          marginBottom: 28,
        }}
      >
        <button
          onClick={playing ? handlePause : loadAndPlay}
          disabled={loadingAudio}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            cursor: loadingAudio ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {loadingAudio ? (
            <span style={{ fontSize: 11 }}>…</span>
          ) : playing ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}
        </button>
        <span style={{ fontSize: 13, color: '#6b7280', flex: 1 }}>
          {loadingAudio
            ? 'Preparing audio…'
            : playing
            ? 'Reading aloud…'
            : 'Press play to hear the story read aloud'}
        </span>
        <Volume2 size={16} color="#a5b4fc" />
      </div>

      {/* Story body */}
      <div
        style={{
          background: mode === 'supported' ? '#fffbeb' : '#fff',
          borderRadius: 16,
          padding: '32px',
          lineHeight: mode === 'supported' ? 2.2 : 1.9,
          fontSize: 18,
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          position: 'relative',
        }}
      >
        {/* Ruled lines for supported mode */}
        {mode === 'supported' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: 16,
              background:
                'repeating-linear-gradient(transparent, transparent 43px, #fde68a44 43px, #fde68a44 44px)',
            }}
          />
        )}

        {story.paragraphs.map((para, pIdx) => {
          // Word offset at start of this paragraph
          let paraOffset = 0;
          for (let p = 0; p < pIdx; p++) {
            story.paragraphs[p].sentences.forEach((s) => {
              paraOffset += s.split(/\s+/).filter(Boolean).length;
            });
          }

          return (
            <p key={pIdx} style={{ marginBottom: 20 }}>
              {para.sentences.map((sentence, sIdx) => {
                // Word offset at start of this sentence
                let sentOffset = paraOffset;
                for (let s = 0; s < sIdx; s++) {
                  sentOffset += para.sentences[s]
                    .split(/\s+/)
                    .filter(Boolean).length;
                }

                const sentWords = sentence.split(/\s+/).filter(Boolean);
                const sentEnd = sentOffset + sentWords.length - 1;

                // In guided mode, dim sentences that aren't the active one
                const isActiveSent =
                  activeSentence !== null &&
                  activeSentence !== undefined &&
                  activeSentence.pIdx === pIdx &&
                  activeSentence.sIdx === sIdx;
                const dimmed =
                  mode === 'guided' &&
                  currentWordIdx >= 0 &&
                  !isActiveSent;

                return (
                  <span
                    key={sIdx}
                    style={{
                      opacity: dimmed ? 0.25 : 1,
                      transition: 'opacity 0.25s',
                    }}
                  >
                    {sentWords.map((raw, wIdx) => {
                      const gIdx = sentOffset + wIdx;
                      const cleanW = raw
                        .replace(/[.,!?;:'"()]/g, '')
                        .toLowerCase();
                      const isActive = gIdx === currentWordIdx;
                      const isVocab =
                        mode !== 'clean' &&
                        (!!story.vocabDB?.[cleanW] ||
                          !!story.warmupWords.find(
                            (w) => w.word.toLowerCase() === cleanW,
                          ));

                      return (
                        <span
                          key={wIdx}
                          ref={(el) => {
                            if (el) wordEls.current.set(gIdx, el);
                          }}
                          onClick={() => isVocab && handleWordClick(cleanW)}
                          style={{
                            display: 'inline',
                            background: isActive ? '#fbbf24' : 'transparent',
                            borderRadius: isActive ? 3 : 0,
                            padding: isActive ? '1px 2px' : '0',
                            transition: 'background 0.12s',
                            cursor: isVocab ? 'pointer' : 'default',
                            borderBottom:
                              isVocab ? '2px dotted #6366f1' : 'none',
                          }}
                        >
                          {raw}{' '}
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>

      {/* Vocab popup */}
      {selectedWord && vocabEntry && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: 420,
            background: '#fff',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            border: '1px solid #e0e7ff',
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 8,
            }}
          >
            <div>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#1f2937' }}>
                {vocabEntry.word}
              </span>
              <span style={{ color: '#6366f1', fontSize: 14, marginLeft: 10 }}>
                {vocabEntry.phonetic}
              </span>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
              }}
            >
              <X size={18} />
            </button>
          </div>
          {vocabEntry.syllables.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 5,
                flexWrap: 'wrap',
                marginBottom: 10,
              }}
            >
              {vocabEntry.syllables.map((s, i) => (
                <span
                  key={i}
                  style={{
                    background: '#e0e7ff',
                    color: '#4338ca',
                    borderRadius: 5,
                    padding: '2px 8px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <p style={{ color: '#374151', fontSize: 15, margin: 0, lineHeight: 1.6 }}>
            {vocabEntry.definition}
          </p>
        </div>
      )}
    </div>
  );
}
