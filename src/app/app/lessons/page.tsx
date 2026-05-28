'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSchoolMode } from '@/hooks/useSchoolMode';
import { Mic, Pause, Play, StopCircle, ClipboardList, BookOpen, Sparkles, Star, Send, Pen, Brain, Check, School } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface VocabWord { word: string; pronunciation: string; definition: string; }

interface PrepResult {
  topicSummary: string;
  vocab: VocabWord[];
  whatToListen: string;
  questions: string[];
}

interface TranscriptItem {
  id: string;
  timestamp: string;
  simplified: string;
  raw: string;
  type: 'explain' | 'keyword' | 'task' | 'important';
  loading: boolean;
}

interface KeyFact { icon: string; important: boolean; text: string; }
interface QuizQuestion { question: string; options: string[]; correctIndex: number; }

interface RevisionNotes {
  title: string;
  overview: string;
  keyFacts: KeyFact[];
  vocab: VocabWord[];
  pictureThis: string;
  quiz: QuizQuestion[];
  homework: { task: string; deadline: string } | null;
}

interface QuizAnswer { chosen: number; correct: boolean; }

// ── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: '#FDF6E3', card: '#fff', text: '#2C2C2A', muted: '#888780', light: '#B4B2A9',
  border: '#E8E6DE',
  teal: '#1D9E75', tealLight: '#E1F5EE', tealDark: '#085041',
  purple: '#534AB7', purpleLight: '#EEEDFE', purpleDark: '#3C3489',
  amber: '#BA7517', amberLight: '#FAEEDA', amberDark: '#633806',
  coral: '#D85A30', coralLight: '#FAECE7',
  green: '#2D8A4E', greenLight: '#E3F5E8',
};

const TYPE_CONF = {
  explain:   { bg: C.tealLight,   border: '#9FE1CB', color: C.teal,   label: <><Pen size={16} /> Teacher explaining</> },
  keyword:   { bg: C.purpleLight, border: '#CECBF6', color: C.purple, label: <><BookOpen size={16} /> Key term</> },
  task:      { bg: C.amberLight,  border: '#F0D49C', color: C.amber,  label: <><Pen size={16} /> Task set</> },
  important: { bg: C.coralLight,  border: '#F5C4B3', color: C.coral,  label: <><Star size={16} /> Important</> },
};

function fmt(secs: number) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// ── TranscriptCard sub-component ─────────────────────────────────────────────

