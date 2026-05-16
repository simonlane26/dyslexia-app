export interface WarmupWord {
  word: string;
  phonetic: string;
  syllables: string[];
  definition: string;
}

export interface StoryParagraph {
  sentences: string[];
  participateAfter?: {
    word: string;
    sentenceIndex: number;
  };
}

export interface GeneratedStory {
  id: string;
  title: string;
  theme: string;
  readingLevel: string;
  warmupWords: WarmupWord[];
  paragraphs: StoryParagraph[];
  vocabDB?: VocabDB;
  createdAt: string;
}

export interface LibraryStory {
  emoji: string;
  title: string;
  level: string;
  free: boolean;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface AudioData {
  audioUrl: string;
  timestamps: WordTimestamp[];
}

export interface VocabEntry {
  word: string;
  phonetic: string;
  syllables: string[];
  definition: string;
}

export interface VocabDB {
  [word: string]: VocabEntry;
}

export interface StoryProgress {
  storyId: string;
  wordsRead: number;
  totalWords: number;
  wordsParticipated: number;
  wordsLookedUp: string[];
  readingMode: 'supported' | 'guided' | 'clean';
  completedAt?: string;
  duration: number;
}

export type ReadingMode = 'supported' | 'guided' | 'clean';
export type StoryTheme = 'pirates' | 'space' | 'animals' | 'magic' | 'dinosaurs' | 'underwater';
export type ReadingLevel = 'easy' | 'medium' | 'harder';

export interface TrackedWord {
  element: HTMLSpanElement | null;
  word: string;
  sentenceIndex: number;
  paragraphIndex: number;
  globalIndex: number;
}

export interface TrackedSentence {
  element: HTMLSpanElement | null;
  paragraphIndex: number;
  text: string;
}
