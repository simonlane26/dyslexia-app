'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BookOpen, Plus, Clock, ChevronRight } from 'lucide-react';
import { StoryThemePicker } from '@/components/StoryThemePicker';
import { StoryReader } from '@/components/StoryReader';
import type { ReadingLevel } from '@/lib/storyLevels';
import { LEVEL_CONFIG, THEME_COVERS } from '@/lib/storyLevels';

type View =
  | { type: 'home' }
  | { type: 'picker' }
  | { type: 'generating' }
  | { type: 'reading'; seriesId: string; episodeId: string; episodeNumber: number; title: string; text: string; readingLevel: number; resumeFromWord?: number };

interface StorySummary {
  id: string;
  title: string;
  theme: string;
  character_name: string;
  reading_level: number;
  cover_url: string | null;
  last_read_at: string;
  story_episodes: {
    id: string;
    episode_number: number;
    word_count: number;
    last_word_index: number | null;
    completed_at: string | null;
  }[];
}

export default function StoriesPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [view, setView] = useState<View>({ type: 'home' });
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [generateError, setGenerateError] = useState('');
  // AI covers generated in background: seriesId → coverUrl
  const [aiCovers, setAiCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/stories')
      .then(r => r.json())
      .then(data => {
        const list: StorySummary[] = data.stories ?? [];
        setStories(list);
        // Background-generate covers for any stories that don't have one yet
        list.filter(s => !s.cover_url).forEach(s => generateCoverInBackground(s.id));
      })
      .catch(console.error)
      .finally(() => setLoadingStories(false));
  }, [isSignedIn]);

  function generateCoverInBackground(seriesId: string) {
    fetch(`/api/stories/${seriesId}/cover`, { method: 'POST' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.coverUrl) {
          setAiCovers(prev => ({ ...prev, [seriesId]: data.coverUrl }));
          setStories(prev => prev.map(s =>
            s.id === seriesId ? { ...s, cover_url: data.coverUrl } : s
          ));
        }
      })
      .catch(() => { /* silent — SVG cover remains */ });
  }

  async function handleGenerate(params: {
    theme: string;
    characterName: string;
    customDetails: string;
    readingLevel: ReadingLevel;
  }) {
    setView({ type: 'generating' });
    setGenerateError('');

    try {
      const res = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || 'Something went wrong. Please try again.');
        setView({ type: 'picker' });
        return;
      }

      setView({
        type: 'reading',
        seriesId: data.seriesId,
        episodeId: data.episodeId,
        episodeNumber: 1,
        title: data.title,
        text: data.text,
        readingLevel: params.readingLevel,
      });

      // Kick off AI cover generation in the background while the child reads
      generateCoverInBackground(data.seriesId);
    } catch {
      setGenerateError('Could not connect. Please check your internet and try again.');
      setView({ type: 'picker' });
    }
  }

  function handleComplete() {
    // After finishing a story, go back home and refresh the list
    fetch('/api/stories')
      .then(r => r.json())
      .then(data => setStories(data.stories ?? []))
      .catch(console.error);
    setView({ type: 'home' });
  }

  // --- GENERATING view ---
  if (view.type === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-amber-50 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="text-7xl animate-bounce">✨</div>
          <h2 className="text-2xl font-bold text-gray-800">Writing your story…</h2>
          <p className="text-gray-500 text-lg">This takes about 5 seconds</p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce [animation-delay:0s]" />
            <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce [animation-delay:0.15s]" />
            <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce [animation-delay:0.3s]" />
          </div>
        </div>
      </div>
    );
  }

  // --- READING view ---
  if (view.type === 'reading') {
    return (
      <StoryReader
        text={view.text}
        title={view.title}
        seriesId={view.seriesId}
        episodeId={view.episodeId}
        episodeNumber={view.episodeNumber}
        readingLevel={view.readingLevel}
        resumeFromWord={view.resumeFromWord}
        onComplete={handleComplete}
        onBack={() => setView({ type: 'home' })}
      />
    );
  }

  // --- PICKER view ---
  if (view.type === 'picker') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
        {generateError && (
          <div className="max-w-2xl mx-auto px-4 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {generateError}
            </div>
          </div>
        )}
        <StoryThemePicker onGenerate={handleGenerate} loading={false} />
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <button
            type="button"
            onClick={() => setView({ type: 'home' })}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // --- HOME view ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-violet-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Story Mode</h1>
              <p className="text-sm text-gray-500">Your reading adventures</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/app')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back to writing
          </button>
        </div>

        {/* Create new story CTA */}
        <button
          type="button"
          onClick={() => setView({ type: 'picker' })}
          className="w-full flex items-center gap-4 p-5 rounded-2xl
            bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600
            text-white shadow-lg hover:shadow-xl transition-all group"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
            <Plus size={24} />
          </div>
          <div className="text-left">
            <p className="font-bold text-lg">Create a new story</p>
            <p className="text-violet-200 text-sm">Pick a theme and we'll write it just for you</p>
          </div>
          <ChevronRight size={20} className="ml-auto opacity-70" />
        </button>

        {/* Recent stories */}
        {loadingStories ? (
          <div className="space-y-3">
            {[0, 1].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
              Your stories
            </h2>
            {stories.map(story => {
              const latestEp = story.story_episodes
                ?.sort((a, b) => b.episode_number - a.episode_number)[0];
              const progress = latestEp?.last_word_index && latestEp.word_count
                ? Math.round((latestEp.last_word_index / latestEp.word_count) * 100)
                : 0;
              const isComplete = !!latestEp?.completed_at;

              return (
                <button
                  type="button"
                  key={story.id}
                  onClick={async () => {
                    if (!latestEp) return;
                    const res = await fetch(`/api/stories/${story.id}/episode`);
                    const data = await res.json();
                    if (!res.ok || !data.episode) return;
                    setView({
                      type: 'reading',
                      seriesId: story.id,
                      episodeId: data.episode.id,
                      episodeNumber: data.episode.episode_number,
                      title: data.title,
                      text: data.episode.text,
                      readingLevel: data.readingLevel,
                      resumeFromWord: data.episode.last_word_index ?? 0,
                    });
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white
                    border border-gray-100 hover:border-violet-200 hover:shadow-md
                    transition-all text-left group"
                >
                  {/* Cover thumbnail — SVG base, AI cover fades in on top */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    {/* SVG base layer — always present */}
                    {THEME_COVERS[story.theme] ? (
                      <Image
                        src={THEME_COVERS[story.theme]}
                        alt={story.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {story.reading_level <= 2 ? '🌱' : story.reading_level <= 4 ? '📖' : '⭐'}
                      </div>
                    )}
                    {/* AI cover fades in on top once ready */}
                    {(story.cover_url || aiCovers[story.id]) && (
                      <Image
                        src={(story.cover_url || aiCovers[story.id])!}
                        alt={story.title}
                        fill
                        className="object-cover animate-fade-in"
                        sizes="64px"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{story.title}</p>
                    <p className="text-sm text-gray-500">
                      {story.character_name} · Level {story.reading_level} · {LEVEL_CONFIG[story.reading_level as ReadingLevel]?.label}
                    </p>
                    {!isComplete && progress > 0 && (
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-400 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    {isComplete && (
                      <p className="text-xs text-emerald-600 font-medium mt-1">✓ Finished</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 group-hover:text-violet-500 transition-colors shrink-0">
                    <Clock size={14} />
                    <span className="text-xs">{formatDate(story.last_read_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <div className="text-5xl">📚</div>
            <p className="text-gray-500">No stories yet.</p>
            <p className="text-sm text-gray-400">Create your first one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
