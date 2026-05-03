'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, SkipBack, ChevronLeft, BookOpen
} from 'lucide-react';
import { WordHelper } from './WordHelper';
import type { WordTiming } from '@/lib/supabase';

interface ParsedWord {
  text: string;
  wordIndex: number;
}

interface ParsedParagraph {
  type: 'text' | 'break';
  words?: ParsedWord[];
}

interface Props {
  text: string;
  title: string;
  seriesId: string;
  episodeId: string;
  episodeNumber: number;
  readingLevel: number;
  resumeFromWord?: number;
  onComplete?: () => void;
  onBack?: () => void;
}

// Save progress every N words
const AUTOSAVE_INTERVAL = 20;

function parseStoryText(text: string): { paragraphs: ParsedParagraph[]; totalWords: number } {
  let wordIndex = 0;
  const paragraphs: ParsedParagraph[] = [];

  for (const raw of text.split(/\n+/)) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === '---') {
      paragraphs.push({ type: 'break' });
      continue;
    }
    const words: ParsedWord[] = trimmed
      .split(/\s+/)
      .filter(Boolean)
      .map(w => ({ text: w, wordIndex: wordIndex++ }));
    paragraphs.push({ type: 'text', words });
  }

  return { paragraphs, totalWords: wordIndex };
}

function getSentenceContext(text: string, word: string): string {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
  const match = sentences.find(s => s.toLowerCase().includes(word.toLowerCase()));
  return match ? match.trim() : word;
}

export function StoryReader({
  text, title, seriesId, episodeId, episodeNumber,
  readingLevel, resumeFromWord = 0, onComplete, onBack,
}: Props) {
  const { paragraphs, totalWords } = parseStoryText(text);

  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(resumeFromWord);
  const [tappedWord, setTappedWord] = useState<{ text: string; context: string } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const lastSavedWord = useRef(resumeFromWord);

  // Load audio + timings
  useEffect(() => {
    setLoadingAudio(true);
    setAudioError(false);

    fetch('/api/stories/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.audioBase64 && data.wordTimings) {
          const blob = base64ToBlob(data.audioBase64, 'audio/mpeg');
          setAudioUrl(URL.createObjectURL(blob));
          setWordTimings(data.wordTimings);
        } else {
          setAudioError(true);
        }
      })
      .catch(() => setAudioError(true))
      .finally(() => setLoadingAudio(false));
  }, [text]);

  // Set audio start position when resuming
  useEffect(() => {
    if (!audioRef.current || !wordTimings.length || !resumeFromWord) return;
    const timing = wordTimings[resumeFromWord];
    if (timing) audioRef.current.currentTime = timing.startMs / 1000;
  }, [audioUrl, wordTimings, resumeFromWord]);

  // Karaoke RAF loop
  useEffect(() => {
    if (!wordTimings.length) return;

    function tick() {
      const audio = audioRef.current;
      if (!audio || !wordTimings.length) { rafRef.current = requestAnimationFrame(tick); return; }

      const currentMs = audio.currentTime * 1000;
      const idx = findActiveWord(wordTimings, currentMs);
      setActiveWordIndex(idx);

      // Auto-scroll the active word into view
      const el = wordRefs.current.get(idx);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Autosave progress periodically
      if (idx - lastSavedWord.current >= AUTOSAVE_INTERVAL) {
        lastSavedWord.current = idx;
        saveProgress(idx, false);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [wordTimings]);

  const saveProgress = useCallback(async (wordIndex: number, completed: boolean) => {
    try {
      await fetch(`/api/stories/${seriesId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastWordIndex: wordIndex, episodeNumber, completed }),
      });
    } catch { /* silent */ }
  }, [seriesId, episodeNumber]);

  function handleAudioEnd() {
    setPlaying(false);
    saveProgress(totalWords - 1, true);
    onComplete?.();
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setPlaying(p => !p);
  }

  function restart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setActiveWordIndex(0);
    audio.play().catch(console.error);
    setPlaying(true);
  }

  function handleWordTap(word: string, wordIdx: number) {
    // Pause reading when a word is tapped
    audioRef.current?.pause();
    setPlaying(false);
    setTappedWord({ text: word, context: getSentenceContext(text, word) });
  }

  function handleWordHelperClose() {
    setTappedWord(null);
    // Resume playback
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(console.error);
      setPlaying(true);
    }
  }

  const progress = totalWords > 0 ? Math.round((activeWordIndex / totalWords) * 100) : 0;

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            onClick={() => { saveProgress(activeWordIndex, false); onBack(); }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen size={16} className="text-violet-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-800 truncate">{title}</span>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-violet-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Story text */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        <div
          className="text-gray-800 select-none"
          style={{
            fontFamily: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
            fontSize: '1.15rem',
            lineHeight: '2.2',
            letterSpacing: '0.04em',
            wordSpacing: '0.15em',
          }}
        >
          {paragraphs.map((para, pi) => {
            if (para.type === 'break') {
              return <div key={pi} className="h-6" />;
            }
            return (
              <p key={pi} className="mb-5">
                {para.words!.map((w, wi) => (
                  <span key={wi}>
                    <span
                      ref={el => { if (el) wordRefs.current.set(w.wordIndex, el); }}
                      onClick={() => handleWordTap(w.text, w.wordIndex)}
                      className={`rounded px-0.5 cursor-pointer transition-colors duration-75
                        ${w.wordIndex === activeWordIndex
                          ? 'bg-amber-300 text-amber-900'
                          : w.wordIndex < activeWordIndex
                            ? 'text-gray-400'
                            : 'text-gray-800 hover:bg-violet-100'
                        }`}
                    >
                      {w.text}
                    </span>
                    {' '}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </div>

      {/* Audio controls */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          {loadingAudio ? (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              Preparing audio…
            </div>
          ) : audioError ? (
            <p className="text-sm text-gray-500">Audio unavailable — tap words to hear them.</p>
          ) : (
            <>
              <button
                onClick={restart}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                title="Restart"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center rounded-full
                  bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all"
              >
                {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>

              {/* Speed */}
              <div className="flex items-center gap-1 ml-auto">
                {[0.75, 1, 1.25].map(speed => (
                  <button
                    key={speed}
                    onClick={() => { if (audioRef.current) audioRef.current.playbackRate = speed; }}
                    className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    {speed}×
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleAudioEnd}
        />
      )}

      {/* Word helper modal */}
      {tappedWord && (
        <WordHelper
          word={tappedWord.text.replace(/[^a-zA-Z'-]/g, '')}
          context={tappedWord.context}
          readingLevel={readingLevel}
          sourceType="story"
          onClose={handleWordHelperClose}
        />
      )}
    </div>
  );
}

// --- Helpers ---

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

function findActiveWord(timings: WordTiming[], currentMs: number): number {
  if (!timings.length) return 0;
  let lo = 0, hi = timings.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (timings[mid].endMs < currentMs) lo = mid + 1;
    else if (timings[mid].startMs > currentMs) hi = mid - 1;
    else return mid;
  }
  return Math.min(lo, timings.length - 1);
}
