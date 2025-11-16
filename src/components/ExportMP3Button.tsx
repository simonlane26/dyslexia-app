// src/components/ExportMP3Button.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ModernButton } from './ModernButton';
import { addExportRecord } from '@/lib/exportHistory';

interface ExportMP3ButtonProps {
  text: string;
  filename?: string;
  voiceId?: string;
  documentTitle?: string;
  documentId?: string;
}

export function ExportMP3Button({
  text,
  filename = 'reading.mp3',
  voiceId,
  documentTitle,
  documentId,
}: ExportMP3ButtonProps) {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return null;

  // TEMPORARY: Always enable for testing
  const isPro = true;
  /* (user?.publicMetadata as any)?.isPro === true ||
    (user?.unsafeMetadata as any)?.isPro === true; */

  const handleExport = async () => {
    if (!text?.trim()) {
      alert('No text to export.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(errBody || `TTS error (${res.status})`);
      }

      const blob = await res.blob();
      if (!blob.size) throw new Error('Empty audio');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Track export
      try {
        addExportRecord({
          documentId,
          documentTitle: documentTitle || 'Untitled Document',
          exportType: 'mp3',
          wordCount: text.trim().split(/\s+/).filter(w => w.length > 0).length,
          userId: user?.id,
        });
      } catch (error) {
        console.error('Failed to track export:', error);
      }
    } catch (e: any) {
      console.error('MP3 export error:', e);
      alert(e?.message || 'MP3 export failed');
    } finally {
      setLoading(false);
    }
  };

  return isPro ? (
    <ModernButton
      onClick={handleExport}
      disabled={loading}
      variant="secondary"
      size="sm"
    >
      {loading ? 'Generating…' : '🎵 MP3'}
    </ModernButton>
  ) : (
    <ModernButton
      onClick={() => alert('Upgrade to Pro to export as MP3!')}
      variant="secondary"
      size="sm"
      disabled
    >
      🎵 MP3 (Pro)
    </ModernButton>
  );
}


