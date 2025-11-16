// src/components/SentenceHighlighter.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';

interface SentenceHighlighterProps {
  text: string;
  currentSentenceIndex: number;
  theme: any;
  fontSize: number;
  fontFamily: string;
  editorTextColor: string;
  bgColor: string;
  darkMode: boolean;
  highContrast: boolean;
}

export function SentenceHighlighter({
  text,
  currentSentenceIndex,
  theme,
  fontSize,
  fontFamily,
  editorTextColor,
  bgColor,
  darkMode,
  highContrast,
}: SentenceHighlighterProps) {
  // Split text into sentences
  const sentences = useMemo(() => {
    if (!text) return [];
    // Split by sentence-ending punctuation followed by space or end of string
    const parts = text.split(/([.!?]+\s+|[.!?]+$)/);
    const result: string[] = [];

    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i] || '';
      const punctuation = parts[i + 1] || '';
      if (sentence.trim()) {
        result.push(sentence + punctuation);
      }
    }

    return result.length > 0 ? result : [text];
  }, [text]);

  if (!text) return null;

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: darkMode ? '#374151' : bgColor,
        borderRadius: '12px',
        border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        lineHeight: 1.8,
        color: editorTextColor,
        minHeight: '200px',
      }}
    >
      {sentences.map((sentence, index) => {
        const isHighlighted = index === currentSentenceIndex;

        return (
          <span
            key={index}
            style={{
              backgroundColor: isHighlighted
                ? darkMode
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'rgba(253, 224, 71, 0.5)'
                : 'transparent',
              padding: isHighlighted ? '4px 2px' : '0',
              borderRadius: isHighlighted ? '4px' : '0',
              transition: 'all 0.3s ease',
              display: 'inline',
              fontWeight: isHighlighted ? 600 : 400,
            }}
          >
            {sentence}
          </span>
        );
      })}
    </div>
  );
}
