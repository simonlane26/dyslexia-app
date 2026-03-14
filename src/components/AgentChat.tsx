'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Bot, Lock, FileText, Mic, MicOff } from 'lucide-react';
import { ModernButton } from './ModernButton';

interface Theme {
  bg: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isDraft?: boolean;
}

interface AgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  isPro: boolean;
  theme: Theme;
  darkMode: boolean;
  onUpgradeClick: () => void;
  onInsertDraft: (text: string) => void;
}

export function AgentChat({
  isOpen,
  onClose,
  documentText,
  isPro,
  theme,
  darkMode,
  onUpgradeClick,
  onInsertDraft,
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [writingType, setWritingType] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [insertedIndex, setInsertedIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [nudge, setNudge] = useState<{ message: string; prefill?: string } | null>(null);
  const milestonesHit = useRef<Set<number>>(new Set());
  const longSentenceNudgeSent = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check mic support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setMicSupported(!!SpeechRecognition);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript) setInput(prev => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // Focus input so user can review/edit before sending
      setTimeout(() => inputRef.current?.focus(), 50);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Stop mic if panel closes
  useEffect(() => {
    if (!isOpen && isListening) stopListening();
  }, [isOpen, isListening, stopListening]);

  // Proactive nudges — watch the document for triggers
  useEffect(() => {
    if (!isOpen || !isPro) return;

    const words = documentText.trim() ? documentText.trim().split(/\s+/).length : 0;

    // 1) Word count milestones
    const milestones = [30, 75, 150];
    for (const m of milestones) {
      if (words >= m && !milestonesHit.current.has(m)) {
        milestonesHit.current.add(m);
        setNudge({
          message: `You've written ${m} words — great going! Want me to check if it makes sense so far?`,
          prefill: 'Can you check if my writing makes sense?',
        });
        return;
      }
    }

    // 2) Long sentence detection (first occurrence only)
    if (!longSentenceNudgeSent.current && documentText.trim()) {
      const sentences = documentText.split(/[.!?]+/).filter(s => s.trim());
      const hasLong = sentences.some(s => s.trim().split(/\s+/).length > 25);
      if (hasLong) {
        longSentenceNudgeSent.current = true;
        setNudge({
          message: 'One of your sentences is quite long. Want help splitting it into two?',
          prefill: 'Can you help me split a long sentence?',
        });
      }
    }
  }, [documentText, isOpen, isPro]);

  // 3) Idle nudge — no chat activity for 3 min while doc has content
  useEffect(() => {
    if (!isOpen || !isPro) return;
    const words = documentText.trim() ? documentText.trim().split(/\s+/).length : 0;
    if (words < 10) return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      // Only nudge if the panel is still open and no nudge is already showing
      setNudge(prev => prev ?? {
        message: 'How\'s the writing going? I\'m here if you get stuck.',
        prefill: 'I\'m not sure what to write next.',
      });
    }, 3 * 60 * 1000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isOpen, isPro]);

  // Reset nudge trackers on "start over"
  const resetNudges = () => {
    milestonesHit.current = new Set();
    longSentenceNudgeSent.current = false;
    setNudge(null);
  };

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Auto-focus input when opened (after type selected)
  useEffect(() => {
    if (isOpen && writingType) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, writingType]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, draftLoading]);

  async function getAgentResponse(history: Message[], type?: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText, chatHistory: history, writingType: type ?? writingType }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.error === 'PRO_REQUIRED'
            ? 'This feature requires a Pro account.'
            : 'Something went wrong. Try again.';
        setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Could not reach the server. Check your connection.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function selectWritingType(type: string) {
    setWritingType(type);
    setHasGreeted(true);
    // Send the type as the user's opening message
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const userMsg: Message = { role: 'user', content: `I'm writing a ${label}` };
    const history = [userMsg];
    setMessages(history);
    await getAgentResponse(history, type);
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    await getAgentResponse(newHistory);
  }

  async function handleWriteItUp() {
    if (draftLoading || loading) return;
    setDraftLoading(true);
    try {
      const res = await fetch('/api/agent/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: messages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Could not create a draft. Try again.' },
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.draft, isDraft: true },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Could not reach the server. Check your connection.' },
      ]);
    } finally {
      setDraftLoading(false);
    }
  }

  const panelBg = darkMode ? '#1e293b' : '#f8fafc';
  const panelText = darkMode ? '#f1f5f9' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const userBubbleBg = '#2563eb';
  const assistantBubbleBg = darkMode ? '#334155' : '#f1f5f9';
  const draftBubbleBg = darkMode ? '#1e3a5f' : '#eff6ff';
  const draftBorderColor = darkMode ? '#2563eb' : '#bfdbfe';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';

  // Show "Write this up" after 2 user messages, no draft yet, nothing loading
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const hasDraft = messages.some(m => m.isDraft);
  const showWriteItUp = userMessageCount >= 2 && !hasDraft && !loading && !draftLoading;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '92vw',
          backgroundColor: panelBg,
          borderLeft: `1px solid ${borderColor}`,
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '-4px 0 24px rgba(0,0,0,0.15)' : 'none',
          color: panelText,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.surface,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Writing Mentor</div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>Pro feature — your personal writing mentor</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: panelText,
              padding: '4px',
              borderRadius: '6px',
              opacity: 0.6,
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {!isPro ? (
          /* Locked state */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              textAlign: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: darkMode ? '#334155' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={28} color={darkMode ? '#94a3b8' : '#64748b'} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
                Writing Mentor is a Pro feature
              </div>
              <div style={{ fontSize: '14px', opacity: 0.7, lineHeight: 1.6, maxWidth: '300px' }}>
                Get your own personal writing mentor. It helps you start, get unstuck, and build
                confidence — one question at a time. No red marks. No jargon.
              </div>
            </div>
            <ModernButton variant="primary" onClick={onUpgradeClick} size="md">
              Upgrade to Pro
            </ModernButton>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Proactive nudge banner */}
              {nudge && (
                <div
                  style={{
                    borderRadius: '10px',
                    border: `1px solid ${darkMode ? '#7c3aed55' : '#ddd6fe'}`,
                    backgroundColor: darkMode ? '#2d1b69' : '#faf5ff',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontSize: '13px', lineHeight: 1.5, color: panelText }}>
                      ✨ {nudge.message}
                    </div>
                    <button
                      type="button"
                      onClick={() => setNudge(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: panelText, opacity: 0.4, flexShrink: 0, padding: '0 2px', fontSize: '14px', lineHeight: 1 }}
                      aria-label="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                  {nudge.prefill && (
                    <button
                      type="button"
                      onClick={() => {
                        setInput(nudge.prefill!);
                        setNudge(null);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      style={{
                        alignSelf: 'flex-start',
                        background: 'none',
                        border: `1px solid ${darkMode ? '#7c3aed' : '#8b5cf6'}`,
                        color: darkMode ? '#a78bfa' : '#7c3aed',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Yes, help me →
                    </button>
                  )}
                </div>
              )}

              {/* Format picker — shown before a writing type is chosen */}
              {!writingType && messages.length === 0 && !loading && (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', color: panelText }}>
                    What are you writing today?
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.6, marginBottom: '16px' }}>
                    Choose one and we'll make a start.
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { label: 'Email', icon: '✉️' },
                      { label: 'Essay', icon: '📝' },
                      { label: 'Work message', icon: '💼' },
                      { label: 'Social post', icon: '📱' },
                      { label: 'Story', icon: '📖' },
                      { label: 'Notes', icon: '🗒️' },
                      { label: 'Homework', icon: '🎒' },
                    ].map(({ label, icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => selectWritingType(label.toLowerCase())}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '20px',
                          border: `1px solid ${borderColor}`,
                          backgroundColor: darkMode ? '#334155' : '#ffffff',
                          color: panelText,
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'border-color 0.15s, background-color 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563eb';
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = darkMode ? '#1e3a5f' : '#eff6ff';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = borderColor;
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = darkMode ? '#334155' : '#ffffff';
                        }}
                      >
                        <span>{icon}</span> {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {writingType && messages.length === 0 && !loading && (
                <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '13px', marginTop: '40px' }}>
                  Starting up your writing assistant…
                </div>
              )}

              {messages.map((msg, i) =>
                msg.isDraft ? (
                  /* Draft card */
                  <div key={i} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '95%',
                        borderRadius: '12px',
                        border: `1px solid ${draftBorderColor}`,
                        backgroundColor: draftBubbleBg,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: '8px 12px',
                          borderBottom: `1px solid ${draftBorderColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#2563eb',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        <FileText size={12} />
                        Your draft
                      </div>
                      <div
                        style={{
                          padding: '12px',
                          fontSize: '14px',
                          lineHeight: 1.7,
                          color: panelText,
                        }}
                      >
                        {msg.content}
                      </div>
                      <div style={{ padding: '0 12px 12px' }}>
                        {insertedIndex === i ? (
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#16a34a',
                              padding: '6px 0',
                            }}
                          >
                            Added to your writing
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onInsertDraft(msg.content);
                              setInsertedIndex(i);
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 14px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              width: '100%',
                            }}
                          >
                            Add to my writing
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Normal bubble */
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        backgroundColor: msg.role === 'user' ? userBubbleBg : assistantBubbleBg,
                        color: msg.role === 'user' ? '#ffffff' : panelText,
                        fontSize: '14px',
                        lineHeight: 1.6,
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              )}

              {(loading || draftLoading) && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '16px 16px 16px 4px',
                      backgroundColor: assistantBubbleBg,
                      fontSize: '14px',
                      opacity: 0.6,
                    }}
                  >
                    {draftLoading ? 'Writing your draft…' : 'Thinking…'}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Write it up banner — appears after 2 user replies */}
            {showWriteItUp && (
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: `1px solid ${draftBorderColor}`,
                  backgroundColor: draftBubbleBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '13px', lineHeight: 1.4, opacity: 0.85 }}>
                  Ready to turn your ideas into a paragraph?
                </div>
                <button
                  type="button"
                  onClick={handleWriteItUp}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Write it up
                </button>
              </div>
            )}

            {/* Reset conversation */}
            {messages.length > 0 && (
              <div style={{ padding: '4px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setWritingType(null);
                    setHasGreeted(false);
                    setInsertedIndex(null);
                    resetNudges();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    opacity: 0.45,
                    cursor: 'pointer',
                    color: panelText,
                  }}
                >
                  Start over
                </button>
              </div>
            )}

            {/* Input */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: `1px solid ${borderColor}`,
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                flexShrink: 0,
                backgroundColor: theme.surface,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isListening ? 'Listening…' : 'Type or speak your reply…'}
                disabled={loading || draftLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${isListening ? '#ef4444' : borderColor}`,
                  backgroundColor: inputBg,
                  color: panelText,
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
              />
              {micSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={loading || draftLoading}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isListening ? '#ef4444' : (darkMode ? '#334155' : '#e2e8f0'),
                    color: isListening ? 'white' : panelText,
                    cursor: loading || draftLoading ? 'not-allowed' : 'pointer',
                    opacity: loading || draftLoading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background-color 0.2s',
                  }}
                  aria-label={isListening ? 'Stop listening' : 'Speak your reply'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || draftLoading || !input.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  cursor: loading || draftLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || draftLoading || !input.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
