export const LEVEL_CONFIG = {
  1: { targetWords: 300,  maxSentenceLength: 8,  label: 'Early reader',        wordsPerMinute: 60  },
  2: { targetWords: 450,  maxSentenceLength: 12, label: 'Growing reader',       wordsPerMinute: 80  },
  3: { targetWords: 600,  maxSentenceLength: 15, label: 'Building confidence',  wordsPerMinute: 100 },
  4: { targetWords: 800,  maxSentenceLength: 18, label: 'Getting stronger',     wordsPerMinute: 120 },
  5: { targetWords: 1000, maxSentenceLength: 22, label: 'Confident reader',     wordsPerMinute: 140 },
} as const;

export type ReadingLevel = keyof typeof LEVEL_CONFIG;

export const STORY_THEMES = [
  { id: 'animals',     label: 'Animals',           emoji: '🐾', cover: '/covers/categories/animals.svg'     },
  { id: 'space',       label: 'Space adventure',   emoji: '🚀', cover: '/covers/categories/space.svg'       },
  { id: 'magic',       label: 'Magic & wizards',   emoji: '✨', cover: '/covers/categories/magic.svg'       },
  { id: 'funny',       label: 'Funny',             emoji: '😄', cover: '/covers/categories/funny.svg'       },
  { id: 'pirates',     label: 'Pirates',           emoji: '🏴‍☠️', cover: '/covers/categories/pirates.svg'     },
  { id: 'dinosaurs',   label: 'Dinosaurs',         emoji: '🦕', cover: '/covers/categories/dinosaurs.svg'   },
  { id: 'superheroes', label: 'Superheroes',       emoji: '🦸', cover: '/covers/categories/superheroes.svg' },
  { id: 'underwater',  label: 'Underwater world',  emoji: '🐠', cover: '/covers/categories/underwater.svg'  },
  { id: 'dragons',     label: 'Dragons',           emoji: '🐉', cover: '/covers/categories/dragons.svg'     },
  { id: 'robots',      label: 'Robots',            emoji: '🤖', cover: '/covers/categories/robots.svg'      },
] as const;

// Map theme id → cover image for story cards
export const THEME_COVERS: Record<string, string> = Object.fromEntries(
  STORY_THEMES.map(t => [t.id, t.cover])
);
