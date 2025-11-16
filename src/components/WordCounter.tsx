// src/components/WordCounter.tsx
'use client';

import { useMemo } from 'react';
import { FileText, Type, Clock, BarChart3 } from 'lucide-react';

interface WordCounterProps {
  text: string;
  theme: any;
}

export function WordCounter({ text, theme }: WordCounterProps) {
  const stats = useMemo(() => {
    const trimmedText = text.trim();

    // Word count
    const words = trimmedText
      ? trimmedText.split(/\s+/).filter(word => word.length > 0)
      : [];
    const wordCount = words.length;

    // Character count
    const charCount = trimmedText.length;
    const charCountNoSpaces = trimmedText.replace(/\s/g, '').length;

    // Sentence count (rough estimate)
    const sentences = trimmedText
      ? trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0)
      : [];
    const sentenceCount = sentences.length;

    // Paragraph count
    const paragraphs = trimmedText
      ? trimmedText.split(/\n\n+/).filter(p => p.trim().length > 0)
      : [];
    const paragraphCount = paragraphs.length;

    // Reading time (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    const readingTime = readingTimeMinutes === 0
      ? '< 1 min'
      : readingTimeMinutes === 1
        ? '1 min'
        : `${readingTimeMinutes} min`;

    // Average word length
    const avgWordLength = wordCount > 0
      ? Math.round(words.reduce((sum, word) => sum + word.length, 0) / wordCount)
      : 0;

    return {
      wordCount,
      charCount,
      charCountNoSpaces,
      sentenceCount,
      paragraphCount,
      readingTime,
      avgWordLength,
    };
  }, [text]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Word Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Type size={16} style={{ color: theme.primary, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', color: theme.text, opacity: 0.6 }}>
            Words
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: theme.text }}>
            {stats.wordCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Character Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={16} style={{ color: theme.secondary, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', color: theme.text, opacity: 0.6 }}>
            Characters
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: theme.text }}>
            {stats.charCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Reading Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={16} style={{ color: theme.accent, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', color: theme.text, opacity: 0.6 }}>
            Read Time
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: theme.text }}>
            {stats.readingTime}
          </div>
        </div>
      </div>

      {/* Sentences */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart3 size={16} style={{ color: theme.success, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', color: theme.text, opacity: 0.6 }}>
            Sentences
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: theme.text }}>
            {stats.sentenceCount}
          </div>
        </div>
      </div>
    </div>
  );
}
