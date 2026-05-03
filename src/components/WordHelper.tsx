'use client';

import { useEffect, useState } from 'react';
import { X, Volume2, BookOpen, Star } from 'lucide-react';

interface WordHelp {
  syllables: string[];
  phonetic: string;
  definition: string;
  example: string;
}

interface Props {
  word: string;
  context: string;
  readingLevel: number;
  voiceId?: string;
  sourceType?: 'story' | 'editor';
  onClose: () => void;
  onSaveWord?: (word: string) => void;
}

const SYLLABLE_COLOURS = [
  'bg-amber-200 text-amber-900',
  'bg-violet-200 text-violet-900',
  'bg-emerald-200 text-emerald-900',
  'bg-sky-200 text-sky-900',
];

export function WordHelper({ word, context, readingLevel, voiceId, sourceType = 'story', onClose, onSaveWord }: Props) {
  const [help, setHelp] = useState<WordHelp | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHelp(null);

    fetch('/api/stories/word-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, context, readingLevel }),
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setHelp(data);
      })
      .catch(() => {
        if (!cancelled) setHelp({
          syllables: [word],
          phonetic: word.toUpperCase(),
          definition: 'Could not load definition right now.',
          example: '',
        });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [word, context, readingLevel]);

  function speakWord() {
    fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: word, voiceId }),
    })
      .then(r => r.arrayBuffer())
      .then(buf => {
        const audio = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' })));
        audio.play();
      })
      .catch(console.error);
  }

  async function handleSave() {
    if (saved || saving) return;
    setSaving(true);
    try {
      await fetch('/api/vocabulary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          phonetic: help?.phonetic ?? null,
          syllables: help?.syllables ?? [],
          definition: help?.definition ?? null,
          example: help?.example ?? null,
          context,
          sourceType,
        }),
      });
      setSaved(true);
      onSaveWord?.(word);
    } catch {
      setSaved(true); // still mark as saved locally even if network fails
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Word + phonetic */}
        <div className="text-center space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Word Helper</p>
          <h2 className="text-3xl font-bold text-gray-900">{word}</h2>
          {help && (
            <p className="text-base text-gray-500 font-mono">{help.phonetic}</p>
          )}
        </div>

        {/* Syllables */}
        {help && (
          <div className="flex justify-center gap-2 flex-wrap">
            {help.syllables.map((syl, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-xl text-lg font-bold ${SYLLABLE_COLOURS[i % SYLLABLE_COLOURS.length]}`}
              >
                {syl}
              </span>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-3 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Definition */}
        {help && !loading && (
          <div className="bg-violet-50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-violet-700 font-semibold text-sm">
              <BookOpen size={16} />
              What it means
            </div>
            <p className="text-gray-800 text-base leading-relaxed">{help.definition}</p>
            {help.example && (
              <p className="text-gray-500 text-sm italic">"{help.example}"</p>
            )}
          </div>
        )}

        {/* In-context sentence */}
        {context && (
          <div className="text-sm text-gray-500 leading-relaxed px-1">
            <span className="font-medium text-gray-700">In the story: </span>
            {context.split(new RegExp(`(${word})`, 'i')).map((part, i) =>
              part.toLowerCase() === word.toLowerCase()
                ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5 not-italic font-medium">{part}</mark>
                : <span key={i}>{part}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={speakWord}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
          >
            <Volume2 size={16} />
            Hear it again
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saved || saving}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              font-medium text-sm transition-colors
              ${saved
                ? 'bg-amber-100 text-amber-700 cursor-default'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
          >
            <Star size={16} className={saved ? 'fill-amber-500' : ''} />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save word'}
          </button>
        </div>

        {/* Back to story */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700
            text-white font-semibold transition-colors"
        >
          Got it! Back to the story
        </button>
      </div>
    </div>
  );
}
