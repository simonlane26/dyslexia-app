'use client';
import React, { useState } from 'react';

export default SimplifyButton;

interface SimplifyButtonProps {
  text: string;
  setSimplifiedText: (value: string) => void;
  isPro?: boolean;
  setCount?: (callback: (prev: number) => number) => void;
}

export function SimplifyButton({ text, setSimplifiedText, isPro = false, setCount }: SimplifyButtonProps) {
  const [loading, setLoading] = useState(false);

  const simplify = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/simplify', { method: 'POST', body: JSON.stringify({ text }) });
      const data = await res.json();
      
      if (data.simplifiedText) {
        setSimplifiedText(data.simplifiedText);
        if (!isPro && setCount) setCount(prev => prev + 1);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to simplify');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={simplify} disabled={loading}>
      {loading ? 'Simplifying...' : '✨ Simplify'}
    </button>
  );
}