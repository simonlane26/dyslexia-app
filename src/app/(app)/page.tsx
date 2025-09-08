'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { Settings, Volume2, Mic, MicOff, BookOpen, Sparkles, Trash2, Download, Play } from 'lucide-react';
import { Card } from '@/components/Card';
import { ModernButton } from '@/components/ModernButton';
import { SettingsPanel } from '@/components/SettingsPanel';
import { UpgradeButton } from '@/components/UpgradeButton';
import { ExportPDFButton } from '@/components/ExportPDFButton';
import { ExportMP3Button } from '@/components/ExportMP3Button';
import AuthDebug from '@/components/AuthDebug';

export default function HomePage() {
  // Core state
  const [text, setText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usage/quota
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit] = useState(5);
  const [isPro, setIsPro] = useState(false); // ← React state for Pro

  // UI settings
  const [bgColor, setBgColor] = useState('#f9f7ed');
  const [font, setFont] = useState('Lexend');
  const [fontSize, setFontSize] = useState(18);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM');
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
 // 🔥 Add this here
  useEffect(() => {
    const warmUp = async () => {
      try {
        const res = await fetch("/api/text-to-speech", { method: "GET" });
        console.log("🔄 TTS warm-up:", res.status);
      } catch (err) {
        console.warn("⚠️ TTS warm-up failed:", err);
      }
    };
    warmUp();
  }, []);
  // Debug logs (optional)
  useEffect(() => {
    console.log('🔄 usageCount state changed to:', usageCount);
  }, [usageCount]);

  useEffect(() => {
    console.log('🔄 isPro state changed to:', isPro);
  }, [isPro]);

  useEffect(() => {
    console.log('🔍 User metadata debug:', {
      public: user?.publicMetadata,
      unsafe: user?.unsafeMetadata,
      id: user?.id,
    });
  }, [user]);
<AuthDebug />
  // ✅ TOP-LEVEL effect to sync isPro from Clerk user
  useEffect(() => {
    if (!user) return;
    const isPro =
      (user.publicMetadata as any)?.isPro === true ||
      (user.unsafeMetadata as any)?.isPro === true;
    setIsPro(isPro);
  }, [user]);

  // Settings load
  useEffect(() => {
    const load = (key: string, defaultValue: any) => {
      try {
        const saved = localStorage.getItem(`dyslexia-${key}`);
        return saved ? JSON.parse(saved) : defaultValue;
      } catch {
        return defaultValue;
      }
  
    };

    setBgColor(load('bgColor', '#f9f7ed'));
    setFont(load('font', 'Lexend'));
    setFontSize(load('fontSize', 18));
    setHighContrast(load('highContrast', false));
    setDarkMode(load('darkMode', false));
    setVoiceId(load('voiceId', '21m00Tcm4TlvDq8ikWAM'));
  }, []);

  // Settings save
  useEffect(() => {
    const save = (key: string, value: any) => {
      localStorage.setItem(`dyslexia-${key}`, JSON.stringify(value));
    };

    save('bgColor', bgColor);
    save('font', font);
    save('fontSize', fontSize);
    save('highContrast', highContrast);
    save('darkMode', darkMode);
    save('voiceId', voiceId);
  }, [bgColor, font, fontSize, highContrast, darkMode, voiceId]);

  // Helpers
  const isLightBackground = (color: string) => {
    const lightColors = ['#f9f7ed', '#f0f0f0', '#fff9db', '#eef4ff', '#fff0f5', '#ffffff'];
    return lightColors.includes(color);
  };

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
        return `'Arial', sans-serif`;
      case 'Verdana':
        return `'Verdana', sans-serif`;
      default:
        return `'Lexend', sans-serif`;
    }
  };

  // Dictation
  const handleDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => prev + ' ' + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      alert('Error: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Simplify
  const simplifyText = async () => {
  // ✅ use the top-level values, do not call hooks here
  if (!isLoaded) return; // wait for Clerk to hydrate

  if (!isSignedIn) {
    alert('Please sign in to use Simplify.');
    router.push('/sign-in');
    return;
  }

  if (!text.trim()) {
    alert("No text to simplify. Please write something first.");
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

      if (!res.ok) {
        try {
          const errorData = await res.json();
          console.log('❌ API Error:', errorData);

          if (errorData.usage) {
            console.log('📊 BEFORE update - usageCount:', usageCount);
            console.log('📊 Setting usageCount to:', errorData.usage.count);
            setUsageCount(errorData.usage.count);
            setTimeout(() => {
              console.log('📊 AFTER update - usageCount should be:', errorData.usage.count);
            }, 100);
          }

          setError(errorData.error || 'Simplification failed');
        } catch {
          setError(`Server error (${res.status}). Please try again.`);
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log('✅ Full API Response:', data);

      if (data.simplifiedText) {
        setSimplifiedText(data.simplifiedText);

        if (data.usage) {
          console.log('📊 Updating usage from API:', data.usage);
          setUsageCount(data.usage.count);
          setIsPro(!!data.usage.isPro);
        }
      }
    } catch (e: any) {
      console.error('❌ Network error:', e);
      setError(`Network error: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

// TTS: original text
const handleReadAloud = async () => {
  if (!text.trim()) {
    alert('No text to read.');
    return;
  }

  setIsReading(true);

  try {
    // First attempt
    let res = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), voiceId }),
    });

    // Retry once if common first-hit errors
    if (!res.ok && [401, 403, 408, 429, 500, 502, 503, 504].includes(res.status)) {
      console.warn(`⚠️ First TTS request failed (${res.status}), retrying...`);
      await new Promise((r) => setTimeout(r, 300)); // short delay
      res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), voiceId }),
      });
    }

    // Still failed after retry
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error:', errorText);
      alert(`API Error: ${res.status} - ${errorText}`);
      setIsReading(false);
      return;
    }

    // Success — handle audio
    const audioBlob = await res.blob();
    if (audioBlob.size === 0) {
      alert('Empty audio data received');
      setIsReading(false);
      return;
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      setIsReading(false);
    };

    audio.play().catch((err) => {
      console.error('❌ Play failed:', err);
      setIsReading(false);
      alert('Playback failed. Please try again.');
    });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    setIsReading(false);
    alert('Network error: ' + (err instanceof Error ? err.message : String(err)));
  }
};


  // TTS: simplified text
  const handleReadAloudSimplified = async () => {
    if (!simplifiedText || !simplifiedText.trim()) {
      alert('No simplified text to read. Click "Simplify" first.');
      return;
    }

    setIsReading(true);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: simplifiedText.trim(), voiceId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API Error:', errorText);
        alert(`API Error: ${res.status} - ${errorText}`);
        setIsReading(false);
        return;
      }

      const audioBlob = await res.blob();
      if (audioBlob.size === 0) {
        alert('Empty audio data received');
        setIsReading(false);
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;

      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        setIsReading(false);
      });
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audioUrl);
        setIsReading(false);
        alert('Audio error');
      });

      await audio.play();
    } catch (e: any) {
      console.error('❌ Simplified text error:', e);
      setIsReading(false);
      alert('Error playing simplified text: ' + (e?.message || 'Unknown error'));
    }
  };
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
      <div className="max-w-4xl px-4 py-8 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-3 mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
  {/* Solid emoji (forced color) */}
  <span
    aria-hidden
    style={{
      color: darkMode ? '#f9fafb' : '#1e293b',
      WebkitTextFillColor: darkMode ? '#f9fafb' : '#1e293b', // hard override for Safari/WebKit
      backgroundImage: 'none', // ensure no background-clip leaks
      lineHeight: 1,
      display: 'inline-block',
    }}
  >
    ✍️
  </span>

  {/* Gradient text ONLY on this span */}
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
      </div>

      <div className="flex items-center gap-3">
  <UpgradeButton />
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
              color: darkMode ? '#ffffff' : isLightBackground(bgColor) ? '#000000' : '#ffffff',
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
            <ModernButton onClick={handleDictation} disabled={isListening} variant="secondary">
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? 'Stop' : 'Dictate'}
            </ModernButton>

            <ModernButton variant="secondary" onClick={handleReadAloud}>
              <Play size={16} /> Read Aloud
            </ModernButton>

            <ModernButton
              onClick={simplifyText}
              disabled={loading || (!isPro && usageCount >= usageLimit)} // ✅ use usageCount
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
      {/* ✅ Pro user gets both buttons */}
      <ExportPDFButton text={text} simplifiedText={simplifiedText} />
      <ExportMP3Button text={simplifiedText?.trim() ? simplifiedText : text} />
    </div>
  ) : (
    <div className="flex flex-wrap gap-3">
      {/* ✅ Free user gets "upgrade" alerts */}
      <ModernButton
        onClick={() => alert("Upgrade to Pro to export as PDF!")}
        variant="success"
        className="text-gray-500 hover:text-gray-700 opacity-70"
      >
        <Download size={16} /> Export PDF (Pro)
      </ModernButton>

      <ModernButton
        onClick={() => alert("Upgrade to Pro to export as MP3!")}
        className="text-white transition-all shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105"
      >
        🎵 Export MP3 (Pro)
      </ModernButton>
    </div>
  )}

  {/* 🔒 Add Clerk gating for logged-out users */}
  <SignedOut>
    <div className="flex flex-wrap gap-3 mt-4">
      <SignInButton mode="modal">
        <ModernButton
          variant="secondary"
          className="text-white transition-all shadow-md bg-gradient-to-r from-indigo-500 to-blue-500 hover:shadow-lg hover:scale-105"
        >
          🔑 Sign in to export PDF/MP3
        </ModernButton>
      </SignInButton>
    </div>
  </SignedOut>
</div>
        </div>
      </Card>
<footer className="py-8 mt-16 text-sm text-center border-t border-slate-200 text-slate-500 dark:border-slate-800">
  <a href="/privacy" className="mx-2 hover:underline">Privacy Policy</a> |
  <a href="/terms" className="mx-2 hover:underline">Terms of Service</a> |
  <a href="/cookies" className="mx-2 hover:underline">Cookie Policy</a>
</footer>
      {/* Force Tailwind keep classes */}
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

      {simplifiedText && (
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Sparkles size={24} style={{ color: '#8b5cf6' }} />
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: darkMode ? '#ffffff' : isLightBackground(bgColor) ? '#000000' : '#ffffff',
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
                color: darkMode ? '#ffffff' : isLightBackground(bgColor) ? '#000000' : '#ffffff',
              }}
            >
              {simplifiedText}
            </div>
          </div>
        </Card>
              )}
    </div>
          );
}

