// src/hooks/useTextHistory.ts
import { useState, useCallback, useRef, useEffect } from 'react';

interface HistoryState {
  text: string;
  simplifiedText: string;
}

export function useTextHistory(initialText = '', initialSimplified = '') {
  const [history, setHistory] = useState<HistoryState[]>([
    { text: initialText, simplifiedText: initialSimplified },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState(initialText);
  const [simplifiedText, setSimplifiedText] = useState(initialSimplified);

  // Debounce timer for auto-saving to history
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const MAX_HISTORY = 50; // Keep last 50 states

  // Add current state to history (debounced)
  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      // Remove any states after current index (for branching edits)
      const newHistory = prev.slice(0, currentIndex + 1);

      // Add new state
      newHistory.push({ text, simplifiedText });

      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        setCurrentIndex((idx) => idx - 1);
      } else {
        setCurrentIndex(newHistory.length - 1);
      }

      return newHistory;
    });
  }, [text, simplifiedText, currentIndex]);

  // Debounced text update
  const updateText = useCallback((newText: string) => {
    setText(newText);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer to save to history after 1 second of inactivity
    debounceTimer.current = setTimeout(() => {
      saveToHistory();
    }, 1000);
  }, [saveToHistory]);

  // Immediate simplified text update (no debounce)
  const updateSimplifiedText = useCallback((newSimplified: string) => {
    setSimplifiedText(newSimplified);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Save immediately for simplified text
    setTimeout(() => {
      saveToHistory();
    }, 100);
  }, [saveToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setText(history[newIndex].text);
      setSimplifiedText(history[newIndex].simplifiedText);
      return true;
    }
    return false;
  }, [currentIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setText(history[newIndex].text);
      setSimplifiedText(history[newIndex].simplifiedText);
      return true;
    }
    return false;
  }, [currentIndex, history]);

  // Reset history with new text
  const resetHistory = useCallback((newText: string, newSimplified: string) => {
    setText(newText);
    setSimplifiedText(newSimplified);
    setHistory([{ text: newText, simplifiedText: newSimplified }]);
    setCurrentIndex(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    text,
    simplifiedText,
    updateText,
    updateSimplifiedText,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
