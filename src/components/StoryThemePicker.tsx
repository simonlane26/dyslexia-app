'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, PenLine } from 'lucide-react';
import { STORY_THEMES, LEVEL_CONFIG, type ReadingLevel } from '@/lib/storyLevels';

interface Props {
  onGenerate: (params: {
    theme: string;
    characterName: string;
    customDetails: string;
    readingLevel: ReadingLevel;
  }) => void;
  loading: boolean;
}

export function StoryThemePicker({ onGenerate, loading }: Props) {
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [customTheme, setCustomTheme] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(2);

  const activeTheme = selectedTheme === 'custom' ? customTheme : selectedTheme;
  const canGenerate = activeTheme.trim().length > 0 && !loading;

  function handleSubmit() {
    if (!canGenerate) return;
    onGenerate({
      theme: activeTheme.trim(),
      characterName: characterName.trim() || 'the hero',
      customDetails: customDetails.trim(),
      readingLevel,
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl">📖</div>
        <h1 className="text-2xl font-bold text-gray-900">
          What kind of story would you like tonight?
        </h1>
        <p className="text-gray-500 text-sm">Pick a theme, then we'll make it just for you</p>
      </div>

      {/* Theme image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STORY_THEMES.map(t => {
          const isSelected = selectedTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setSelectedTheme(t.id); setCustomTheme(''); }}
              className={`relative overflow-hidden rounded-2xl aspect-[4/3] border-3 transition-all
                ${isSelected
                  ? 'border-violet-500 ring-2 ring-violet-400 ring-offset-2 scale-[1.03] shadow-lg'
                  : 'border-transparent hover:scale-[1.02] hover:shadow-md'
                }`}
            >
              {/* Cover image */}
              <Image
                src={t.cover}
                alt={t.label}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 45vw, 30vw"
              />
              {/* Label overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5">
                <span className="text-white text-sm font-semibold drop-shadow">
                  {t.emoji} {t.label}
                </span>
              </div>
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center shadow">
                  <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}

        {/* My own idea tile */}
        <button
          type="button"
          onClick={() => setSelectedTheme('custom')}
          className={`relative overflow-hidden rounded-2xl aspect-[4/3] border-2 transition-all
            flex flex-col items-center justify-center gap-2
            ${selectedTheme === 'custom'
              ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-400 ring-offset-2 scale-[1.03] shadow-lg'
              : 'border-dashed border-gray-300 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/40 hover:scale-[1.02]'
            }`}
        >
          <PenLine size={28} className={selectedTheme === 'custom' ? 'text-violet-600' : 'text-gray-400'} />
          <span className={`text-sm font-semibold ${selectedTheme === 'custom' ? 'text-violet-700' : 'text-gray-500'}`}>
            My own idea
          </span>
        </button>
      </div>

      {/* Custom theme input */}
      {selectedTheme === 'custom' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tell me your idea
          </label>
          <input
            type="text"
            value={customTheme}
            onChange={e => setCustomTheme(e.target.value)}
            placeholder="e.g. a cat who becomes a chef"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-gray-800"
            autoFocus
          />
        </div>
      )}

      {/* Character name */}
      {selectedTheme && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            What's the main character's name?{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={characterName}
            onChange={e => setCharacterName(e.target.value)}
            placeholder="e.g. Biscuit, Max, Luna…"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-gray-800"
          />
        </div>
      )}

      {/* Reading level */}
      {selectedTheme && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Reading level</label>
          <div className="flex gap-2 flex-wrap">
            {([1, 2, 3, 4, 5] as ReadingLevel[]).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setReadingLevel(lvl)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border
                  ${readingLevel === lvl
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-violet-400'
                  }`}
              >
                {lvl} — {LEVEL_CONFIG[lvl].label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Level {readingLevel}: ~{LEVEL_CONFIG[readingLevel].targetWords} words,
            max {LEVEL_CONFIG[readingLevel].maxSentenceLength} words per sentence
          </p>
        </div>
      )}

      {/* Extra details */}
      {selectedTheme && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Anything else you'd like in the story?{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={customDetails}
            onChange={e => setCustomDetails(e.target.value)}
            placeholder="e.g. set it at the seaside, include a treasure chest…"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-gray-800 resize-none"
          />
        </div>
      )}

      {/* Generate button */}
      {selectedTheme && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canGenerate}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl
            bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400
            text-white font-semibold text-lg transition-all shadow-md hover:shadow-lg
            disabled:shadow-none disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="animate-spin">✨</span>
              Writing your story…
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Create my story
              <ArrowRight size={20} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
