'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

export type ReadingMode = 'clean' | 'guided' | 'supported';

const SYLLABLE_BG = ['#EEEDFE', '#E1F5EE', '#FAEEDA'];
const SYLLABLE_FG = ['#3C3489', '#085041', '#633806'];

const MODE_DOT: Record<ReadingMode, string> = {
  clean: '#1D9E75',
  guided: '#534AB7',
  supported: '#D85A30',
};
const MODE_LABEL: Record<ReadingMode, string> = {
  clean: 'Clean reading',
  guided: 'Guided reading',
  supported: 'Supported reading',
};

interface WordInfo {
  definition: string;
  phonetics: string;
  syllables: string[];
}

interface Props {
  text: string;
  documentTitle: string;
  mode: ReadingMode;
  onModeChange: (m: ReadingMode) => void;
  theme: any;
  fontSize: number;
  fontFamily: string;
  bgColor: string;
  editorTextColor: string;
  darkMode: boolean;
  highContrast: boolean;
  children: React.ReactNode; // rendered in clean mode
}

// Split text into paragraphs → sentences
function parseParagraphs(text: string): string[][] {
  return text
    .split('\n')
    .filter(p => p.trim())
    .map(para => {
      const sents = para.match(/[^.!?]*[.!?]+|[^.!?]+$/g) || [para];
      return sents.map(s => s.trim()).filter(Boolean);
    });
}

function getGlobalSentIdx(paragraphs: string[][], pIdx: number, sIdx: number): number {
  let n = 0;
  for (let i = 0; i < pIdx; i++) n += paragraphs[i].length;
  return n + sIdx;
}

function totalSents(paragraphs: string[][]): number {
  return paragraphs.reduce((a, p) => a + p.length, 0);
}

