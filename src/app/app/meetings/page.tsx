'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Mic, Pause, Play, StopCircle, ClipboardList, BarChart2, Sparkles, Lightbulb, Mail } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface PrepItem {
  num: number;
  title: string;
  explanation: string;
  affects: boolean;
  questions: string[];
}

interface TranscriptItem {
  id: string;
  timestamp: string;
  simplified: string;
  raw: string;
  type: 'normal' | 'action' | 'decision';
  loading: boolean;
}

interface Action {
  task: string;
  deadline: string | null;
  context: string;
}

interface MeetingSummary {
  overview: string;
  decisions: string[];
  actions: Action[];
  emailSubject: string;
  emailBody: string;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg: '#FDF6E3', card: '#fff', text: '#2C2C2A', muted: '#888780', light: '#B4B2A9',
  border: '#E8E6DE',
  teal: '#1D9E75', tealLight: '#E1F5EE', tealDark: '#085041',
  purple: '#534AB7', purpleLight: '#EEEDFE', purpleDark: '#3C3489',
  amber: '#BA7517', amberLight: '#FAEEDA', amberDark: '#633806',
  coral: '#D85A30', coralLight: '#FAECE7',
  blue: '#378ADD', blueLight: '#E6F1FB',
};

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [isPro, setIsPro] = useState(false);
  const [tab, setTab] = useState<'prep' | 'live' | 'summary'>('prep');

  // Prep state
  const [agenda, setAgenda] = useState('');
  const [prepItems, setPrepItems] = useState<PrepItem[] | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState('');

  // Live state
  const [meetingState, setMeetingState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);
  const [interimText, setInterimText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);
  const meetingStateRef = useRef<'idle' | 'recording' | 'paused'>('idle');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Summary state
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [actionsDone, setActionsDone] = useState<Set<number>>(new Set());

  // ── Auth ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/sign-in'); return; }
    const pro = (user.publicMetadata as any)?.isPro === true ||
                (user.unsafeMetadata as any)?.isPro === true;
    setIsPro(pro);
  }, [isLoaded, user, router]);

  useEffect(() => {
    setSpeechSupported(!!(
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    ));
  }, []);

  // ── Prep ───────────────────────────────────────────────────────────────────

  async function runPrep() {
    if (!agenda.trim()) return;
    setPrepLoading(true);
    setPrepError('');
    setPrepItems(null);
    try {
      const res = await fetch('/api/meetings/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenda }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.items) setPrepItems(data.items);
      else setPrepError('Could not parse agenda — please try again.');
    } catch {
      setPrepError('Something went wrong. Check your connection and try again.');
    }
    setPrepLoading(false);
  }

  // ── Live ───────────────────────────────────────────────────────────────────

  const processSegment = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.length < 8) return;
    const id = Date.now().toString() + Math.random();
    const timestamp = formatTime(secondsRef.current);
    setTranscriptItems(prev => [...prev, { id, timestamp, simplified: '', raw: trimmed, type: 'normal', loading: true }]);
    try {
      const res = await fetch('/api/meetings/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranscriptItems(prev => prev.map(item =>
          item.id === id ? { ...item, simplified: data.simplified || trimmed, type: data.type || 'normal', loading: false } : item
        ));
      } else {
        setTranscriptItems(prev => prev.map(item =>
          item.id === id ? { ...item, simplified: trimmed, loading: false } : item
        ));
      }
    } catch {
      setTranscriptItems(prev => prev.map(item =>
        item.id === id ? { ...item, simplified: trimmed, loading: false } : item
      ));
    }
  }, []);

  function startRecognition() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-GB';
    recog.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) processSegment(t);
        else interim += t;
      }
      setInterimText(interim);
    };
    recog.onend = () => {
      if (meetingStateRef.current === 'recording') {
        try { recog.start(); } catch { /* ignore */ }
      }
    };
    recog.onerror = () => { /* silent */ };
    try { recog.start(); } catch { /* ignore */ }
    recognitionRef.current = recog;
  }

  function startMeeting() {
    meetingStateRef.current = 'recording';
    setMeetingState('recording');
    secondsRef.current = 0;
    setSeconds(0);
    timerRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(s => s + 1);
    }, 1000);
    startRecognition();
  }

  function pauseMeeting() {
    meetingStateRef.current = 'paused';
    setMeetingState('paused');
    clearInterval(timerRef.current!);
    recognitionRef.current?.stop();
    setInterimText('');
  }

  function resumeMeeting() {
    meetingStateRef.current = 'recording';
    setMeetingState('recording');
    timerRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(s => s + 1);
    }, 1000);
    startRecognition();
  }

  function endMeeting() {
    meetingStateRef.current = 'idle';
    setMeetingState('idle');
    clearInterval(timerRef.current!);
    recognitionRef.current?.stop();
    setInterimText('');
    setTab('summary');
  }

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptItems]);

  // ── Summary ────────────────────────────────────────────────────────────────

  async function generateSummary() {
    if (!transcriptItems.length) return;
    setSummaryLoading(true);
    try {
      const transcriptText = transcriptItems
        .map(item => `[${item.type.toUpperCase()}] ${item.simplified || item.raw}`)
        .join('\n');
      const res = await fetch('/api/meetings/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText, agenda }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch { /* silent */ }
    setSummaryLoading(false);
  }

  function copyEmail() {
    if (!summary) return;
    const text = `Subject: ${summary.emailSubject}\n\n${summary.emailBody}`;
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function openEmail() {
    if (!summary) return;
    const subject = encodeURIComponent(summary.emailSubject);
    const body = encodeURIComponent(summary.emailBody);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 8px', borderRadius: 9, border: 'none', fontFamily: 'inherit', fontSize: 13,
    fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    background: active ? C.card : 'transparent',
    color: active ? C.text : C.muted,
    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.07)' : 'none',
  });

  const st: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: C.bg, fontFamily: "'Lexend', system-ui, sans-serif", color: C.text },
    container: { maxWidth: 700, margin: '0 auto', padding: '0 16px 80px' },
    tabBar: { display: 'flex', gap: 3, background: C.border, borderRadius: 12, padding: 4, margin: '16px 0 0' },
    card: { background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 20, marginBottom: 12 },
    label: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
    btnPrimary: { width: '100%', padding: '12px 24px', borderRadius: 10, background: C.teal, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', marginTop: 12, transition: 'all 0.2s' },
  };

  return (
    <div style={st.page}>
      <div style={st.container}>

        {/* Page title */}
        <div style={{ padding: '20px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Meeting Survival Kit</h1>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Prepare, follow along, and capture what matters</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={st.tabBar}>
          {(['prep', 'live', 'summary'] as const).map(t => (
            <button key={t} type="button" style={tabStyle(tab === t)} onClick={() => setTab(t)}>
              <span>{t === 'prep' ? <ClipboardList size={16} /> : t === 'live' ? <Mic size={16} /> : <BarChart2 size={16} />}</span>
              {t === 'prep' ? 'Prepare' : t === 'live' ? 'Live' : 'Summary'}
            </button>
          ))}
        </div>

        {/* ── PREP TAB ── */}
        {tab === 'prep' && (
          <div style={{ paddingTop: 16, animation: 'fadeUp 0.3s ease' }}>
            <div style={st.card}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ClipboardList size={20} /></div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Prepare for your meeting</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Paste the agenda — we'll explain everything in plain language</div>
                </div>
              </div>
              <textarea
                value={agenda}
                onChange={e => setAgenda(e.target.value)}
                placeholder={'Paste the meeting agenda here...\n\nExample:\n1. Q3 Budget Review\n2. Office relocation update\n3. New absence policy'}
                style={{ width: '100%', padding: 14, borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.6, resize: 'none', height: 140, color: C.text, background: C.card, outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => { e.currentTarget.style.borderColor = C.teal; }}
                onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
              />
              <button
                type="button"
                style={{ ...st.btnPrimary, opacity: prepLoading || !agenda.trim() ? 0.6 : 1 }}
                onClick={runPrep}
                disabled={prepLoading || !agenda.trim()}
              >
                {prepLoading ? '⏳ Explaining agenda…' : <><Sparkles size={16} /> Explain this agenda</>}
              </button>
              {prepError && <p style={{ fontSize: 13, color: C.coral, marginTop: 10 }}>{prepError}</p>}
            </div>

            {prepItems && prepItems.map((item, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px 20px', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Agenda item {item.num}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 10 }}>{item.explanation}</div>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, marginBottom: item.questions.length ? 10 : 0,
                  background: item.affects ? C.coralLight : C.tealLight,
                  color: item.affects ? C.coral : C.tealDark,
                }}>
                  {item.affects ? '⚠️ This will affect you — listen carefully' : '✓ Probably won\'t affect you directly'}
                </span>
                {item.questions.length > 0 && (
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4 }}>
                    {item.questions.map((q, qi) => (
                      <div key={qi} style={{ fontSize: 13, color: C.purple, padding: '3px 0', display: 'flex', gap: 6 }}>
                        <span><Lightbulb size={14} /></span> <span>You could ask: &ldquo;{q}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── LIVE TAB ── */}
        {tab === 'live' && (
          <div style={{ paddingTop: 16 }}>
            {!isPro && meetingState === 'idle' && (
              <div style={{ background: C.purpleLight, border: `1px solid #CECBF6`, borderRadius: 12, padding: '14px 16px', marginBottom: 12, fontSize: 13, color: C.purpleDark }}>
                🔒 <strong>Pro feature</strong> — real-time transcription and live simplification requires a Pro account.{' '}
                <button type="button" onClick={() => router.push('/pricing')} style={{ background: 'none', border: 'none', color: C.purple, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}>
                  Upgrade →
                </button>
              </div>
            )}

            {!speechSupported && (
              <div style={{ background: C.amberLight, border: `1px solid #F0D49C`, borderRadius: 12, padding: '14px 16px', marginBottom: 12, fontSize: 13, color: C.amberDark }}>
                ⚠️ Your browser doesn&apos;t support live speech recognition. Try Chrome or Edge.
              </div>
            )}

            {/* Status bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, marginBottom: 12,
              background: meetingState === 'recording' ? '#FEE2E2' : meetingState === 'paused' ? C.amberLight : C.bg,
              border: `1px solid ${meetingState === 'recording' ? '#FECACA' : meetingState === 'paused' ? '#F0D49C' : C.border}`,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: meetingState === 'recording' ? '#EF4444' : meetingState === 'paused' ? C.amber : C.light,
                animation: meetingState === 'recording' ? 'blink 1s infinite' : 'none',
              }} />
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                {meetingState === 'recording' ? 'Listening and simplifying…' : meetingState === 'paused' ? 'Paused' : 'Ready to start'}
              </span>
              <span style={{ fontSize: 13, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{formatTime(seconds)}</span>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {meetingState === 'idle' && (
                <button type="button"
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: (isPro && speechSupported) ? C.teal : C.border, color: (isPro && speechSupported) ? '#fff' : C.muted, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: 'none', cursor: (isPro && speechSupported) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={isPro && speechSupported ? startMeeting : undefined}
                >
                  <Mic size={16} /> Start meeting
                </button>
              )}
              {meetingState === 'recording' && (<>
                <button type="button"
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: C.amberLight, color: C.amberDark, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: `1px solid #F0D49C`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={pauseMeeting}
                >
                  <Pause size={16} /> Pause
                </button>
                <button type="button"
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: C.coralLight, color: C.coral, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: `1px solid #F5C4B3`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={endMeeting}
                >
                  <StopCircle size={16} /> End meeting
                </button>
              </>)}
              {meetingState === 'paused' && (<>
                <button type="button"
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: C.tealLight, color: C.tealDark, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: `1px solid #9FE1CB`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={resumeMeeting}
                >
                  <Play size={16} /> Resume
                </button>
                <button type="button"
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: C.coralLight, color: C.coral, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: `1px solid #F5C4B3`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={endMeeting}
                >
                  <StopCircle size={16} /> End meeting
                </button>
              </>)}
            </div>

            {/* Transcript */}
            <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
              {transcriptItems.length === 0 && meetingState === 'idle' && (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Mic size={40} /></div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Ready when you are</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
                    Tap &ldquo;Start meeting&rdquo; when it begins. We&apos;ll listen and create a simplified transcript you can follow along with.
                  </div>
                </div>
              )}
              {transcriptItems.map(item => (
                <TranscriptCard key={item.id} item={item} C={C} />
              ))}
              {interimText && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: C.bg, border: `1px dashed ${C.border}`, marginBottom: 8, fontSize: 13, color: C.muted, fontStyle: 'italic' }}>
                  {interimText}
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        {/* ── SUMMARY TAB ── */}
        {tab === 'summary' && (
          <div style={{ paddingTop: 16 }}>
            {transcriptItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><BarChart2 size={40} /></div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No meeting recorded yet</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 20px' }}>
                  After you record a meeting in the Live tab, your summary and action items will appear here.
                </div>
                <button type="button"
                  style={{ padding: '10px 24px', borderRadius: 10, background: C.teal, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
                  onClick={() => setTab('live')}
                >
                  Go to Live tab →
                </button>
              </div>
            ) : !summary ? (
              <div>
                <div style={st.card}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Meeting recorded</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
                    {transcriptItems.length} segments captured · {formatTime(seconds)} duration
                  </div>
                  <button type="button"
                    style={{ ...st.btnPrimary, opacity: summaryLoading ? 0.7 : 1 }}
                    onClick={generateSummary}
                    disabled={summaryLoading}
                  >
                    {summaryLoading ? '⏳ Generating summary…' : <><BarChart2 size={16} /> Generate meeting summary</>}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Overview */}
                <div style={st.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart2 size={16} /></div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Meeting summary</div>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text }}>{summary.overview}</div>
                </div>

                {/* Decisions */}
                {summary.decisions.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ ...st.label, color: C.purple }}>⚡ Decisions made</div>
                    {summary.decisions.map((d, i) => (
                      <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: C.purpleLight, marginBottom: 6, fontSize: 13, lineHeight: 1.5, color: C.purpleDark, display: 'flex', gap: 8 }}>
                        <span>✓</span> <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {summary.actions.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ ...st.label, color: C.coral }}>📌 What you need to do</div>
                    {summary.actions.map((action, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, marginBottom: 8 }}>
                        <button
                          type="button"
                          onClick={() => setActionsDone(prev => {
                            const next = new Set(Array.from(prev));
                            next.has(i) ? next.delete(i) : next.add(i);
                            return next;
                          })}
                          style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${actionsDone.has(i) ? C.teal : C.border}`, flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: actionsDone.has(i) ? C.teal : 'transparent', color: '#fff', fontSize: 12, transition: 'all 0.2s', marginTop: 2 }}
                        >
                          {actionsDone.has(i) ? '✓' : ''}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5, textDecoration: actionsDone.has(i) ? 'line-through' : 'none', color: actionsDone.has(i) ? C.muted : C.text }}>{action.task}</div>
                          {action.deadline && <div style={{ fontSize: 11, color: C.coral, marginTop: 3, fontWeight: 500 }}>⏰ {action.deadline}</div>}
                          {action.context && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{action.context}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Email draft */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...st.label, color: C.amber }}><Mail size={16} /> Draft follow-up email</div>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Subject</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>{summary.emailSubject}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.8, color: C.text, whiteSpace: 'pre-line' }}>{summary.emailBody}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button type="button"
                        onClick={openEmail}
                        style={{ padding: '8px 16px', borderRadius: 8, background: C.teal, color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}
                      >
                        <Mail size={16} /> Open in email app
                      </button>
                      <button type="button"
                        onClick={copyEmail}
                        style={{ padding: '8px 16px', borderRadius: 8, background: C.bg, color: C.text, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, border: `1px solid ${C.border}`, cursor: 'pointer' }}
                      >
                        <ClipboardList size={16} /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

// ── Transcript card sub-component ────────────────────────────────────────────

function TranscriptCard({ item, C }: { item: TranscriptItem; C: typeof import('./page').default extends any ? any : any }) {
  const [showRaw, setShowRaw] = useState(false);
  const bg = item.type === 'action' ? '#FAEEDA' : item.type === 'decision' ? '#EEEDFE' : '#E1F5EE';
  const borderColor = item.type === 'action' ? '#F0D49C' : item.type === 'decision' ? '#CECBF6' : '#9FE1CB';
  const labelColor = item.type === 'action' ? '#BA7517' : item.type === 'decision' ? '#534AB7' : '#1D9E75';
  const label = item.type === 'action' ? '📌 Action needed' : item.type === 'decision' ? '⚡ Decision' : 'Simplified';

  return (
    <div style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 8, background: bg, border: `1px solid ${borderColor}`, animation: 'fadeUp 0.3s ease' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{label}</span>
        <span style={{ color: '#B4B2A9' }}>— {item.timestamp}</span>
      </div>
      {item.loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#B4B2A9', fontSize: 13 }}>
          <div style={{ width: 14, height: 14, border: '2px solid #9FE1CB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Simplifying…
        </div>
      ) : (
        <div style={{ fontSize: 14, lineHeight: 1.65 }}>{item.simplified}</div>
      )}
      <button
        type="button"
        onClick={() => setShowRaw(s => !s)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#B4B2A9', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontFamily: 'inherit' }}
      >
        👁️ {showRaw ? 'Hide' : 'Show what was actually said'}
      </button>
      {showRaw && (
        <div style={{ fontSize: 12, color: '#888780', marginTop: 6, padding: 8, background: 'rgba(255,255,255,0.6)', borderRadius: 6, lineHeight: 1.5 }}>
          &ldquo;{item.raw}&rdquo;
        </div>
      )}
    </div>
  );
}
