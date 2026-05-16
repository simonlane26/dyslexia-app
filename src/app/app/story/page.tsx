'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { StoryPicker } from '@/components/story-mode/StoryPicker';
import { VocabWarmup } from '@/components/story-mode/VocabWarmup';
import { StoryReader } from '@/components/story-mode/StoryReader';
import type { GeneratedStory } from '@/types/story';

type Phase = 'picker' | 'warmup' | 'reading';

export default function StoryPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('picker');
  const [story, setStory] = useState<GeneratedStory | null>(null);

  const isPro = useMemo(
    () => user?.publicMetadata?.isPro === true,
    [user?.publicMetadata],
  );

  if (isLoaded && !isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          color: '#6b7280',
        }}
      >
        Loading…
      </div>
    );
  }

  const handleStorySelected = (s: GeneratedStory) => {
    setStory(s);
    setPhase(s.warmupWords.length > 0 ? 'warmup' : 'reading');
  };

  const handleWarmupDone = () => setPhase('reading');

  const handleNewStory = () => {
    setStory(null);
    setPhase('picker');
  };

  if (phase === 'picker') {
    return <StoryPicker isPro={isPro} onSelect={handleStorySelected} />;
  }

  if (phase === 'warmup' && story) {
    return (
      <VocabWarmup
        words={story.warmupWords}
        storyTitle={story.title}
        onDone={handleWarmupDone}
      />
    );
  }

  if (phase === 'reading' && story) {
    return (
      <StoryReader
        story={story}
        isPro={isPro}
        onNewStory={handleNewStory}
      />
    );
  }

  return null;
}
