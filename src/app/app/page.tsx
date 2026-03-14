'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useUser, SignedOut, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Mic, MicOff, BookOpen, Sparkles, Trash2, Download, Play, FileText, Lock, Save, Highlighter, Undo2, Redo2, SpellCheck, Edit3, Eye,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { ModernButton } from '@/components/ModernButton';
import { UpgradeButton } from '@/components/UpgradeButton';
import { ExportPDFButton } from '@/components/ExportPDFButton';
import { ExportMP3Button } from '@/components/ExportMP3Button';
import { ExportDOCXButton } from '@/components/ExportDOCXButton';
import AuthDebug from '@/components/AuthDebug';
import dynamic from 'next/dynamic';
import type { OCRProps } from '@/components/OCRImport';
import CoachPanel from '@/components/CoachPanel';
import { DocumentManager } from '@/components/DocumentManager';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { WordCounter } from '@/components/WordCounter';
import { SentenceHighlighter } from '@/components/SentenceHighlighter';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { TextComparison } from '@/components/TextComparison';
import { useToast } from '@/components/ToastContainer';
import { useKeyboardShortcuts, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { GrammarCheck } from '@/components/GrammarCheck';
import { SentenceRewriteModal } from '@/components/SentenceRewriteModal';
import { CoachIntent } from '@/components/CoachIntentModal';
import { ReadingGuide } from '@/components/ReadingGuide';
import { FixedToolbar } from '@/components/FixedToolbar';
import { CoachDrawer } from '@/components/CoachDrawer';
import { AccessibilityDrawer } from '@/components/AccessibilityDrawer';
import { AgentChat } from '@/components/AgentChat';
import { useSchoolMode } from '@/hooks/useSchoolMode';
import { getCopy } from '@/lib/schoolCopy';
import {
  WelcomeScreen,
  StruggleSelection,
  AccessibilityQuickSetup,
  CoachIntroduction,
  SuccessCelebration,
} from '@/components/Onboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  saveLocalDocument,
  getCurrentDocumentId,
  setCurrentDocumentId,
  getLocalDocument,
  Document,
} from '@/lib/documentStorage';

const OCRImport = dynamic<OCRProps>(() => import('@/components/OCRImport'), { ssr: false });

