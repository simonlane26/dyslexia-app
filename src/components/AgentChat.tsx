'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Lock } from 'lucide-react';
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
}

interface AgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  isPro: boolean;
  theme: Theme;
  darkMode: boolean;
  onUpgradeClick: () => void;
}

export function AgentChat({
  isOpen,
  onClose,
  documentText,
  isPro,
  theme,
  darkMode,
  onUpgradeClick,
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-greet when opened for the first time this session
  useEffect(() => {
    if (isOpen && isPro && !hasGreeted) {
      setHasGreeted(true);
      getAgentResponse([]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPro]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function getAgentResponse(history: Message[]) {
    setLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText, chatHistory: history }),
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

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    await getAgentResponse(newHistory);
  }

  const panelBg = darkMode ? '#1e293b' : '#f8fafc';
  const panelText = darkMode ? '#f1f5f9' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const userBubbleBg = darkMode ? '#2563eb' : '#2563eb';
  const assistantBubbleBg = darkMode ? '#334155' : '#f1f5f9';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';

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
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Writing Assistant</div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>Pro feature — your personal writing guide</div>
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
                Writing Assistant is a Pro feature
              </div>
              <div style={{ fontSize: '14px', opacity: 0.7, lineHeight: 1.6, maxWidth: '300px' }}>
                Get your own personal writing guide. It helps you start, get unstuck, and build
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
              {messages.length === 0 && !loading && (
                <div
                  style={{
                    textAlign: 'center',
                    opacity: 0.4,
                    fontSize: '13px',
                    marginTop: '40px',
                  }}
                >
                  Starting up your writing assistant…
                </div>
              )}

              {messages.map((msg, i) => (
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
              ))}

              {loading && (
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
                    Thinking…
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reset conversation */}
            {messages.length > 0 && (
              <div style={{ padding: '4px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setHasGreeted(false);
                    getAgentResponse([]);
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
                placeholder="Type your reply…"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: inputBg,
                  color: panelText,
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.5 : 1,
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