// Tokenise sentence into word/non-word parts
function tokenise(sentence: string): string[] {
  return sentence.split(/(\s+|[^a-zA-Z'-]+)/).filter(Boolean);
}

export function ReadingSupportPanel({
  text,
  documentTitle,
  mode,
  onModeChange,
  theme,
  fontSize,
  fontFamily,
  bgColor,
  editorTextColor,
  darkMode,
  highContrast,
  children,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [hoveredPara, setHoveredPara] = useState<number | null>(null);
  const [guideOverlay, setGuideOverlay] = useState<{ top: number; topH: number; botTop: number; botH: number } | null>(null);
  const [currentSentIdx, setCurrentSentIdx] = useState(-1);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [decodeWord, setDecodeWord] = useState<string | null>(null);
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [decodeLoading, setDecodeLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const rafFrameRef = useRef(0);
  const wordTimingsRef = useRef<{ startMs: number; endMs: number }[]>([]);
  const lastWordIdxRef = useRef(-1);
  const lastSentIdxRef = useRef(-1);
  const outerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoveredParaRef = useRef<number | null>(null);

  const paragraphs = useMemo(() => parseParagraphs(text), [text]);
  const total = useMemo(() => totalSents(paragraphs), [paragraphs]);

  // Map global word index → global sentence index (matches ElevenLabs word count)
  const wordSentMap = useMemo(() => {
    const map: number[] = [];
    let sentIdx = 0;
    for (const sents of paragraphs) {
      for (const sent of sents) {
        const words = tokenise(sent).filter(t => /^[a-zA-Z'-]+$/.test(t));
        for (let i = 0; i < words.length; i++) map.push(sentIdx);
        sentIdx++;
      }
    }
    return map;
  }, [paragraphs]);

  // Reset when mode changes
  useEffect(() => {
    stopAudio();
    setCurrentSentIdx(-1);
    setProgress(0);
    setTimeRemaining('');
    setDecodeWord(null);
    setWordInfo(null);
    setHoveredPara(null);
    setPanelOpen(false);
  }, [mode]);

  function stopAudio() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (sentTimerRef.current) { clearInterval(sentTimerRef.current); sentTimerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    wordTimingsRef.current = [];
    setAudioState('idle');
    setCurrentWordIdx(-1);
  }

  function startRafLoop(audio: HTMLAudioElement) {
    lastWordIdxRef.current = -1;
    lastSentIdxRef.current = -1;
    rafFrameRef.current = 0;

    function tick() {
      if (!audioRef.current || audio.paused || audio.ended) { rafRef.current = null; return; }
      const nowMs = audio.currentTime * 1000 + 80;
      const timings = wordTimingsRef.current;

      // Find active word — scan backwards for last word that has started
      let found = -1;
      for (let i = timings.length - 1; i >= 0; i--) {
        if (nowMs >= timings[i].startMs) { found = i; break; }
      }

      // Only setState when word/sentence actually changes — avoids re-render every frame
      if (found !== -1 && found !== lastWordIdxRef.current) {
        lastWordIdxRef.current = found;
        setCurrentWordIdx(found);
        const sentIdx = wordSentMap[found] ?? -1;
        if (sentIdx !== lastSentIdxRef.current) {
          lastSentIdxRef.current = sentIdx;
          setCurrentSentIdx(sentIdx);
        }
      }

      // Throttle progress/time to ~10fps — no need to re-render every frame
      rafFrameRef.current++;
      if (rafFrameRef.current % 6 === 0) {
        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        setProgress(pct);
        const rem = Math.max(0, (audio.duration || 0) - audio.currentTime);
        const m = Math.floor(rem / 60);
        const s = Math.floor(rem % 60);
        setTimeRemaining(`${m}:${s < 10 ? '0' : ''}${s}`);
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function handlePlayPause() {
    if (audioState === 'playing') {
      audioRef.current?.pause();
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setAudioState('paused');
      return;
    }
    if (audioState === 'paused' && audioRef.current) {
      audioRef.current.play();
      setAudioState('playing');
      startRafLoop(audioRef.current);
      return;
    }
    // Start fresh
    setAudioState('loading');
    setProgress(0);
    setCurrentSentIdx(0);
    setCurrentWordIdx(-1);
    try {
      const res = await fetch('/api/reading-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 10000) }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const data = await res.json();
      wordTimingsRef.current = data.wordTimings || [];
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        setAudioState('idle');
        setCurrentSentIdx(-1);
        setCurrentWordIdx(-1);
        setProgress(100);
      };
      audio.play();
      setAudioState('playing');
      startRafLoop(audio);
    } catch {
      // Fallback: timer-based karaoke if TTS fails
      startTimerKaraoke(0);
    }
  }

  function startTimerKaraoke(from: number) {
    setAudioState('playing');
    let idx = from;
    setCurrentSentIdx(idx);
    sentTimerRef.current = setInterval(() => {
      idx++;
      if (idx >= total) {
        clearInterval(sentTimerRef.current!);
        sentTimerRef.current = null;
        setAudioState('idle');
        setCurrentSentIdx(-1);
        setProgress(100);
        return;
      }
      setCurrentSentIdx(idx);
      setProgress((idx / total) * 100);
      const rem = Math.round((total - idx) * 2.2);
      setTimeRemaining(`${Math.floor(rem / 60)}:${rem % 60 < 10 ? '0' : ''}${rem % 60}`);
    }, 2200);
  }

  function computeGuide(pIdx: number | null) {
    if (pIdx === null || !outerRef.current || !bodyRef.current || !paraRefs.current[pIdx]) {
      setGuideOverlay(null); return;
    }
    const or = outerRef.current.getBoundingClientRect();
    const br = bodyRef.current.getBoundingClientRect();
    const pr = paraRefs.current[pIdx]!.getBoundingClientRect();
    const bodyTop = br.top - or.top;
    const bodyBot = br.bottom - or.top;
    const paraTop = pr.top - or.top;
    const paraBot = pr.bottom - or.top;
    setGuideOverlay({
      top: bodyTop,
      topH: Math.max(0, paraTop - bodyTop - 4),
      botTop: Math.min(paraBot + 4, bodyBot),
      botH: Math.max(0, bodyBot - paraBot - 4),
    });
  }

  function handleParaHover(pIdx: number | null) {
    hoveredParaRef.current = pIdx;
    setHoveredPara(pIdx);
    computeGuide(pIdx);
  }

  // Keep guide in sync while scrolling — re-run when mode changes so we
  // pick up bodyRef (it's null in clean mode on initial mount)
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => computeGuide(hoveredParaRef.current);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [mode]);

  async function handleWordTap(e: React.MouseEvent, word: string) {
    e.stopPropagation();
    const clean = word.replace(/[^a-zA-Z'-]/g, '');
    if (clean.length < 2) return;
    if (decodeWord === clean) { setDecodeWord(null); setWordInfo(null); return; }
    setDecodeWord(clean);
    setWordInfo(null);
    setDecodeLoading(true);
    try {
      const res = await fetch('/api/word-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: clean }),
      });
      if (res.ok) setWordInfo(await res.json());
    } catch {}
    setDecodeLoading(false);
  }

  const border = darkMode ? '#444' : highContrast ? '#000' : '#e0e0e0';

  const strip = (
    <div
      onClick={() => setPanelOpen(o => !o)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', cursor: 'pointer',
        background: panelOpen ? (darkMode ? '#222' : '#f8f8f5') : 'transparent',
        borderBottom: `1px solid ${panelOpen ? border : 'transparent'}`,
        transition: 'background 0.2s, border-color 0.2s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: MODE_DOT[mode], flexShrink: 0, transition: 'background 0.3s' }} />
        <span style={{ fontSize: 13, color: darkMode ? '#aaa' : '#666' }}>{documentTitle || 'Document'}</span>
        <span style={{ fontSize: 11, color: darkMode ? '#666' : '#bbb' }}>{MODE_LABEL[mode]}</span>
      </div>
      <span style={{
        fontSize: 10, color: darkMode ? '#555' : '#bbb',
        display: 'inline-block', transform: panelOpen ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.3s',
      }}>▼</span>
    </div>
  );

  const settingsPanel = (
    <div style={{
      maxHeight: panelOpen ? 180 : 0,
      overflow: 'hidden',
      transition: 'max-height 0.35s ease',
      borderBottom: panelOpen ? `1px solid ${border}` : '1px solid transparent',
    }}>
      <div style={{ padding: '12px 16px' }}>
        {/* Mode buttons */}
        <div style={{
          display: 'flex', gap: 3,
          background: darkMode ? '#2a2a2a' : '#f5f5f0',
          borderRadius: 8, padding: 3, marginBottom: 10,
        }}>
          {(['clean', 'guided', 'supported'] as ReadingMode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={(e) => { e.stopPropagation(); onModeChange(m); }}
              style={{
                flex: 1, padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                border: mode === m ? `1px solid ${border}` : '1px solid transparent',
                background: mode === m ? (darkMode ? '#333' : '#fff') : 'transparent',
                color: mode === m ? (darkMode ? '#e0e0e0' : '#1a1a1a') : (darkMode ? '#777' : '#999'),
                fontWeight: mode === m ? 500 : 400,
                fontSize: 12, textAlign: 'center', transition: 'all 0.2s',
              }}
            >
              <span style={{ display: 'block' }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </span>
              <span style={{ display: 'block', fontSize: 10, marginTop: 1, color: darkMode ? '#555' : '#bbb', fontWeight: 400 }}>
                {m === 'clean' ? 'Just the text' : m === 'guided' ? 'Visual support' : 'Full audio'}
              </span>
            </button>
          ))}
        </div>
        {/* Feature tags */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[
            { label: 'Dyslexia font', on: true },
            { label: 'Custom spacing', on: true },
            { label: 'Reading guide', on: mode === 'guided' || mode === 'supported' },
            { label: 'Hover highlight', on: mode === 'guided' },
            { label: 'Karaoke', on: mode === 'supported' },
            { label: 'Audio', on: mode === 'supported' },
            { label: 'Tap to decode', on: mode !== 'clean' },
          ].map(f => (
            <span key={f.label} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: f.on ? (darkMode ? 'rgba(15,110,86,0.2)' : '#E1F5EE') : (darkMode ? '#2a2a2a' : '#f5f5f0'),
              color: f.on ? (darkMode ? '#5DCAA5' : '#085041') : (darkMode ? '#555' : '#bbb'),
              opacity: f.on ? 1 : 0.5,
            }}>
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── CLEAN MODE: strip above existing editor ─────────────────────────────────
  if (mode === 'clean') {
    return (
      <div>
        <div style={{
          borderRadius: 8, border: `1px solid ${border}`,
          overflow: 'hidden', marginBottom: 8,
          background: darkMode ? '#1a1a1a' : '#fff',
        }}>
          {strip}
          {settingsPanel}
        </div>
        {children}
      </div>
    );
  }

  // ── GUIDED / SUPPORTED: unified reading card ────────────────────────────────
  return (
    <div ref={outerRef} style={{
      border: `1px solid ${border}`, borderRadius: 12,
      overflow: 'hidden', position: 'relative',
      background: darkMode ? '#1a1a1a' : '#fff',
    }}>
      {strip}
      {settingsPanel}

      {/* Guide overlays — outside scroll container so they stay in sync on scroll */}
      {mode === 'guided' && guideOverlay && (
        <>
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: guideOverlay.top,
            height: guideOverlay.topH,
            background: darkMode ? '#e0e0e0' : '#1a1a1a',
            opacity: 0.06, pointerEvents: 'none', zIndex: 2,
            transition: 'height 0.2s ease, top 0.2s ease',
          }} />
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: guideOverlay.botTop,
            height: guideOverlay.botH,
            background: darkMode ? '#e0e0e0' : '#1a1a1a',
            opacity: 0.06, pointerEvents: 'none', zIndex: 2,
            transition: 'height 0.2s ease, top 0.2s ease',
          }} />
        </>
      )}

      {/* Reading body */}
      <div
        ref={bodyRef}
        style={{
          padding: '24px 20px',
          paddingBottom: mode === 'supported' ? 80 : 24,
          minHeight: '60vh',
          maxHeight: '70vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >

        {/* Text paragraphs */}
        <div style={{ fontSize, lineHeight: 2.1, letterSpacing: '0.4px', wordSpacing: '4px', fontFamily, color: editorTextColor }}>
          {(() => {
            let wIdx = 0; // global word counter — aligns with wordTimingsRef indices
            return paragraphs.map((sentences, pIdx) => {
              const hasActive = sentences.some((_, sIdx) => getGlobalSentIdx(paragraphs, pIdx, sIdx) === currentSentIdx);
              const paraOpacity =
                mode === 'supported' && currentSentIdx >= 0 ? (hasActive ? 1 : 0.15)
                : mode === 'guided' && hoveredPara !== null ? (hoveredPara === pIdx ? 1 : 0.2)
                : 1;

              return (
                <div
                  key={pIdx}
                  ref={el => { paraRefs.current[pIdx] = el; }}
                  onMouseEnter={() => mode === 'guided' && handleParaHover(pIdx)}
                  onMouseLeave={() => mode === 'guided' && handleParaHover(null)}
                  style={{
                    marginBottom: 18, padding: '4px 6px', borderRadius: 4,
                    opacity: paraOpacity,
                    background: mode === 'guided' && hoveredPara === pIdx ? 'rgba(250,238,218,0.15)' : 'transparent',
                    transition: audioState === 'playing' ? 'opacity 0s' : 'all 0.4s',
                  }}
                >
                  {sentences.map((sent, sIdx) => {
                    const gIdx = getGlobalSentIdx(paragraphs, pIdx, sIdx);
                    const isActive = gIdx === currentSentIdx;

                    return (
                      <span
                        key={sIdx}
                        style={{
                          padding: '2px 4px', borderRadius: 3,
                          background: isActive ? '#FAEEDA' : 'transparent',
                          color: mode === 'supported' && currentSentIdx >= 0
                            ? (isActive ? (darkMode ? '#e0e0e0' : '#1a1a1a') : '#999')
                            : 'inherit',
                          transition: audioState === 'playing' ? 'none' : 'all 0.3s',
                        }}
                      >
                        {tokenise(sent).map((token, tIdx) => {
                          const isWord = /^[a-zA-Z'-]+$/.test(token);
                          if (!isWord) return <span key={tIdx}>{token}</span>;
                          const thisWIdx = wIdx++;
                          const isCurrentWord = mode === 'supported' && thisWIdx === currentWordIdx;
                          const isSpoken = mode === 'supported' && currentWordIdx >= 0 && thisWIdx < currentWordIdx;
                          return (
                            <span
                              key={tIdx}
                              onClick={(e) => handleWordTap(e, token)}
                              style={{
                                cursor: 'pointer',
                                borderBottom: '1.5px dotted #5DCAA5',
                                padding: '1px 1px',
                                borderRadius: 2,
                                background: isCurrentWord ? 'rgba(255,200,80,0.55)' : 'transparent',
                                opacity: isSpoken ? 0.45 : 1,
                                fontWeight: isCurrentWord ? 600 : 'inherit',
                                transition: audioState === 'playing' ? 'none' : 'background 0.1s, opacity 0.2s',
                              }}
                              onMouseEnter={e => { if (!isCurrentWord) (e.currentTarget as HTMLElement).style.background = 'rgba(93,202,165,0.12)'; }}
                              onMouseLeave={e => { if (!isCurrentWord) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                              {token}
                            </span>
                          );
                        })}
                      </span>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>

        {/* Decode panel */}
        {decodeWord && (
          <div style={{
            position: 'sticky', bottom: mode === 'supported' ? 56 : 8,
            background: darkMode ? '#2a2a2a' : '#fff',
            border: `1px solid ${border}`,
            borderRadius: 12, padding: 14,
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            zIndex: 10, marginTop: 16,
          }}>
            <button
              type="button"
              onClick={() => { setDecodeWord(null); setWordInfo(null); }}
              style={{ position: 'absolute', top: 10, right: 12, border: 'none', background: 'none', color: darkMode ? '#666' : '#999', cursor: 'pointer', fontSize: 14 }}
            >✕</button>
            <div style={{ fontSize: 18, fontWeight: 500, color: darkMode ? '#e0e0e0' : '#1a1a1a', marginBottom: 2 }}>
              {decodeWord}
            </div>
            {decodeLoading ? (
              <div style={{ fontSize: 13, color: darkMode ? '#555' : '#bbb', marginTop: 6 }}>Looking up…</div>
            ) : wordInfo ? (
              <>
                <div style={{ fontSize: 13, color: '#534AB7', marginBottom: 6 }}>{wordInfo.phonetics}</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  {wordInfo.syllables.map((syl, i) => (
                    <span key={i} style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                      background: SYLLABLE_BG[i % 3], color: SYLLABLE_FG[i % 3],
                    }}>
                      {syl}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: darkMode ? '#aaa' : '#666', lineHeight: 1.5 }}>
                  {wordInfo.definition}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Supported mode: time / FAB / progress */}
      {mode === 'supported' && (
        <>
          {timeRemaining && (
            <span style={{ position: 'absolute', bottom: 20, left: 16, fontSize: 11, color: darkMode ? '#555' : '#bbb', zIndex: 5, pointerEvents: 'none' }}>
              {timeRemaining}
            </span>
          )}
          <div
            onClick={handlePlayPause}
            role="button"
            aria-label={audioState === 'playing' ? 'Pause' : 'Play'}
            style={{
              position: 'absolute', bottom: 16, right: 16,
              width: 44, height: 44, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 14, zIndex: 5,
              border: `1px solid ${audioState === 'playing' ? '#1D9E75' : border}`,
              background: audioState === 'playing' ? '#1D9E75' : (darkMode ? '#2a2a2a' : '#fff'),
              color: audioState === 'playing' ? 'white' : (darkMode ? '#888' : '#888'),
              transition: 'all 0.2s', userSelect: 'none',
            }}
          >
            {audioState === 'loading' ? '…' : audioState === 'playing' ? '⏸' : '▶'}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: darkMode ? '#333' : '#f0f0f0' }}>
            <div style={{ height: '100%', background: '#1D9E75', borderRadius: '0 2px 0 0', width: `${progress}%`, transition: 'width 0.4s' }} />
          </div>
        </>
      )}
    </div>
  );
}