function PageBody() {
  // Hydration fix - track if component is mounted
  const [mounted, setMounted] = useState(false);

  // Core state
  const [text, setText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Document management
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sentence highlighting
  const [highlightMode, setHighlightMode] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);

  // Grammar checking
  const [grammarCheckEnabled, setGrammarCheckEnabled] = useState(false);

  // Reading Guide
  const [readingGuideEnabled, setReadingGuideEnabled] = useState(false);
  const [readingGuideType, setReadingGuideType] = useState<'line' | 'sentence' | 'ruler'>('line');

  // Writing Coach Drawer
  const [coachPanelOpen, setCoachPanelOpen] = useState(false);

  // AI Writing Assistant
  const [agentOpen, setAgentOpen] = useState(false);
  const agentAutoOpenFired = useRef(false);
  const agentAutoOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Accessibility Drawer
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);

  // Sentence rewriting
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [currentIntentForRewrite, setCurrentIntentForRewrite] = useState<CoachIntent | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Undo/Redo history
  const [textHistory, setTextHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Reading progress tracker
  const [readingProgress, setReadingProgress] = useState(0); // percentage of text read
  const [lastReadPosition, setLastReadPosition] = useState(0); // character position

  // Usage/quota
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit] = useState(5);
  const [isPro, setIsPro] = useState(false);

  // Auto-open the assistant after 3 min of editor inactivity (Pro only, once per session)
  useEffect(() => {
    if (!isPro) return;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (words < 20 || agentOpen || agentAutoOpenFired.current) return;

    if (agentAutoOpenTimer.current) clearTimeout(agentAutoOpenTimer.current);
    agentAutoOpenTimer.current = setTimeout(() => {
      if (!agentAutoOpenFired.current && !agentOpen) {
        agentAutoOpenFired.current = true;
        setAgentOpen(true);
      }
    }, 3 * 60 * 1000);

    return () => {
      if (agentAutoOpenTimer.current) clearTimeout(agentAutoOpenTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, isPro]);

  // School session tracking (counts only, no content ever sent)
  const [sessionSimplifications, setSessionSimplifications] = useState(0);
  const sessionStartRef = useRef<number>(Date.now());

  // Welcome banner — shown once after onboarding completes
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // Floating rewrite popup
  const [floatingRewrite, setFloatingRewrite] = useState<{ x: number; y: number } | null>(null);

  // Active school assignment (shown to school users)
  const [activeAssignment, setActiveAssignment] = useState<{
    id: string;
    title: string;
    description: string | null;
    min_words: number;
    due_date: string | null;
  } | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState<string | null>(null);

  // Hooks
  const toast = useToast();
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const onboarding = useOnboarding();
  const schoolMode = useSchoolMode();
  const copy = getCopy(schoolMode.isSchoolMode);

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

  // Set mounted flag after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync isPro from Clerk
  useEffect(() => {
    if (!user) return;
    const pro =
      (user.publicMetadata as any)?.isPro === true ||
      (user.unsafeMetadata as any)?.isPro === true;
    setIsPro(pro);
  }, [user]);

  // Load settings (only after mounting to avoid hydration mismatch)
  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

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

  // ----- Document Management -----

  // Load current document on mount (only after hydration)
  useEffect(() => {
    if (!mounted) return;

    const savedDocId = getCurrentDocumentId();
    if (savedDocId) {
      const doc = getLocalDocument(savedDocId);
      if (doc) {
        setText(doc.content);
        setSimplifiedText(doc.simplifiedContent || '');
        setDocumentTitle(doc.title);
        setCurrentDocId(doc.id);
        setLastSaved(doc.updatedAt);
      }
    }
  }, [mounted]);

  // Auto-save every 10 seconds when text changes
  useEffect(() => {
    if (!text && !simplifiedText) return; // Don't save empty docs

    const timer = setTimeout(() => {
      saveDocument();
    }, 10000); // 10 second debounce

    return () => clearTimeout(timer);
  }, [text, simplifiedText, documentTitle]);

  // School session tracking — POST aggregate metrics every 60s (no content sent)
  useEffect(() => {
    if (!schoolMode.isSchoolMode || !schoolMode.schoolId) return;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (wordCount < 10) return; // Skip trivial sessions

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentLen = sentences.length > 0
      ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
      : 0;
    const durationMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000);

    const timer = setTimeout(() => {
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words_typed: wordCount,
          simplifications_used: sessionSimplifications,
          avg_sentence_length: Math.round(avgSentLen * 10) / 10,
          session_duration_minutes: durationMinutes,
        }),
      }).catch(() => {}); // Fire-and-forget
    }, 60_000);

    return () => clearTimeout(timer);
  }, [text, schoolMode.isSchoolMode, schoolMode.schoolId, sessionSimplifications]);

  // Fetch active assignment for school users
  useEffect(() => {
    if (!schoolMode.isSchoolMode || !schoolMode.schoolId) return;
    fetch('/api/school/assignments')
      .then((r) => r.json())
      .then((d) => {
        setActiveAssignment(d.assignment ?? null);
        setTeacherFeedback(d.feedback ?? null);
      })
      .catch(() => {});
  }, [schoolMode.isSchoolMode, schoolMode.schoolId]);

  const saveDocument = () => {
    if (!text.trim() && !simplifiedText.trim()) {
      toast.warning('Cannot save empty document');
      return;
    }

    setIsSaving(true);
    try {
      const doc = saveLocalDocument({
        id: currentDocId || undefined,
        title: documentTitle || 'Untitled Document',
        content: text,
        simplifiedContent: simplifiedText,
        userId: user?.id,
        readingProgress,
        lastReadPosition,
        lastReadAt: readingProgress > 0 ? Date.now() : undefined,
      });

      setCurrentDocId(doc.id);
      setCurrentDocumentId(doc.id);
      setLastSaved(doc.updatedAt);
      toast.success('Document saved');

      // Show first-save celebration if onboarding is complete
      if (onboarding.hasCompletedOnboarding && !localStorage.getItem('dyslexia-firstSaveCelebrated')) {
        localStorage.setItem('dyslexia-firstSaveCelebrated', 'true');
        onboarding.showFirstSaveCelebration();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const loadDocument = (doc: Document) => {
    setText(doc.content);
    setSimplifiedText(doc.simplifiedContent || '');
    setDocumentTitle(doc.title);
    setCurrentDocId(doc.id);
    setCurrentDocumentId(doc.id);
    setLastSaved(doc.updatedAt);
    setReadingProgress(doc.readingProgress || 0);
    setLastReadPosition(doc.lastReadPosition || 0);

    if (doc.readingProgress && doc.readingProgress > 0) {
      toast.success(`Loaded "${doc.title}" - ${Math.round(doc.readingProgress)}% read`);
    } else {
      toast.success(`Loaded "${doc.title}"`);
    }
  };

  const newDocument = () => {
    if (text.trim() || simplifiedText.trim()) {
      if (!confirm('Create new document? Unsaved changes will be lost.')) {
        return;
      }
    }
    setText('');
    setSimplifiedText('');
    setDocumentTitle('Untitled Document');
    setCurrentDocId(null);
    setCurrentDocumentId(null);
    setLastSaved(null);
    toast.info('New document created');
  };

  // ----- Keyboard Shortcuts -----

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      ctrl: true,
      description: 'Save document',
      action: () => saveDocument(),
    },
    {
      key: 's',
      ctrl: true,
      shift: true,
      description: 'Simplify text',
      action: () => simplifyText(),
    },
    {
      key: 'r',
      ctrl: true,
      shift: true,
      description: 'Read aloud',
      action: () => handleReadAloud(),
    },
    {
      key: 'd',
      ctrl: true,
      shift: true,
      description: 'Toggle dictation',
      action: () => (isListening ? stopDictation() : startDictation('en-GB')),
    },
    {
      key: 'p',
      ctrl: true,
      shift: true,
      description: 'Pause/Resume reading',
      action: () => (isPaused ? resumeReading({} as any) : pauseReading({} as any)),
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Clear all text',
      action: () => {
        if (confirm('Clear all text?')) {
          setText('');
          setSimplifiedText('');
        }
      },
    },
    {
      key: 'n',
      ctrl: true,
      description: 'New document',
      action: () => newDocument(),
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => {}, // Handled by KeyboardShortcutsHelp component
    },
    {
      key: 'z',
      ctrl: true,
      description: 'Undo',
      action: () => handleUndo(),
    },
    {
      key: 'y',
      ctrl: true,
      description: 'Redo',
      action: () => handleRedo(),
    },
  ];

  useKeyboardShortcuts(shortcuts);

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
      toast.error("Your browser doesn't support speech recognition.");
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
    if (!text.trim()) {
      toast.warning('No text to simplify. Please write something first.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), isSchoolMode: schoolMode.isSchoolMode }),
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
        if (schoolMode.isSchoolMode) {
          setSessionSimplifications((n) => n + 1);
        }
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
          toast.error(`TTS error: ${parsed.error}${parsed.providerStatus ? ` [${parsed.providerStatus}]` : ''}`);
        } else {
          toast.error(`TTS error ${res.status}: ${raw.slice(0, 200)}`);
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
        toast.error('Audio playback error');
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

  // Browser TTS with sentence highlighting
  const playWithBrowserVoice = (textToRead: string) => {
    if (!textToRead.trim()) return;
    const synth = window.speechSynthesis;
    if (!synth) {
      toast.error('Browser speech synthesis is not supported here.');
      return;
    }

    const mySession = ++playbackSessionRef.current;

    try { synth.cancel(); } catch {}
    try { synth.cancel(); } catch {}

    setIsReading(true);
    setIsPaused(false);
    isStoppingRef.current = false;
    currentEngineRef.current = 'browser';

    // Split into sentences if highlight mode is enabled
    if (highlightMode) {
      const sentences = textToRead.split(/([.!?]+\s+|[.!?]+$)/).reduce((acc: string[], part, i, arr) => {
        if (i % 2 === 0 && part.trim()) {
          const sentence = part + (arr[i + 1] || '');
          if (sentence.trim()) acc.push(sentence);
        }
        return acc;
      }, []);

      let currentSentence = 0;
      setCurrentSentenceIndex(0);

      const speakNextSentence = () => {
        if (currentSentence >= sentences.length || mySession !== playbackSessionRef.current) {
          setIsReading(false);
          setIsPaused(false);
          setCurrentSentenceIndex(-1);
          currentEngineRef.current = null;
          utterRef.current = null;

          // Update reading progress when finished
          setReadingProgress(100);
          const charPosition = textToRead.length;
          setLastReadPosition(charPosition);
          return;
        }

        const u = new SpeechSynthesisUtterance(sentences[currentSentence]);
        utterRef.current = u;
        setCurrentSentenceIndex(currentSentence);

        u.onend = () => {
          if (mySession !== playbackSessionRef.current) return;

          // Update reading progress
          const progress = Math.round(((currentSentence + 1) / sentences.length) * 100);
          setReadingProgress(progress);

          // Calculate character position
          const charPosition = sentences.slice(0, currentSentence + 1).join('').length;
          setLastReadPosition(charPosition);

          currentSentence++;
          setTimeout(() => speakNextSentence(), 100);
        };

        u.onerror = () => {
          if (isStoppingRef.current || mySession !== playbackSessionRef.current) return;
          setIsReading(false);
          setIsPaused(false);
          setCurrentSentenceIndex(-1);
          currentEngineRef.current = null;
          utterRef.current = null;
        };

        synth.speak(u);
      };

      speakNextSentence();
    } else {
      // Normal playback without highlighting
      const u = new SpeechSynthesisUtterance(textToRead);
      utterRef.current = u;

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
    }
  };

  // Prefer ElevenLabs for Pro, fallback to browser
  const handleReadAloud = async () => {
    const t = text.trim();
    if (!t) {
      toast.warning('No text to read.');
      return;
    }
    console.log('TTS path →', { isPro, voiceId, using: isPro && voiceId ? 'elevenlabs' : 'browser' });
    setIsPaused(false);
    if (isPro && voiceId) await playWithElevenLabs(t);
    else playWithBrowserVoice(t);
  };

  const handleReadAloudSimplified = async () => {
    const t = simplifiedText?.trim();
    if (!t) {
      toast.warning('No simplified text to read. Click "Simplify" first.');
      return;
    }
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
    setCurrentSentenceIndex(-1);
    currentEngineRef.current = null;
    isStoppingRef.current = false;
  };

  // Writing confidence indicator — rotating encouragement based on word count
  function getConfidenceMessage(count: number): string {
    if (count === 0) return '';
    // Seed from word-count tier so message is stable within a band but varies between sessions
    const tier = Math.floor(count / 25);
    if (count <= 25) {
      const msgs = [
        "Great start — you're writing ✨",
        "Every word counts 💪",
        "You've begun — that's the hardest part 👍",
        "Writing clarity: building nicely 🌱",
      ];
      return msgs[tier % msgs.length];
    }
    if (count <= 100) {
      const msgs = [
        "Writing clarity: improving 📈",
        "Clear and easy to follow 👍",
        "Your ideas are coming through ✨",
        "Getting clearer with every sentence 💪",
      ];
      return msgs[tier % msgs.length];
    }
    const msgs = [
      "Clear and easy to read 🌟",
      "Strong writing — well done 💪",
      "Writing clarity: really clear 👍",
      "Your writing is flowing well ✨",
    ];
    return msgs[tier % msgs.length];
  }

  // Show floating rewrite popup on textarea selection
  const handleTextareaMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (textarea.selectionStart === textarea.selectionEnd) {
      setFloatingRewrite(null);
      return;
    }
    setFloatingRewrite({ x: e.clientX, y: e.clientY });
  };

  const triggerFloatingRewrite = () => {
    setFloatingRewrite(null);
    handleRewriteSentence();
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

  // Apply accessibility preset
  const applyPreset = (settings: {
    bgColor: string;
    font: string;
    fontSize: number;
    highContrast: boolean;
    darkMode: boolean;
  }) => {
    setBgColor(settings.bgColor);
    setFont(settings.font);
    setFontSize(settings.fontSize);
    setHighContrast(settings.highContrast);
    setDarkMode(settings.darkMode);
    toast.success('Preset applied successfully!');
  };

  // Load template
  const loadTemplate = (content: string) => {
    if (text.trim() && !confirm('Load template? Current text will be replaced.')) {
      return;
    }
    setText(content);
    toast.success('Template loaded!');
  };

  // Undo/Redo functions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setText(textHistory[newIndex]);
      toast.info('Undo');
    }
  };

  const handleRedo = () => {
    if (historyIndex < textHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setText(textHistory[newIndex]);
      toast.info('Redo');
    }
  };

  // Apply grammar fix
  const handleApplyGrammarFix = (offset: number, length: number, replacement: string) => {
    const before = text.substring(0, offset);
    const after = text.substring(offset + length);
    const newText = before + replacement + after;
    setText(newText);
    toast.success('Applied suggestion!');
  };

  // Handle rewrite sentence button
  const handleRewriteSentence = () => {
    // Try to get selection from textarea (normal mode)
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        const selected = text.substring(start, end).trim();
        if (selected) {
          setSelectedSentence(selected);
          setSelectedRange({ start, end });
          setShowRewriteModal(true);
          return;
        }
      }
    }

    // Try to get selection from window (works in all modes including Grammar Check)
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText) {
      toast.info('Select a sentence first to rewrite it!');
      return;
    }

    // Find the position of selected text in the full text
    const start = text.indexOf(selectedText);
    if (start === -1) {
      toast.error('Could not find selected text. Please try selecting again.');
      return;
    }

    const end = start + selectedText.length;

    setSelectedSentence(selectedText);
    setSelectedRange({ start, end });
    setShowRewriteModal(true);
  };

  // Apply rewritten sentence
  const handleApplyRewrite = (newSentence: string) => {
    if (!selectedRange) return;

    const before = text.substring(0, selectedRange.start);
    const after = text.substring(selectedRange.end);
    const newText = before + newSentence + after;
    setText(newText);
    toast.success('Applied rewrite!');

    // Clear selection
    setSelectedRange(null);
    setSelectedSentence('');
  };

  // Update history when text changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== textHistory[historyIndex]) {
        const newHistory = textHistory.slice(0, historyIndex + 1);
        newHistory.push(text);
        // Limit history to 50 entries
        if (newHistory.length > 50) {
          newHistory.shift();
        } else {
          setHistoryIndex(historyIndex + 1);
        }
        setTextHistory(newHistory);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [text]);

  // Detect first typing for celebration
  useEffect(() => {
    if (text.length > 15 && onboarding.hasCompletedOnboarding && !localStorage.getItem('dyslexia-firstTypeCelebrated')) {
      localStorage.setItem('dyslexia-firstTypeCelebrated', 'true');
      onboarding.showFirstTypeCelebration();
    }
  }, [text, onboarding]);

  // Show welcome banner once after onboarding completes
  useEffect(() => {
    if (onboarding.hasCompletedOnboarding && !localStorage.getItem('dw-welcome-banner-dismissed')) {
      setShowWelcomeBanner(true);
    }
  }, [onboarding.hasCompletedOnboarding]);

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
      {/* Fixed Toolbar */}
      <FixedToolbar
        isListening={isListening}
        onDictateToggle={() => (isListening ? stopDictation() : startDictation('en-GB'))}
        onReadAloud={handleReadAloud}
        onSimplify={simplifyText}
        loading={loading}
        onRewrite={handleRewriteSentence}
        readingGuideEnabled={readingGuideEnabled}
        onReadingGuideToggle={() => setReadingGuideEnabled(!readingGuideEnabled)}
        highlightMode={highlightMode}
        onHighlightToggle={() => setHighlightMode(!highlightMode)}
        grammarCheckEnabled={grammarCheckEnabled}
        onGrammarCheckToggle={() => setGrammarCheckEnabled(!grammarCheckEnabled)}
        isPro={isPro}
        onUpgradeClick={() => router.push('/pricing')}
        coachPanelOpen={coachPanelOpen}
        onCoachPanelToggle={() => setCoachPanelOpen(!coachPanelOpen)}
        agentOpen={agentOpen}
        onAgentToggle={() => setAgentOpen(!agentOpen)}
        accessibilityPanelOpen={accessibilityPanelOpen}
        onAccessibilityPanelToggle={() => setAccessibilityPanelOpen(!accessibilityPanelOpen)}
        isSaving={isSaving}
        onSave={saveDocument}
        lastSaved={lastSaved}
        text={text}
        documentTitle={documentTitle}
        onCompare={() => {
          // Will be handled by TextComparison component that we'll keep
        }}
        simplifiedText={simplifiedText}
        theme={theme}
        darkMode={darkMode}
        copy={copy}
        isSchoolMode={schoolMode.isSchoolMode}
      />

      {/* First-session welcome banner */}
      {showWelcomeBanner && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 20px',
          backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
          borderBottom: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)'}`,
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#c4b5fd' : '#6d28d9', fontWeight: 500 }}>
            ✏️ Start anywhere. There&apos;s no right way to write here.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowWelcomeBanner(false);
              localStorage.setItem('dw-welcome-banner-dismissed', '1');
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: darkMode ? '#a78bfa' : '#7c3aed',
              lineHeight: 1,
              padding: '0 4px',
              flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Today's Task banner — school users only */}
      {activeAssignment && (
        <div style={{
          padding: '14px 20px',
          backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.07)',
          borderBottom: `1px solid ${darkMode ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)'}`,
        }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: darkMode ? '#93c5fd' : '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Today&apos;s Task
                </span>
                {activeAssignment.due_date && (
                  <span style={{ fontSize: '11px', color: darkMode ? '#93c5fd' : '#3b82f6', opacity: 0.8 }}>
                    · Due {new Date(activeAssignment.due_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#bfdbfe' : '#1d4ed8' }}>
                {activeAssignment.title}
              </span>
              {activeAssignment.description && (
                <span style={{ fontSize: '13px', color: darkMode ? '#93c5fd' : '#3b82f6', marginLeft: '8px' }}>
                  — {activeAssignment.description}
                </span>
              )}
            </div>
            {activeAssignment.min_words > 0 && (
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: darkMode ? '#93c5fd' : '#2563eb',
                backgroundColor: darkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                padding: '3px 10px',
                borderRadius: '12px',
                flexShrink: 0,
                alignSelf: 'center',
              }}>
                Minimum {activeAssignment.min_words} words
              </span>
            )}
          </div>
        </div>
      )}

      {/* Teacher feedback note — shown to students when set */}
      {teacherFeedback && !schoolMode.isTeacher && (
        <div style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '10px 20px',
          backgroundColor: darkMode ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.06)',
          borderLeft: '3px solid #7c3aed',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: darkMode ? '#c4b5fd' : '#7c3aed', marginRight: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Teacher note
          </span>
          <span style={{ fontSize: '13px', color: darkMode ? '#e2d9f3' : '#4c1d95' }}>
            {teacherFeedback}
          </span>
        </div>
      )}

      <div className="max-w-6xl px-4 mx-auto" style={{ marginTop: '12px' }}>
      <Card className="mb-6">
        <div className="p-6">
          {/* Document Title */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label
                htmlFor="docTitle"
                className="text-sm font-medium"
                style={{ color: theme.text, opacity: 0.8 }}
              >
                Document Title
              </label>
              {currentDocId && (
                <span style={{ fontSize: '12px', color: theme.primary, fontWeight: 500 }}>
                  ✓ Editing existing document
                </span>
              )}
            </div>
            <input
              id="docTitle"
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Untitled Document"
              className="w-full p-3 transition-all duration-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: darkMode ? '#374151' : bgColor,
                fontFamily: getFontFamily(),
                fontSize: '16px',
                fontWeight: 600,
                color: editorTextColor,
                border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <label
              htmlFor="text"
              className="text-lg font-semibold"
              style={{ color: theme.text, margin: 0 }}
            >
              ✨ Your Writing
            </label>
            {getConfidenceMessage(text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0) && (
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                color: theme.primary,
                opacity: 0.85,
                letterSpacing: '0.01em',
              }}>
                {getConfidenceMessage(text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0)}
              </span>
            )}
          </div>

          {highlightMode && isReading ? (
            <SentenceHighlighter
              text={text}
              currentSentenceIndex={currentSentenceIndex}
              theme={theme}
              fontSize={fontSize}
              fontFamily={getFontFamily()}
              editorTextColor={editorTextColor}
              bgColor={bgColor}
              darkMode={darkMode}
              highContrast={highContrast}
            />
          ) : readingGuideEnabled ? (
            <ReadingGuide
              text={text}
              onTextChange={setText}
              theme={theme}
              fontSize={fontSize}
              fontFamily={getFontFamily()}
              bgColor={bgColor}
              editorTextColor={editorTextColor}
              darkMode={darkMode}
              highContrast={highContrast}
              guideType={readingGuideType}
            />
          ) : grammarCheckEnabled ? (
            <GrammarCheck
              text={text}
              onTextChange={setText}
              onApplyFix={handleApplyGrammarFix}
              enabled={grammarCheckEnabled}
              theme={theme}
              fontSize={fontSize}
              fontFamily={getFontFamily()}
              bgColor={bgColor}
              editorTextColor={editorTextColor}
              darkMode={darkMode}
              highContrast={highContrast}
              isSchoolMode={schoolMode.isSchoolMode}
            />
          ) : (
            <textarea
              ref={textareaRef}
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onMouseUp={handleTextareaMouseUp}
              onKeyUp={() => setFloatingRewrite(null)}
              placeholder="Start writing here..."
              className="w-full transition-all duration-200 resize-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: darkMode ? '#374151' : bgColor,
                fontFamily: getFontFamily(),
                fontSize: `${fontSize}px`,
                color: editorTextColor,
                caretColor: editorTextColor,
                border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
                minHeight: '60vh',
                maxHeight: '70vh',
                padding: '30px',
              }}
            />
          )}

          {/* Error display */}
          {error && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
            }}>
              <p style={{ color: '#991b1b', margin: 0, fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Sign up prompt for non-signed-in users */}
          <SignedOut>
            <div style={{ marginTop: '16px' }}>
              <SignInButton mode="modal">
                <ModernButton
                  variant="primary"
                  size="sm"
                >
                  🔑 Sign In to Save Your Work
                </ModernButton>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </Card>
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

      {/* Document Manager */}
      <DocumentManager
        onLoadDocument={loadDocument}
        onNewDocument={newDocument}
        currentDocId={currentDocId}
        theme={theme}
        agentOpen={agentOpen}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} theme={theme} />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial theme={theme} />

      {/* Sentence Rewrite Modal */}
      <SentenceRewriteModal
        isOpen={showRewriteModal}
        onClose={() => setShowRewriteModal(false)}
        selectedSentence={selectedSentence}
        onApply={handleApplyRewrite}
        theme={theme}
        darkMode={darkMode}
        intent={currentIntentForRewrite}
      />

      {/* Writing Coach Drawer */}
      <CoachDrawer
        isOpen={coachPanelOpen}
        onClose={() => setCoachPanelOpen(false)}
        sourceText={text}
        isPro={isPro}
        theme={theme}
        darkMode={darkMode}
        onApplySuggestion={(before, after) => {
          const updated = text.replace(before, after);
          setText(updated);
          toast.success('Applied suggestion!');
        }}
        copy={copy}
        isSchoolMode={schoolMode.isSchoolMode}
      />

      {/* AI Writing Assistant */}
      <AgentChat
        isOpen={agentOpen}
        onClose={() => setAgentOpen(false)}
        documentText={text}
        isPro={isPro}
        theme={theme}
        darkMode={darkMode}
        onUpgradeClick={() => router.push('/pricing')}
        onInsertDraft={(draft) => setText(prev => prev ? prev + '\n\n' + draft : draft)}
      />

      {/* Accessibility Drawer */}
      <AccessibilityDrawer
        isOpen={accessibilityPanelOpen}
        onClose={() => setAccessibilityPanelOpen(false)}
        isPro={isPro}
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
        text={text}
        onTextChange={setText}
        onApplyPreset={applyPreset}
        onSelectTemplate={loadTemplate}
        editorTextColor={editorTextColor}
      />

      <footer className="py-8 mt-16 text-sm text-center border-t border-slate-200 text-slate-500 dark:border-slate-800">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img
            src="/Incensu.jpg"
            alt="Approved Education Supplier"
            style={{ height: '80px', width: 'auto' }}
          />
        </div>
        <div className="mb-2">© 2025 Dyslexia Write Ltd. All rights reserved.</div>
        <div className="mb-2">
          "Dyslexia Write"
          <sup className="ml-0.5 align-super text-[0.7em]">™</sup> is a trademark of Dyslexia Write Ltd.
          All other trademarks are the property of their respective owners.
        </div>
        <div>
          <a href="/privacy" className="mx-2 hover:underline">Privacy Policy</a> |
          <a href="/terms" className="mx-2 hover:underline">Terms of Service</a> |
          <a href="/cookies" className="mx-2 hover:underline">Cookie Policy</a> |
          <a href="/accessibility" className="mx-2 hover:underline">Accessibility</a>
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

      {/* Floating Rewrite Popup — appears on text selection */}
      {floatingRewrite && (
        <>
          {/* Click-outside backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onMouseDown={() => setFloatingRewrite(null)}
          />
          <div
            style={{
              position: 'fixed',
              top: floatingRewrite.y - 52,
              left: floatingRewrite.x,
              transform: 'translateX(-50%)',
              zIndex: 100,
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              border: `1px solid ${darkMode ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.2)'}`,
              borderRadius: '12px',
              padding: '6px 10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: darkMode ? '#94a3b8' : '#94a3b8', marginRight: '2px', letterSpacing: '0.04em' }}>
              Rewrite as:
            </span>
            {(['Simpler', 'Clearer', 'More confident'] as const).map((label) => (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); triggerFloatingRewrite(); }}
                style={{
                  background: darkMode ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)',
                  border: `1px solid ${darkMode ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#c4b5fd' : '#7c3aed',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                {label}
              </button>
            ))}
            {!isPro && (
              <span style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#94a3b8', marginLeft: '4px' }}>⭐ Pro</span>
            )}
          </div>
        </>
      )}

      {/* Onboarding Screens */}
      {onboarding.currentStep === 'welcome' && (
        <WelcomeScreen
          onStartWriting={() => onboarding.goToNextStep()}
          onCustomizeSettings={() => {
            onboarding.goToNextStep();
            onboarding.goToNextStep(); // Skip struggle selection, go straight to accessibility
          }}
          theme={theme}
          darkMode={darkMode}
        />
      )}

      {onboarding.currentStep === 'struggles' && (
        <StruggleSelection
          onComplete={(selectedStruggles) => {
            onboarding.setStruggles(selectedStruggles);
            onboarding.goToNextStep();
          }}
          onSkip={() => onboarding.goToNextStep()}
          theme={theme}
          darkMode={darkMode}
        />
      )}

      {onboarding.currentStep === 'accessibility' && (
        <AccessibilityQuickSetup
          onComplete={(settings) => {
            // Apply the accessibility settings
            setBgColor(settings.bgColor);
            setFont(settings.font);
            setFontSize(settings.fontSize);
            onboarding.goToNextStep();
          }}
          theme={theme}
          darkMode={darkMode}
        />
      )}

      {onboarding.currentStep === 'coach' && (
        <CoachIntroduction
          onComplete={() => onboarding.skipToEnd()}
          theme={theme}
          darkMode={darkMode}
        />
      )}

      {/* Success Celebrations */}
      {onboarding.isShowingFirstTypeCelebration && (
        <SuccessCelebration
          type="first-type"
          onClose={() => onboarding.hideFirstTypeCelebration()}
          theme={theme}
          darkMode={darkMode}
        />
      )}

      {onboarding.isShowingFirstSaveCelebration && (
        <SuccessCelebration
          type="first-save"
          onClose={() => onboarding.hideFirstSaveCelebration()}
          theme={theme}
          darkMode={darkMode}
        />
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
