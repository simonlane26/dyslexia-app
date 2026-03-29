'use client';

import { useState } from 'react';
import { FileDown, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  font: string;
  fontSize: number;
  bgColour: string;
  darkMode: boolean;
  voiceId: string;
}

export function AccessibilityPassport({ font, fontSize, bgColour, darkMode, voiceId }: Props) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setGenerating(true);
    setDone(false);
    setError('');
    try {
      const res = await fetch('/api/passport/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ font, fontSize, bgColour, darkMode, voiceId }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as any).error || 'Failed to generate passport');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AccessibilityPassport-${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{
      background: darkMode ? '#1e1b2e' : '#F8F7FF',
      border: `1px solid ${darkMode ? '#4c1d95' : '#ddd6fe'}`,
      borderRadius: 12,
      padding: '20px 24px',
      marginTop: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <FileDown size={18} style={{ color: '#7c3aed' }} />
        <span style={{ fontWeight: 600, fontSize: 15, color: darkMode ? '#e9d5ff' : '#4c1d95' }}>
          Accessibility Passport
        </span>
      </div>
      <p style={{ fontSize: 13, color: darkMode ? '#c4b5fd' : '#6b7280', margin: '0 0 14px', lineHeight: 1.5 }}>
        Generate a personal Word document showing your accessibility settings and tool usage.
        Share it with a new manager or HR so they understand your needs from day one.
      </p>

      <button
        onClick={generate}
        disabled={generating}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 8, border: 'none',
          background: done ? '#059669' : '#7c3aed',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: generating ? 'not-allowed' : 'pointer',
          opacity: generating ? 0.7 : 1,
          transition: 'background 0.2s',
        }}
      >
        {generating
          ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
          : done
          ? <><CheckCircle size={15} /> Downloaded</>
          : <><FileDown size={15} /> Generate my passport</>
        }
      </button>

      {error && (
        <p style={{ fontSize: 13, color: '#dc2626', marginTop: 10 }}>{error}</p>
      )}

      <p style={{ fontSize: 11, color: darkMode ? '#7c3aed' : '#9ca3af', marginTop: 12, marginBottom: 0 }}>
        This document is yours. It is only shared with people you choose.
      </p>
    </div>
  );
}
