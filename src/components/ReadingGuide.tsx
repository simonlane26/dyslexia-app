'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ReadingGuideProps {
  text: string;
  onTextChange: (text: string) => void;
  theme: any;
  fontSize: number;
  fontFamily: string;
  bgColor: string;
  editorTextColor: string;
  darkMode: boolean;
  highContrast: boolean;
  guideType: 'line' | 'sentence' | 'ruler';
}

export function ReadingGuide({
  text,
  onTextChange,
  theme,
  fontSize,
  fontFamily,
  bgColor,
  editorTextColor,
  darkMode,
  highContrast,
  guideType,
}: ReadingGuideProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  // Split text into lines
  useEffect(() => {
    setLines(text.split('\n'));
  }, [text]);

  // Update cursor position and calculate current line/sentence
  const handleSelectionChange = () => {
    if (!textareaRef.current) return;

    const position = textareaRef.current.selectionStart;
    setCursorPosition(position);

    // Calculate current line
    const beforeCursor = text.substring(0, position);
    const lineIndex = beforeCursor.split('\n').length - 1;
    setCurrentLineIndex(lineIndex);

    // Calculate current sentence
    const sentences = text.split(/[.!?]+/);
    let charCount = 0;
    let sentenceIndex = 0;
    for (let i = 0; i < sentences.length; i++) {
      charCount += sentences[i].length + 1; // +1 for punctuation
      if (charCount > position) {
        sentenceIndex = i;
        break;
      }
    }
    setCurrentSentenceIndex(sentenceIndex);
  };

  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
    handleSelectionChange();
  };

  // Track cursor position
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener('click', handleSelectionChange);
    textarea.addEventListener('keyup', handleSelectionChange);
    textarea.addEventListener('focus', handleSelectionChange);

    return () => {
      textarea.removeEventListener('click', handleSelectionChange);
      textarea.removeEventListener('keyup', handleSelectionChange);
      textarea.removeEventListener('focus', handleSelectionChange);
    };
  }, [text]);

  // Render based on guide type
  if (guideType === 'line') {
    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'relative',
            border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Line-by-line rendering with focus effect */}
          {lines.map((line, index) => {
            const isCurrentLine = index === currentLineIndex;
            return (
              <div
                key={index}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isCurrentLine
                    ? darkMode
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'rgba(59, 130, 246, 0.1)'
                    : 'transparent',
                  opacity: isCurrentLine ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  color: editorTextColor,
                  lineHeight: 1.8,
                  minHeight: `${fontSize * 1.8 + 16}px`,
                  borderLeft: isCurrentLine
                    ? `4px solid ${theme.primary}`
                    : '4px solid transparent',
                }}
              >
                {line || '\u00A0'}
              </div>
            );
          })}

          {/* Invisible textarea overlay for input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            placeholder="Start writing... Each line will highlight as you type."
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'transparent',
              caretColor: editorTextColor,
              border: 'none',
              outline: 'none',
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: 1.8,
              resize: 'none',
              zIndex: 1,
            }}
          />
        </div>

        {/* Instruction */}
        <div
          style={{
            marginTop: '8px',
            fontSize: '13px',
            color: darkMode ? '#9ca3af' : '#6b7280',
            textAlign: 'center',
          }}
        >
          💡 Line Focus: Only your current line is highlighted. Other lines fade slightly.
        </div>
      </div>
    );
  }

  if (guideType === 'sentence') {
    // Split text into sentences
    const sentences = text.split(/([.!?]+)/);
    let charCount = 0;

    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'relative',
            border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '16px',
            minHeight: '400px',
            backgroundColor: darkMode ? '#374151' : bgColor,
          }}
        >
          {/* Sentence-by-sentence rendering */}
          <div
            style={{
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              color: editorTextColor,
              lineHeight: 1.8,
            }}
          >
            {sentences.map((part, index) => {
              const isCurrentSentence = index === currentSentenceIndex * 2; // Even indices are sentences
              const isPunctuation = index % 2 === 1;

              const startChar = charCount;
              charCount += part.length;

              return (
                <span
                  key={index}
                  style={{
                    backgroundColor: isCurrentSentence && !isPunctuation
                      ? darkMode
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(245, 158, 11, 0.15)'
                      : 'transparent',
                    opacity: isCurrentSentence || isPunctuation ? 1 : 0.4,
                    transition: 'all 0.2s ease',
                    padding: isCurrentSentence && !isPunctuation ? '2px 4px' : '0',
                    borderRadius: '4px',
                  }}
                >
                  {part}
                </span>
              );
            })}
          </div>

          {/* Invisible textarea overlay */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            placeholder="Start writing... Each sentence will spotlight as you type."
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              width: 'calc(100% - 32px)',
              height: 'calc(100% - 32px)',
              backgroundColor: 'transparent',
              color: 'transparent',
              caretColor: editorTextColor,
              border: 'none',
              outline: 'none',
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: 1.8,
              resize: 'none',
              zIndex: 1,
            }}
          />
        </div>

        {/* Instruction */}
        <div
          style={{
            marginTop: '8px',
            fontSize: '13px',
            color: darkMode ? '#9ca3af' : '#6b7280',
            textAlign: 'center',
          }}
        >
          💡 Sentence Spotlight: Only your current sentence is bright. Others fade.
        </div>
      </div>
    );
  }

  if (guideType === 'ruler') {
    return (
      <div style={{ position: 'relative' }}>
        {/* Ruler guide that follows cursor */}
        <div
          style={{
            position: 'relative',
            border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Horizontal ruler line */}
          <div
            style={{
              position: 'absolute',
              top: `${(currentLineIndex + 0.5) * (fontSize * 1.8 + 16)}px`,
              left: 0,
              right: 0,
              height: `${fontSize * 1.8 + 16}px`,
              backgroundColor: darkMode
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(34, 197, 94, 0.1)',
              borderTop: `2px solid ${theme.primary}`,
              borderBottom: `2px solid ${theme.primary}`,
              transition: 'top 0.15s ease',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            placeholder="Start writing... A reading ruler follows your cursor."
            style={{
              position: 'relative',
              width: '100%',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              color: editorTextColor,
              caretColor: editorTextColor,
              border: 'none',
              outline: 'none',
              lineHeight: 1.8,
              resize: 'none',
              minHeight: '400px',
              zIndex: 1,
            }}
          />
        </div>

        {/* Instruction */}
        <div
          style={{
            marginTop: '8px',
            fontSize: '13px',
            color: darkMode ? '#9ca3af' : '#6b7280',
            textAlign: 'center',
          }}
        >
          💡 Reading Ruler: A highlighted guide follows your cursor line.
        </div>
      </div>
    );
  }

  // Fallback: normal textarea
  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={handleChange}
      placeholder="Start writing..."
      style={{
        width: '100%',
        padding: '16px',
        backgroundColor: darkMode ? '#374151' : bgColor,
        fontFamily: fontFamily,
        fontSize: `${fontSize}px`,
        color: editorTextColor,
        caretColor: editorTextColor,
        border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
        borderRadius: '12px',
        outline: 'none',
        lineHeight: 1.8,
        resize: 'none',
        minHeight: '400px',
      }}
    />
  );
}