function TranscriptCard({ item }: { item: TranscriptItem }) {
  const [showRaw, setShowRaw] = useState(false);
  const conf = TYPE_CONF[item.type] ?? TYPE_CONF.explain;
  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, marginBottom: 6, background: conf.bg, border: `1px solid ${conf.border}`, animation: 'fadeUp 0.3s ease' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: conf.color, marginBottom: 3 }}>
        {conf.label} · {item.timestamp}
      </div>
      {item.loading ? (
        <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>Simplifying…</div>
      ) : (
        <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{item.simplified}</div>
      )}
      {!item.loading && item.raw && item.raw !== item.simplified && (
        <>
          <div
            onClick={() => setShowRaw(v => !v)}
            style={{ fontSize: 10, color: C.light, marginTop: 4, cursor: 'pointer', userSelect: 'none' }}
          >
            👁 What teacher actually said
          </div>
          {showRaw && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4, padding: '6px 8px', background: 'rgba(255,255,255,0.5)', borderRadius: 6, lineHeight: 1.5 }}>
              &ldquo;{item.raw}&rdquo;
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LessonsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const schoolMode = useSchoolMode();

  const [tab, setTab] = useState<'prep' | 'live' | 'revision'>('prep');

  // Prep
  const [topic, setTopic] = useState('');
  const [prep, setPrep] = useState<PrepResult | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState('');
  const [vocabExpanded, setVocabExpanded] = useState<number | null>(null);

  // Live
  const [captureState, setCaptureState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [items, setItems] = useState<TranscriptItem[]>([]);
  const [interim, setInterim] = useState('');
  const [speechOk, setSpeechOk] = useState(true);
  const captureRef = useRef<'idle' | 'recording' | 'paused'>('idle');
  const secsRef = useRef(0);
  const recRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsRef = useRef<TranscriptItem[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Revision
  const [revision, setRevision] = useState<RevisionNotes | null>(null);
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, QuizAnswer>>({});
  const [revVocabIdx, setRevVocabIdx] = useState<number | null>(null);
  const capturedSeconds = useRef(0);

  // ── Setup ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) router.push('/sign-in');
  }, [isLoaded, user, router]);

  useEffect(() => {
    setSpeechOk(!!(
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    ));
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  // ── Prep ───────────────────────────────────────────────────────────────────

  async function runPrep() {
    if (!topic.trim()) return;
    setPrepLoading(true);
    setPrepError('');
    setPrep(null);
    setVocabExpanded(null);
    try {
      const r = await fetch('/api/lessons/prep', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (!r.ok) throw new Error();
      setPrep(await r.json());
    } catch {
      setPrepError('Could not prepare lesson — please try again.');
    } finally {
      setPrepLoading(false);
    }
  }

  // ── Capture ────────────────────────────────────────────────────────────────

  async function processSegment(text: string) {
    const id = `s${Date.now()}`;
    const ts = fmt(secsRef.current);
    const placeholder: TranscriptItem = { id, timestamp: ts, simplified: '', raw: text, type: 'explain', loading: true };
    setItems(prev => { const n = [...prev, placeholder]; itemsRef.current = n; return n; });

    try {
      const r = await fetch('/api/lessons/transcribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const d = r.ok ? await r.json() : {};
      setItems(prev => {
        const n = prev.map(i => i.id === id
          ? { ...i, simplified: d.simplified || text, type: d.type || 'explain', loading: false }
          : i);
        itemsRef.current = n; return n;
      });
    } catch {
      setItems(prev => {
        const n = prev.map(i => i.id === id ? { ...i, simplified: text, loading: false } : i);
        itemsRef.current = n; return n;
      });
    }
  }

  function startCapture() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-GB';
    recRef.current = rec;

    rec.onresult = (e: any) => {
      let im = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const t = e.results[i][0].transcript.trim();
          if (t.length > 5) processSegment(t);
        } else im += e.results[i][0].transcript;
      }
      setInterim(im);
    };

    rec.onend = () => {
      setInterim('');
      if (captureRef.current === 'recording') rec.start();
    };

    rec.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') console.error('Speech:', e.error);
    };

    setCaptureState('recording');
    captureRef.current = 'recording';
    timerRef.current = setInterval(() => { secsRef.current++; setSeconds(secsRef.current); }, 1000);
    rec.start();
  }

  function pauseCapture() {
    setCaptureState('paused');
    captureRef.current = 'paused';
    if (timerRef.current) clearInterval(timerRef.current);
    recRef.current?.stop();
  }

  function resumeCapture() {
    setCaptureState('recording');
    captureRef.current = 'recording';
    timerRef.current = setInterval(() => { secsRef.current++; setSeconds(secsRef.current); }, 1000);
    recRef.current?.start();
  }

  function stopCapture() {
    setCaptureState('idle');
    captureRef.current = 'idle';
    if (timerRef.current) clearInterval(timerRef.current);
    capturedSeconds.current = secsRef.current;
    recRef.current?.stop();
    setTab('revision');
    setTimeout(generateRevision, 1500);
  }

  // ── Revision ───────────────────────────────────────────────────────────────

  async function generateRevision() {
    const captured = itemsRef.current;
    if (!captured.length) return;
    setRevLoading(true);
    setRevError('');
    try {
      const transcript = captured
        .map(i => `[${i.type}] ${i.simplified || i.raw}`)
        .join('\n');
      const r = await fetch('/api/lessons/summarise', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, topic }),
      });
      if (!r.ok) throw new Error();
      const data: RevisionNotes = await r.json();
      setRevision(data);
      autoSaveVocab(data.vocab);
    } catch {
      setRevError('Could not generate revision notes — please try again.');
    } finally {
      setRevLoading(false);
    }
  }

  async function autoSaveVocab(words: VocabWord[]) {
    for (const v of words) {
      fetch('/api/vocabulary/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: v.word,
          phonetic: v.pronunciation,
          definition: v.definition,
          sourceType: 'lesson',
          context: topic,
        }),
      }).catch(() => {});
    }
  }

  function answerQuiz(qIdx: number, optIdx: number, correctIdx: number) {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: { chosen: optIdx, correct: optIdx === correctIdx } }));
  }

  function startHomework() {
    if (!revision?.homework) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dw_homework_preload', revision.homework.task);
    }
    router.push('/app');
  }

  function copyNotes() {
    if (!revision) return;
    const lines = [
      revision.title, '',
      revision.overview, '',
      'Key Facts:',
      ...revision.keyFacts.map(f => `• ${f.text}`),
      '',
      'Vocabulary:',
      ...revision.vocab.map(v => `• ${v.word} (${v.pronunciation}): ${v.definition}`),
    ];
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  function tabStyle(active: boolean): React.CSSProperties {
    return {
      flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', fontFamily: 'inherit',
      fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      background: active ? C.card : 'transparent',
      color: active ? C.text : C.muted,
      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
    };
  }

  const st: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: C.bg, fontFamily: "'Lexend', system-ui, sans-serif", color: C.text },
    container: { maxWidth: 680, margin: '0 auto', padding: '0 16px 80px' },
    tabBar: { display: 'flex', gap: 2, background: C.border, borderRadius: 10, padding: 3, margin: '12px 0 0' },
    card: { background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 },
    btnPrimary: { width: '100%', padding: '11px 20px', borderRadius: 10, background: C.teal, color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', marginTop: 10, transition: 'all 0.2s' },
    liveBtn: { flex: 1, padding: 10, borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s' },
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.85 } }
      `}</style>

      <div style={st.page}>
        <div style={st.container}>

          {/* Page header */}
          <div style={{ padding: '20px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pen size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Lesson Capture</h1>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Prepare, capture, and revise your lessons</p>
            </div>
            {schoolMode.isSchoolMode && (
              <div style={{ padding: '5px 12px', borderRadius: 16, background: C.purpleLight, color: C.purpleDark, fontSize: 12, fontWeight: 500 }}>
                <School size={16} /> School Mode
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={st.tabBar}>
            <button type="button" style={tabStyle(tab === 'prep')} onClick={() => setTab('prep')}><ClipboardList size={16} /> Prep</button>
            <button type="button" style={tabStyle(tab === 'live')} onClick={() => setTab('live')}><Mic size={16} /> Capture</button>
            <button type="button" style={tabStyle(tab === 'revision')} onClick={() => setTab('revision')}><BookOpen size={16} /> Revision</button>
          </div>

          {/* ═══════════════ PREP TAB ═══════════════ */}
          {tab === 'prep' && (
            <div style={{ paddingTop: 14, animation: 'fadeUp 0.3s ease' }}>
              <div style={st.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClipboardList size={16} /></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Prepare for your lesson</div>
                    <div style={{ fontSize: 11, color: C.muted }}>Type what the lesson is about — we&apos;ll explain it before it starts</div>
                  </div>
                </div>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runPrep(); }}
                  placeholder={"Type what the lesson is about…\n\nExample: Year 9 Chemistry — The periodic table and how elements are organised by atomic number"}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.6, resize: 'none', height: 90, color: C.text, background: C.card, outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = C.teal; }}
                  onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = C.border; }}
                />
                {prepError && <p style={{ fontSize: 12, color: C.coral, marginTop: 6 }}>{prepError}</p>}
                <button
                  type="button"
                  onClick={runPrep}
                  disabled={prepLoading || !topic.trim()}
                  style={{ ...st.btnPrimary, opacity: prepLoading || !topic.trim() ? 0.6 : 1 }}
                >
                  {prepLoading ? 'Preparing…' : <>Explain this lesson <Sparkles size={16} /></>}
                </button>
              </div>

              {prep && (
                <>
                  {/* Topic summary */}
                  <div style={{ padding: 14, borderRadius: 10, background: C.tealLight, border: '1px solid #9FE1CB', marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                      What this lesson is about
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: C.tealDark }}>{prep.topicSummary}</div>
                  </div>

                  {/* Vocab */}
                  <div style={st.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={16} /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Words you&apos;ll hear</div>
                        <div style={{ fontSize: 11, color: C.muted }}>Tap any word to see what it means</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {prep.vocab.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setVocabExpanded(vocabExpanded === i ? null : i)}
                          style={{
                            padding: '5px 10px', borderRadius: 8, background: C.purpleLight,
                            border: `1px solid ${vocabExpanded === i ? C.purple : 'transparent'}`,
                            fontSize: 12, fontWeight: 500, color: C.purpleDark, cursor: 'pointer',
                          }}
                        >
                          {v.word}
                        </button>
                      ))}
                    </div>
                    {vocabExpanded !== null && prep.vocab[vocabExpanded] && (
                      <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, fontSize: 12, lineHeight: 1.5, animation: 'fadeUp 0.2s ease' }}>
                        <strong style={{ color: C.purple }}>{prep.vocab[vocabExpanded].word}</strong>
                        <span style={{ color: C.light, marginLeft: 8, fontSize: 11 }}>{prep.vocab[vocabExpanded].pronunciation}</span>
                        <p style={{ marginTop: 4, marginBottom: 0, color: C.muted }}>{prep.vocab[vocabExpanded].definition}</p>
                      </div>
                    )}
                  </div>

                  {/* What to listen for */}
                  <div style={{ padding: 12, borderRadius: 10, background: C.amberLight, border: '1px solid #F0D49C', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.amber, marginBottom: 4 }}>👂 What to listen for</div>
                    <div style={{ fontSize: 12, color: C.amberDark, lineHeight: 1.5 }}>{prep.whatToListen}</div>
                  </div>

                  {/* Questions */}
                  <div style={st.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={16} /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Questions you could ask</div>
                        <div style={{ fontSize: 11, color: C.muted }}>Having a question ready makes it easier to participate</div>
                      </div>
                    </div>
                    {prep.questions.map((q, i) => (
                      <div key={i} style={{ padding: '6px 0', fontSize: 13, color: C.purple, display: 'flex', gap: 6, lineHeight: 1.5 }}>
                        <Brain size={16} /> &ldquo;{q}&rdquo;
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={() => setTab('live')} style={{ ...st.btnPrimary, background: C.purple }}>
                    I&apos;m ready — start the lesson <Mic size={16} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* ═══════════════ CAPTURE TAB ═══════════════ */}
          {tab === 'live' && (
            <div style={{ paddingTop: 14, animation: 'fadeUp 0.3s ease' }}>
              {/* Status bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, marginBottom: 10,
                background: captureState === 'recording' ? '#FEE2E2' : captureState === 'paused' ? C.amberLight : C.bg,
                border: captureState === 'recording' ? '1px solid #FECACA' : captureState === 'paused' ? '1px solid #F0D49C' : `1px solid ${C.border}`,
                animation: captureState === 'recording' ? 'pulse 2s infinite' : 'none',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: captureState === 'recording' ? '#EF4444' : captureState === 'paused' ? C.amber : C.light,
                  animation: captureState === 'recording' ? 'blink 1s infinite' : 'none',
                }} />
                <div style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>
                  {captureState === 'recording' ? 'Listening to your teacher…' : captureState === 'paused' ? 'Paused' : 'Ready to capture'}
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{fmt(seconds)}</div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {captureState === 'idle' && (
                  <button
                    type="button"
                    onClick={startCapture}
                    disabled={!speechOk}
                    style={{ ...st.liveBtn, background: C.teal, color: '#fff', opacity: speechOk ? 1 : 0.5, cursor: speechOk ? 'pointer' : 'not-allowed' }}
                  >
                    <Mic size={16} /> Start lesson
                  </button>
                )}
                {captureState === 'recording' && (
                  <>
                    <button type="button" onClick={pauseCapture} style={{ ...st.liveBtn, background: C.amberLight, color: C.amberDark, border: '1px solid #F0D49C' }}>
                      <Pause size={16} /> Pause
                    </button>
                    <button type="button" onClick={stopCapture} style={{ ...st.liveBtn, background: C.coralLight, color: C.coral, border: '1px solid #F5C4B3' }}>
                      <StopCircle size={16} /> End lesson
                    </button>
                  </>
                )}
                {captureState === 'paused' && (
                  <>
                    <button type="button" onClick={resumeCapture} style={{ ...st.liveBtn, background: C.tealLight, color: C.tealDark, border: `1px solid ${C.teal}` }}>
                      <Play size={16} /> Resume
                    </button>
                    <button type="button" onClick={stopCapture} style={{ ...st.liveBtn, background: C.coralLight, color: C.coral, border: '1px solid #F5C4B3' }}>
                      <StopCircle size={16} /> End lesson
                    </button>
                  </>
                )}
              </div>

              {!speechOk && (
                <div style={{ padding: 12, borderRadius: 10, background: C.amberLight, border: '1px solid #F0D49C', fontSize: 12, color: C.amberDark, marginBottom: 10 }}>
                  ⚠️ Voice capture isn&apos;t supported in this browser. Try Chrome or Edge.
                </div>
              )}

              {/* Transcript */}
              <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Mic size={36} /></span>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Ready when the lesson starts</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, maxWidth: 260, margin: '0 auto' }}>
                      Tap &ldquo;Start lesson&rdquo; when the teacher begins. We&apos;ll simplify what&apos;s said and build your notes automatically.
                    </div>
                  </div>
                ) : (
                  items.map(item => <TranscriptCard key={item.id} item={item} />)
                )}
                {interim && (
                  <div style={{ padding: '8px 12px', borderRadius: 10, background: C.border, fontSize: 12, color: C.muted, fontStyle: 'italic', marginBottom: 6 }}>
                    {interim}…
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          )}

          {/* ═══════════════ REVISION TAB ═══════════════ */}
          {tab === 'revision' && (
            <div style={{ paddingTop: 14, animation: 'fadeUp 0.3s ease' }}>

              {/* Loading */}
              {revLoading && (
                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.teal}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Building your revision notes…</div>
                  <div style={{ fontSize: 12, color: C.muted }}>This takes a few seconds</div>
                </div>
              )}

              {/* Error */}
              {revError && !revLoading && (
                <div style={{ padding: 16, borderRadius: 10, background: C.coralLight, border: '1px solid #F5C4B3', marginBottom: 10 }}>
                  <p style={{ fontSize: 13, color: C.coral, marginBottom: 8 }}>{revError}</p>
                  <button type="button" onClick={generateRevision} style={{ padding: '8px 16px', borderRadius: 8, background: C.coral, color: '#fff', fontFamily: 'inherit', fontSize: 12, border: 'none', cursor: 'pointer' }}>
                    Try again
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!revision && !revLoading && !revError && (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <span style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><BookOpen size={36} /></span>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No lesson captured yet</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, maxWidth: 260, margin: '0 auto 16px' }}>
                    After you capture a lesson, your revision notes will appear here automatically.
                  </div>
                  <button type="button" onClick={() => setTab('live')} style={{ padding: '10px 20px', borderRadius: 10, background: C.teal, color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                    Go to Capture <Mic size={16} />
                  </button>
                </div>
              )}

              {/* Revision notes */}
              {revision && !revLoading && (
                <>
                  {/* Overview */}
                  <div style={st.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={16} /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{revision.title}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>Captured · {fmt(capturedSeconds.current)}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: C.text, margin: 0 }}>{revision.overview}</p>
                  </div>

                  {/* Key facts */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, color: C.coral, display: 'flex', alignItems: 'center', gap: 5 }}>
                      📌 Key facts to remember
                    </div>
                    {revision.keyFacts.map((f, i) => (
                      <div key={i} style={{
                        padding: '8px 10px', borderRadius: 8, background: C.card,
                        border: `1px solid ${C.border}`,
                        borderLeft: f.important ? `3px solid ${C.coral}` : `1px solid ${C.border}`,
                        marginBottom: 5, fontSize: 12, lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start',
                      }}>
                        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Vocabulary */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, color: C.purple, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <BookOpen size={16} /> Vocabulary from this lesson
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {revision.vocab.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRevVocabIdx(revVocabIdx === i ? null : i)}
                          style={{
                            padding: '6px 10px', borderRadius: 8, background: C.purpleLight,
                            border: `1px solid ${revVocabIdx === i ? C.purple : 'transparent'}`,
                            fontSize: 12, color: C.purpleDark, cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {v.word}
                        </button>
                      ))}
                    </div>
                    {revVocabIdx !== null && revision.vocab[revVocabIdx] && (
                      <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, fontSize: 12, lineHeight: 1.5, animation: 'fadeUp 0.2s ease' }}>
                        <strong style={{ color: C.purple }}>{revision.vocab[revVocabIdx].word}</strong>
                        <span style={{ color: C.light, marginLeft: 8, fontSize: 11 }}>{revision.vocab[revVocabIdx].pronunciation}</span>
                        <p style={{ marginTop: 4, marginBottom: 0, color: C.muted }}>{revision.vocab[revVocabIdx].definition}</p>
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>These words have been added to your vocabulary tracker for review</p>
                  </div>

                  {/* Picture this */}
                  <div style={{ padding: 12, borderRadius: 10, background: C.greenLight, border: '1px solid #A8D5BA', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.green, marginBottom: 4 }}>📸 Picture this</div>
                    <div style={{ fontSize: 12, color: '#1B5E2E', lineHeight: 1.6 }}>{revision.pictureThis}</div>
                  </div>

                  {/* Quiz */}
                  {revision.quiz.map((q, qi) => (
                    <div key={qi} style={{ padding: 14, borderRadius: 10, background: '#E6F1FB', border: '1px solid #B8D8F5', marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#378ADD', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Brain size={16} /> Quick check</div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: C.text, marginBottom: 8 }}>{q.question}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {q.options.map((opt, oi) => {
                          const ans = quizAnswers[qi];
                          const answered = ans !== undefined;
                          const isChosen = ans?.chosen === oi;
                          const isCorrect = oi === q.correctIndex;
                          return (
                            <button
                              key={oi}
                              type="button"
                              disabled={answered}
                              onClick={() => answerQuiz(qi, oi, q.correctIndex)}
                              style={{
                                padding: '8px 12px', borderRadius: 8, fontFamily: 'inherit', fontSize: 12,
                                cursor: answered ? 'default' : 'pointer', transition: 'all 0.15s', textAlign: 'left',
                                background: answered && isChosen && isCorrect ? C.tealLight
                                  : answered && isChosen && !isCorrect ? C.coralLight : C.card,
                                border: answered && isChosen && isCorrect ? `1.5px solid ${C.teal}`
                                  : answered && isChosen && !isCorrect ? `1.5px solid ${C.coral}` : `1.5px solid ${C.border}`,
                                color: answered && isChosen && isCorrect ? C.tealDark
                                  : answered && isChosen && !isCorrect ? C.coral : C.text,
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizAnswers[qi] && (
                        <div style={{
                          fontSize: 12, marginTop: 6, padding: '6px 8px', borderRadius: 6, lineHeight: 1.4,
                          background: quizAnswers[qi].correct ? C.tealLight : C.coralLight,
                          color: quizAnswers[qi].correct ? C.tealDark : C.coral,
                        }}>
                          {quizAnswers[qi].correct ? <><Check size={16} /> That&apos;s right! Well remembered.</> : 'Not quite — check the key facts above and try again next time.'}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Homework */}
                  {revision.homework && (
                    <div style={{ padding: 14, borderRadius: 10, background: C.amberLight, border: '1px solid #F0D49C', marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.amberDark, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Pen size={16} /> Homework
                      </div>
                      <p style={{ fontSize: 13, color: C.amberDark, lineHeight: 1.6, marginBottom: 6 }}>{revision.homework.task}</p>
                      {revision.homework.deadline && (
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.coral }}>⏰ Due: {revision.homework.deadline}</div>
                      )}
                      <button type="button" onClick={startHomework} style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, background: C.teal, color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                        Start homework in DyslexiaWrite <Pen size={16} />
                      </button>
                    </div>
                  )}

                  {/* Export */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    <button type="button" onClick={copyNotes} style={{ padding: '8px 14px', borderRadius: 8, background: C.teal, color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ClipboardList size={16} /> Copy notes
                    </button>
                    {schoolMode.isSchoolMode && (
                      <button type="button" style={{ padding: '8px 14px', borderRadius: 8, background: C.card, color: C.muted, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Send size={16} /> Share with teacher
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
