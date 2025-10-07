'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useUser, SignedOut, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Mic, MicOff, BookOpen, Sparkles, Trash2, Download, Play, FileText, Square, Pause, Lock,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { ModernButton } from '@/components/ModernButton';
import { SettingsPanel } from '@/components/SettingsPanel';
import { UpgradeButton } from '@/components/UpgradeButton';
import { ExportPDFButton } from '@/components/ExportPDFButton';
import { ExportMP3Button } from '@/components/ExportMP3Button';
import { ExportDOCXButton } from '@/components/ExportDOCXButton';
import AuthDebug from '@/components/AuthDebug';
import dynamic from 'next/dynamic';
import type { OCRProps } from '@/components/OCRImport';
import CoachPanel from '@/components/CoachPanel';

const OCRImport = dynamic<OCRProps>(() => import('@/components/OCRImport'), { ssr: false });

function PageBody() {
  // Core state
  const [text, setText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usage/quota
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit] = useState(5);
  const [isPro, setIsPro] = useState(false);

  // UI settings
  const [bgColor, setBgColor] = useState('#f9f7ed');
  const [font, setFont] = useState('Lexend');
  const [fontSize, setFontSize] = useState(18);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 🔊 Voice settings (chosen in SettingsPanel)
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM'); // ElevenLabs default

  // Playback refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentEngineRef = useRef<'elevenlabs' | 'browser' | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isStoppingRef = useRef(false);
  const currentObjectUrlRef = useRef<string | null>(null);
  const playbackSessionRef = useRef(0);

  // Dictation refs/state (continuous)
  const recRef = useRef<any>(null);
  const keepListeningRef = useRef(false);
  const interimRef = useRef<string>('');

  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Warm up TTS route
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/text-to-speech', { method: 'GET' });
        console.log('🔄 TTS warm-up:', res.status);
      } catch (err) {
        console.warn('⚠️ TTS warm-up failed:', err);
      }
    })();
  }, []);

  // Debug (optional)
  useEffect(() => { console.log('🔄 usageCount ->', usageCount); }, [usageCount]);
  useEffect(() => { console.log('🔄 isPro ->', isPro); }, [isPro]);
  useEffect(() => {
    console.log('🔍 user meta ->', {
      public: user?.publicMetadata,
      unsafe: user?.unsafeMetadata,
      id: user?.id,
    });
  }, [user]);

  // Sync isPro from Clerk
  useEffect(() => {
    if (!user) return;
    const pro =
      (user.publicMetadata as any)?.isPro === true ||
      (user.unsafeMetadata as any)?.isPro === true;
    setIsPro(pro);
  }, [user]);

  // Load settings
  useEffect(() => {
    const load = (key: string, def: any) => {
      try {
        const saved = localStorage.getItem(`dyslexia-${key}`);
        return saved ? JSON.parse(saved) : def;
      } catch {
        return def;
      }
    };
    setBgColor(load('bgColor', '#f9f7ed'));
    setFont(load('font', 'Lexend'));
    setFontSize(load('fontSize', 18));
    setHighContrast(load('highContrast', false));
    setDarkMode(load('darkMode', false));
    setVoiceId(load('voiceId', '21m00Tcm4TlvDq8ikWAM'));
  }, []);

  // Save settings
  useEffect(() => {
    const save = (key: string, value: any) =>
      localStorage.setItem(`dyslexia-${key}`, JSON.stringify(value));
    save('bgColor', bgColor);
    save('font', font);
    save('fontSize', fontSize);
    save('highContrast', highContrast);
    save('darkMode', darkMode);
    save('voiceId', voiceId);
  }, [bgColor, font, fontSize, highContrast, darkMode, voiceId]);

  // ----- Contrast helpers (WCAG) -----
  function hexToRgb(hex: string) {
    const h = hex.trim().replace('#', '');
    const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padStart(6, '0');
    const int = parseInt(v, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  }
  function srgbToLinear(c: number) {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }
  function relLuminance(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }
  function pickTextColor(bgHex: string) {
    const L = relLuminance(bgHex);
    const contrastBlack = (L + 0.05) / 0.05;
    const contrastWhite = 1.05 / (L + 0.05);
    return contrastBlack >= contrastWhite ? '#000000' : '#ffffff';
  }

  const theme = darkMode
    ? {
        bg: '#0f1629',
        text: '#ffffff',
        primary: '#3b82f6',
        secondary: '#6366f1',
        accent: '#8b5cf6',
        surface: 'rgba(30, 41, 59, 0.8)',
        border: '#334155',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      }
    : {
        bg: '#f8fafc',
        text: highContrast ? '#000000' : '#1e293b',
        primary: '#3b82f6',
        secondary: '#6366f1',
        accent: '#8b5cf6',
        surface: 'rgba(255, 255, 255, 0.8)',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      };

  const getFontFamily = () => {
    switch (font) {
      case 'Open Dyslexic':
        return `'Open Dyslexic', monospace`;
      case 'Lexend':
        return `'Lexend', sans-serif`;
      case 'Arial':
        return `'Arial', Helvetica, sans-serif`;
      case 'Verdana':
        return `'Verdana', Tahoma, sans-serif`;
      case 'Comic Sans':
        return `"Comic Sans MS", "Comic Sans", "Comic Neue", cursive, sans-serif`;
      default:
        return `'Lexend', sans-serif`;
    }
  };

  const editorTextColor = darkMode ? '#ffffff' : pickTextColor(bgColor);

  /* -------------------- Dictation (continuous) -------------------- */
  function startDictation(lang: string = 'en-GB') {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    try { recRef.current?.abort(); } catch {}
    try { recRef.current?.stop(); } catch {}

    const recognition = new SR();
    recRef.current = recognition;

    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    keepListeningRef.current = true;
    setIsListening(true);
    interimRef.current = '';

    recognition.onresult = (e: any) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const str = res[0]?.transcript ?? '';
        if (res.isFinal) finalChunk += str + ' ';
        else interimChunk += str;
      }
      if (finalChunk) {
        setText(prev => (prev ? prev + ' ' : '') + finalChunk.trim());
        interimRef.current = '';
      } else {
        interimRef.current = interimChunk;
      }
    };

    recognition.onerror = (e: any) => {
      console.warn('Speech error:', e.error);
      if (!keepListeningRef.current) return;
      setTimeout(() => {
        try { recognition.start(); } catch {}
      }, 200);
    };

    recognition.onend = () => {
      if (!keepListeningRef.current) {
        setIsListening(false);
        return;
      }
      setTimeout(() => {
        try { recognition.start(); }
        catch { startDictation(lang); }
      }, 200);
    };

    try { recognition.start(); } catch {}
  }

  function stopDictation() {
    keepListeningRef.current = false;
    setIsListening(false);
    try { recRef.current?.abort(); } catch {}
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
    interimRef.current = '';
  }

  /* -------------------- Simplify -------------------- */
  const simplifyText = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      alert('Please sign in to use Simplify.');
      router.push('/sign-in');
      return;
    }
    if (!text.trim()) {
      alert('No text to simplify. Please write something first.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      const hdrs = {
        status: res.status,
        statusText: res.statusText,
        'x-api-provider': res.headers.get('x-api-provider'),
        'x-key-present': res.headers.get('x-key-present'),
        'x-key-prefix': res.headers.get('x-key-prefix'),
        'x-key-len': res.headers.get('x-key-len'),
        'x-upstream-status': res.headers.get('x-upstream-status'),
        'x-upstream-ok': res.headers.get('x-upstream-ok'),
        'x-model': res.headers.get('x-model'),
        'x-pro': res.headers.get('x-pro'),
      };
      console.log('🔎 /api/simplify headers →', hdrs);

      const ct = res.headers.get('content-type') || '';
      const raw = await res.text();
      const payload = ct.includes('application/json')
        ? (() => { try { return JSON.parse(raw); } catch { return null; } })()
        : null;

      if (!res.ok) {
        console.error('❌ Simplify failed', hdrs, payload || raw);
        if (payload?.usage) setUsageCount(payload.usage.count ?? 0);
        setError(payload?.error || `Server error (${res.status}).`);
        setLoading(false);
        return;
      }

      const data = payload || {};
      if (data.simplifiedText) {
        setSimplifiedText(data.simplifiedText);
        if (data.usage) {
          setUsageCount(data.usage.count ?? 0);
          setIsPro(!!data.usage.isPro);
        }
      } else {
        setError('No text returned.');
      }
    } catch (e: any) {
      console.error('❌ Network error:', e);
      setError(`Network error: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- TTS logic -------------------- */
  
  // ElevenLabs
  const playWithElevenLabs = async (textToRead: string) => {
    if (!textToRead.trim()) return;

    const mySession = ++playbackSessionRef.current;

    setIsReading(true);
    setIsPaused(false);
    isStoppingRef.current = false;
    currentEngineRef.current = 'elevenlabs';

    try {
      let res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToRead.trim(),
          voiceId,
          __forcePro: process.env.NODE_ENV !== 'production',
        }),
      });

      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const hdrs = {
          status: res.status,
          statusText: res.statusText,
          'x-pro': res.headers.get('x-pro'),
          'x-voice-requested': res.headers.get('x-voice-requested'),
          'x-voice-used': res.headers.get('x-voice-used'),
          'x-model': res.headers.get('x-model'),
          'content-type': ct,
        };
        const raw = await res.text();
        let parsed: any = null;
        if (ct.includes('application/json')) {
          try { parsed = JSON.parse(raw); } catch {}
        }
        console.error('❌ TTS API error', hdrs, parsed || raw);
        if (parsed?.error) {
          alert(`TTS error: ${parsed.error}${parsed.providerStatus ? ` [${parsed.providerStatus}]` : ''}`);
        } else {
          alert(`TTS error ${res.status}: ${raw.slice(0, 200)}`);
        }
        setIsReading(false);
        setIsPaused(false);
        currentEngineRef.current = null;
        return;
      }

      if (mySession !== playbackSessionRef.current) return;

      const blob = await res.blob();
      if (mySession !== playbackSessionRef.current) return;
      if (blob.size === 0) {
        setIsReading(false);
        setIsPaused(false);
        currentEngineRef.current = null;
        return;
      }

      const url = URL.createObjectURL(blob);
      currentObjectUrlRef.current = url;

      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;

      audio.onended = null;
      audio.onerror = null;

      audio.src = url;
      audio.volume = 0.9;

      audio.onended = () => {
        if (mySession !== playbackSessionRef.current) return;
        if (currentObjectUrlRef.current) {
          URL.revokeObjectURL(currentObjectUrlRef.current);
          currentObjectUrlRef.current = null;
        }
        setIsReading(false);
        setIsPaused(false);
        currentEngineRef.current = null;
      };

      audio.onerror = () => {
        if (isStoppingRef.current || mySession !== playbackSessionRef.current) {
          if (currentObjectUrlRef.current) {
            URL.revokeObjectURL(currentObjectUrlRef.current);
            currentObjectUrlRef.current = null;
          }
          setIsReading(false);
          setIsPaused(false);
          currentEngineRef.current = null;
          return;
        }
        if (currentObjectUrlRef.current) {
          URL.revokeObjectURL(currentObjectUrlRef.current);
          currentObjectUrlRef.current = null;
        }
        setIsReading(false);
        setIsPaused(false);
        currentEngineRef.current = null;
        alert('Audio error');
      };

      await audio.play();
    } catch (e) {
      if (isStoppingRef.current) return;
      console.error('❌ ElevenLabs play error:', e);
      setIsReading(false);
      setIsPaused(false);
      currentEngineRef.current = null;
    }
  };

  // Browser TTS
  const playWithBrowserVoice = (textToRead: string) => {
    if (!textToRead.trim()) return;
    const synth = window.speechSynthesis;
    if (!synth) {
      alert('Browser speech synthesis is not supported here.');
      return;
    }

    const mySession = ++playbackSessionRef.current;

    try { synth.cancel(); } catch {}
    try { synth.cancel(); } catch {}

    const u = new SpeechSynthesisUtterance(textToRead);
    utterRef.current = u;

    setIsReading(true);
    setIsPaused(false);
    isStoppingRef.current = false;
    currentEngineRef.current = 'browser';

    u.onend = () => {
      if (mySession !== playbackSessionRef.current) return;
      setIsReading(false);
      setIsPaused(false);
      currentEngineRef.current = null;
      utterRef.current = null;
    };
    u.onerror = () => {
      if (isStoppingRef.current || mySession !== playbackSessionRef.current) return;
      setIsReading(false);
      setIsPaused(false);
      currentEngineRef.current = null;
      utterRef.current = null;
    };

    synth.speak(u);
  };

  // Prefer ElevenLabs for Pro, fallback to browser
  const handleReadAloud = async () => {
    const t = text.trim();
    if (!t) return alert('No text to read.');
    console.log('TTS path →', { isPro, voiceId, using: isPro && voiceId ? 'elevenlabs' : 'browser' });
    setIsPaused(false);
    if (isPro && voiceId) await playWithElevenLabs(t);
    else playWithBrowserVoice(t);
  };

  const handleReadAloudSimplified = async () => {
    const t = simplifiedText?.trim();
    if (!t) return alert('No simplified text to read. Click "Simplify" first.');
    console.log('TTS path →', { isPro, voiceId, using: isPro && voiceId ? 'elevenlabs' : 'browser' });
    setIsPaused(false);
    if (isPro && voiceId) await playWithElevenLabs(t);
    else playWithBrowserVoice(t);
  };

  // Pause / resume / stop
  const resumeReading = (e: any) => {
    e.preventDefault();
    if (!isReading || !isPaused) return;
    setIsPaused(false);
    if (currentEngineRef.current === 'elevenlabs' && audioRef.current) {
      audioRef.current.play();
    } else if (currentEngineRef.current === 'browser') {
      window.speechSynthesis.resume();
    }
  };

  const pauseReading = (e: any) => {
    e.preventDefault();
    if (!isReading) return;
    setIsPaused(true);
    if (currentEngineRef.current === 'elevenlabs' && audioRef.current) {
      audioRef.current.pause();
    } else if (currentEngineRef.current === 'browser') {
      window.speechSynthesis.pause();
    }
  };

  const stopReading = () => {
    if (!isReading && !isPaused) return;

    isStoppingRef.current = true;
    playbackSessionRef.current++;

    if (currentEngineRef.current === 'elevenlabs') {
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          audio.currentTime = 0;
          audio.removeAttribute('src');
          audio.load();
          if (currentObjectUrlRef.current) {
            URL.revokeObjectURL(currentObjectUrlRef.current);
            currentObjectUrlRef.current = null;
          }
        } catch {}
      }
    } else {
      const synth = window.speechSynthesis;
      try { synth.cancel(); } catch {}
      setTimeout(() => { try { synth.cancel(); } catch {} }, 0);
      utterRef.current = null;
    }

    setIsReading(false);
    setIsPaused(false);
    currentEngineRef.current = null;
    isStoppingRef.current = false;
  };

  const coachBg = darkMode ? '#374151' : bgColor;
  const coachText = editorTextColor;
  const coachBorder = darkMode ? '#6b7280' : (highContrast ? '#000000' : '#e5e7eb');

  // Global speak helper for CoachPanel
  useEffect(() => {
    (window as any).__dwSpeak = async (t: string) => {
      if (!t?.trim()) return;
      try {
        if (isPro) {
          await playWithElevenLabs(t);
        } else {
          playWithBrowserVoice(t);
        }
      } catch (e) {
        console.warn('speak failed:', e);
      }
    };
    return () => { delete (window as any).__dwSpeak; };
  }, [isPro, voiceId]);

  // Reset settings
  const resetSettings = () => {
    setBgColor('#f9f7ed');
    setFont('Lexend');
    setFontSize(18);
    setHighContrast(false);
    setDarkMode(false);
    setVoiceId('21m00Tcm4TlvDq8ikWAM');
  };

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #0f1629 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        fontFamily: getFontFamily(),
        fontSize: `${fontSize}px`,
        color: theme.text,
      }}
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Dyslexia Writer',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web',
            url: 'https://www.dyslexiawrite.com/',
            description:
              'Dyslexia-friendly writing app with dictation, text-to-speech, and one-tap simplification.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
          }),
        }}
      />

      <div className="max-w-4xl px-4 py-8 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-3 mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            <span
              aria-hidden
              style={{
                color: darkMode ? '#f9fafb' : '#1e293b',
                WebkitTextFillColor: darkMode ? '#f9fafb' : '#1e293b',
                backgroundImage: 'none',
                lineHeight: 1,
                display: 'inline-block',
              }}
            >
              ✍️
            </span>
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Dyslexia-Friendly Writing App
            </span>
          </h1>

          <p
            className="max-w-2xl mx-auto text-lg"
            style={{ color: darkMode ? '#cbd5e1' : '#64748b' }}
          >
            Write, simplify, and listen to your text with dyslexia-friendly tools
          </p>
        </div>

        <Suspense fallback={null}>
          <AuthDebug />
        </Suspense>

        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <UpgradeButton />
          </Suspense>
        </div>
      </div>

      <SettingsPanel
        bgColor={bgColor}
        setBgColor={setBgColor}
        font={font}
        setFont={setFont}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        voiceId={voiceId}
        setVoiceId={setVoiceId}
        resetSettings={resetSettings}
        theme={theme}
        getFontFamily={getFontFamily}
        isPro={isPro}
      />

      <Card className="mb-6">
        <div className="p-6">
          <label
            htmlFor="text"
            className="block mb-4 text-lg font-semibold"
            style={{ color: theme.text }}
          >
            ✨ Your Writing
          </label>

          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start writing here..."
            className="w-full h-48 p-4 transition-all duration-200 resize-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              backgroundColor: darkMode ? '#374151' : bgColor,
              fontFamily: getFontFamily(),
              fontSize: `${fontSize}px`,
              color: editorTextColor,
              caretColor: editorTextColor,
              border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
            }}
          />

          {!isPro && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                textAlign: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <span style={{ fontSize: '14px', color: theme.text, fontWeight: '500' }}>
                Simplifications today: {usageCount}/{usageLimit}
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 mt-4 border border-red-200 bg-red-50 rounded-xl">
              <p className="text-center text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6 md:grid-cols-4">
            <ModernButton
              onClick={() => (isListening ? stopDictation() : startDictation('en-GB'))}
              variant="secondary"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? 'Stop' : 'Dictate'}
            </ModernButton>

            <ModernButton variant="secondary" onClick={handleReadAloud}>
              <Play size={16} /> Read Aloud
            </ModernButton>

            <ModernButton
              onClick={simplifyText}
              disabled={loading || (!isPro && usageCount >= usageLimit)}
              variant="primary"
            >
              <Sparkles size={18} />
              {loading ? 'Simplifying...' : 'Simplify'}
            </ModernButton>

            <ModernButton variant="secondary" onClick={handleReadAloudSimplified}>
              <BookOpen size={16} /> Read Simplified
            </ModernButton>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <ModernButton
              onClick={() => {
                setText('');
                setSimplifiedText('');
              }}
              variant="danger"
              size="sm"
            >
              <Trash2 size={16} />
              Clear All
            </ModernButton>

            {isPro ? (
              <div className="flex flex-wrap gap-3">
                <ExportPDFButton text={text} simplifiedText={simplifiedText} />
                <ExportMP3Button text={simplifiedText?.trim() ? simplifiedText : text} />
                <ExportDOCXButton
                  text={text}
                  simplifiedText={simplifiedText}
                  bgColor={darkMode ? '#374151' : bgColor}
                  fontFamily={getFontFamily()}
                  fontSize={fontSize}
                  enabled={isSignedIn && isPro}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <ModernButton
                  onClick={() => alert('Upgrade to Pro to export as PDF!')}
                  variant="success"
                  className="text-gray-500 hover:text-gray-700 opacity-70"
                >
                  <Download size={16} /> Export PDF (Pro)
                </ModernButton>

                <ModernButton
                  onClick={() => alert('Upgrade to Pro to export as MP3!')}
                  className="text-white transition-all shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105"
                >
                  🎵 Export MP3 (Pro)
                </ModernButton>

                <ModernButton
                  onClick={() => alert('Upgrade to Pro to export to Word!')}
                  variant="secondary"
                  className="opacity-70"
                >
                  <FileText size={16} /> Export Word (Pro)
                </ModernButton>
              </div>
            )}

            {false && (
              <ModernButton
                variant="secondary"
                onClick={(e) => (isPaused ? resumeReading(e) : pauseReading(e))}
                disabled={!isReading}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume' : 'Pause'}
              </ModernButton>
            )}
            {false && (
              <ModernButton
                variant="secondary"
                onClick={stopReading}
                disabled={!isReading && !isPaused}
              >
                <Square size={16} /> Stop
              </ModernButton>
            )}

            <SignedOut>
              <div className="flex flex-wrap gap-3 mt-4">
                <SignInButton mode="modal">
                  <ModernButton
                    variant="secondary"
                    className="text-white transition-all shadow-md bg-gradient-to-r from-indigo-500 to-blue-500 hover:shadow-lg hover:scale-105"
                  >
                    🔑 Sign up for Basic Features
                  </ModernButton>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </Card>

      {/* Writing Coach — PRO gate */}
      <div className="max-w-4xl px-4 mx-auto">
        {isSignedIn ? (
          isPro ? (
            <CoachPanel
              sourceText={text}
              isPro={isPro}
              coachBg={coachBg}
              coachText={coachText}
              coachBorder={coachBorder}
            />
          ) : (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={18} />
                  <span className="font-semibold">Writing Coach (Pro)</span>
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  Writing Coach is available to Pro members. Unlock AI tips, structure, and guidance.
                </p>
                <ModernButton variant="primary" onClick={() => router.push('/pricing')}>
                  Upgrade to Pro
                </ModernButton>
              </div>
            </Card>
          )
        ) : (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={18} />
                <span className="font-semibold">Writing Coach</span>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Please sign in to use Writing Coach, then upgrade to Pro to unlock it.
              </p>
              <SignInButton mode="modal">
                <ModernButton variant="secondary">Sign in</ModernButton>
              </SignInButton>
            </div>
          </Card>
        )}
      </div>

      {/* OCR Import */}
      <div className="max-w-4xl px-4 mx-auto">
        <OCRImport
          onTextAction={(ocrText) => {
            setText((prev) => (prev ? prev + '\n\n' : '') + ocrText);
          }}
        />
      </div>

      {/* Simplified Text card */}
      {simplifiedText && (
        <div className="max-w-4xl px-4 mx-auto">
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: editorTextColor,
                  }}
                >
                  Simplified Text
                </h2>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: darkMode ? '#374151' : bgColor,
                  borderRadius: '12px',
                  border: `2px solid ${highContrast ? '#000000' : '#e9d5ff'}`,
                  fontSize: `${fontSize}px`,
                  fontFamily: getFontFamily(),
                  lineHeight: 1.6,
                  color: editorTextColor,
                }}
              >
                {simplifiedText}
              </div>
            </div>
          </Card>
        </div>
      )}

      <footer className="py-8 mt-16 text-sm text-center border-t border-slate-200 text-slate-500 dark:border-slate-800">
        <div className="mb-2">© 2025 Dyslexia Writer Ltd. All rights reserved.</div>
        <div className="mb-2">
          “Dyslexia Writer”
          <sup className="ml-0.5 align-super text-[0.7em]">™</sup> is a trademark of Dyslexia Writer Ltd.
          All other trademarks are the property of their respective owners.
        </div>
        <div>
          <a href="/privacy" className="mx-2 hover:underline">Privacy Policy</a> |
          <a href="/terms" className="mx-2 hover:underline">Terms of Service</a> |
          <a href="/cookies" className="mx-2 hover:underline">Cookie Policy</a>
        </div>
      </footer>

      {/* hidden element to safelist some Tailwind classes */}
      <div
        className="transition transform from-green-500 to-emerald-600 hover:scale-105"
        style={{ display: 'none' }}
      />

      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-blue-200 bg-blue-50 rounded-xl">
            <div className="w-5 h-5 border-b-2 border-blue-600 rounded-full animate-spin" />
            <span className="font-medium text-blue-700">Simplifying your text...</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Root page wrapper ===== */
export default function HomePage() {
  return (
    <Suspense fallback={<div className="max-w-4xl px-4 py-8 mx-auto">Loading…</div>}>
      <PageBody />
    </Suspense>
  );
}
