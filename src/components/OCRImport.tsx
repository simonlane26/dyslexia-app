'use client';

import { useRef, useState, useEffect } from 'react';
import type { DecoderAnalysis } from '@/lib/document-decoder';

export type OCRProps = { onTextAction: (text: string) => void };

type Mode = 'decode' | 'import';
type ChatMsg = { role: 'user' | 'assistant'; content: string };

/* ── Existing client-side PDF extraction (import mode only) ── */
async function ensurePdfjsFromCdn() {
  if (typeof window === 'undefined') throw new Error('pdf.js needs a browser');
  const w = window as any;
  if (w.pdfjsLib?.getDocument) return w.pdfjsLib;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
    s.async = true; s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load pdf.js'));
    document.head.appendChild(s);
  });
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib?.getDocument) throw new Error('pdf.js did not expose pdfjsLib');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  return pdfjsLib;
}

async function clientSideExtract(file: File, onProgress: (s: string) => void): Promise<string> {
  const MAX_PAGES = 20;
  onProgress('Loading PDF…');
  const pdfjsLib: any = await ensurePdfjsFromCdn();
  const { createWorker, PSM } = await import('tesseract.js');
  const uint8 = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
  const numPages: number = pdf.numPages;

  onProgress('Checking for embedded text…');
  let quickText = '';
  for (let i = 1; i <= Math.min(numPages, 3); i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    quickText += (tc.items as any[]).map((it: any) => it.str || '').join(' ').trim() + '\n\n';
  }
  if (quickText.replace(/\s+/g, '').length > 200) {
    onProgress('Extracting embedded text…');
    let allText = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      allText += (tc.items as any[]).map((it: any) => it.str || '').join(' ').trim() + '\n\n';
    }
    return allText.trim();
  }

  onProgress('Starting OCR…');
  const worker = await createWorker('eng', 1, {
    workerPath: 'https://unpkg.com/tesseract.js@5/dist/worker.min.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    logger: (m: any) => {
      if (m?.status === 'recognizing text') onProgress(`OCR ${Math.round((m.progress || 0) * 100)}%`);
    },
  });
  await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
  let fullText = '';
  const pages = Math.min(numPages, MAX_PAGES);
  for (let i = 1; i <= pages; i++) {
    onProgress(`Page ${i}/${pages}…`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
    const { data } = await worker.recognize(canvas as unknown as HTMLCanvasElement);
    fullText += (data.text || '') + '\n\n';
  }
  await worker.terminate();
  return fullText.trim();
}

/* ── Main component ── */
export default function OCRImport({ onTextAction }: OCRProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<Mode>('decode');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Decode state
  const [analysis, setAnalysis] = useState<DecoderAnalysis | null>(null);
  const [docText, setDocText] = useState('');
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs]);

  function reset() {
    setSelectedFile(null);
    setProgress('');
    setError('');
    setAnalysis(null);
    setDocText('');
    setChatMsgs([]);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleUpload(file: File) {
    setError('');
    setAnalysis(null);
    setDocText('');
    setChatMsgs([]);
    setRunning(true);

    if (mode === 'import' && (file.type.includes('pdf') || file.name.endsWith('.pdf'))) {
      // Client-side extraction for import mode (existing behaviour)
      try {
        const text = await clientSideExtract(file, setProgress);
        setProgress('Done.');
        onTextAction(text);
      } catch (e: any) {
        setError(e?.message || 'Failed to extract text.');
        setProgress('');
      }
      setRunning(false);
      return;
    }

    // Server-side for all other cases and decode mode
    setProgress(mode === 'decode' ? 'Uploading and analysing…' : 'Uploading…');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('mode', mode);
      const res = await fetch('/api/import', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (mode === 'decode' && data.decoded) {
        setDocText(data.text);
        setAnalysis(data.analysis);
        setProgress('');
      } else {
        onTextAction(data.text);
        setProgress('Done.');
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
      setProgress('');
    }
    setRunning(false);
  }

  async function sendChat(question: string) {
    if (!question.trim() || !docText) return;
    const userMsg: ChatMsg = { role: 'user', content: question };
    const next = [...chatMsgs, userMsg];
    setChatMsgs(next);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/document-decoder/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: docText, messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      setChatMsgs([...next, { role: 'assistant', content: data.reply }]);
    } catch (e: any) {
      setChatMsgs([...next, { role: 'assistant', content: `Sorry, something went wrong: ${e.message}` }]);
    }
    setChatLoading(false);
  }

  const accept = mode === 'decode' ? '.pdf,.docx,.jpg,.jpeg,.png,.webp' : '.pdf';

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>

      {/* Mode toggle */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
        {(['decode', 'import'] as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); reset(); }}
            style={{
              flex: 1, padding: '12px 16px', fontSize: 14, fontWeight: 500, border: 'none',
              cursor: 'pointer', transition: 'all 0.15s',
              background: mode === m ? '#f0f9ff' : '#f8fafc',
              color: mode === m ? '#0369a1' : '#64748b',
              borderBottom: mode === m ? '2px solid #0369a1' : '2px solid transparent',
            }}
          >
            {m === 'decode' ? '🔍 Decode a document' : '📥 Import to editor'}
          </button>
        ))}
      </div>

      <div style={{ padding: 20 }}>
        {!analysis ? (
          <>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              {mode === 'decode'
                ? 'Upload a document and I\'ll explain it in plain English, pull out key facts, and answer your questions.'
                : 'Upload a PDF to extract the text into your editor.'}
            </p>

            {/* Upload area */}
            <div
              style={{ border: '2px dashed #cbd5e1', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', marginBottom: 12 }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setSelectedFile(f); handleUpload(f); } }}
            >
              {selectedFile ? (
                <p style={{ fontSize: 14, color: '#334155' }}>📄 {selectedFile.name}</p>
              ) : (
                <>
                  <p style={{ fontSize: 24, marginBottom: 8 }}>📤</p>
                  <p style={{ fontSize: 14, color: '#64748b' }}>
                    Click to upload or drag &amp; drop<br />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{mode === 'decode' ? 'PDF, DOCX, JPG, PNG' : 'PDF only'}</span>
                  </p>
                </>
              )}
            </div>

            <input ref={fileRef} type="file" accept={accept} style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); handleUpload(f); } }} />

            {/* Camera button — mobile decode only */}
            {isMobile && mode === 'decode' && (
              <>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontSize: 14, cursor: 'pointer', marginBottom: 12 }}
                >
                  📷 Scan with camera
                </button>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); handleUpload(f); } }} />
              </>
            )}

            {progress && <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>{progress}</p>}
            {running && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>This may take up to 30 seconds…</p>}
            {error && (
              <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626', marginTop: 8 }}>
                {error}
              </div>
            )}
          </>
        ) : (
          /* ── Decoder result panel ── */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#0369a1' }}>Document Decoder</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{analysis.documentType}</h3>
              </div>
              <button type="button" onClick={reset} style={{ fontSize: 12, color: '#64748b', background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                ← New document
              </button>
            </div>

            {/* Summary */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: '#0c4a6e', lineHeight: 1.6, margin: 0 }}>{analysis.summary}</p>
            </div>

            {/* Key facts */}
            {analysis.keyFacts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', marginBottom: 8 }}>Key facts</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                  {analysis.keyFacts.map((f, i) => (
                    <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 2px', fontWeight: 500 }}>{f.label}</p>
                      <p style={{ fontSize: 14, color: '#0f172a', margin: 0, fontWeight: 600 }}>{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions required */}
            {analysis.actionsRequired.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Action needed</p>
                {analysis.actionsRequired.map((a, i) => (
                  <p key={i} style={{ fontSize: 14, color: '#78350f', margin: '0 0 4px', paddingLeft: 12, borderLeft: '3px solid #f59e0b' }}>{a}</p>
                ))}
              </div>
            )}

            {/* Import to editor button */}
            <button
              type="button"
              onClick={() => { onTextAction(docText); reset(); }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
            >
              📥 Import full text to editor
            </button>

            {/* Chat */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Ask a question</p>

              {/* Suggested questions */}
              {chatMsgs.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {analysis.suggestedQuestions.map((q, i) => (
                    <button key={i} type="button" onClick={() => sendChat(q)}
                      style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontSize: 13, cursor: 'pointer' }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat messages */}
              {chatMsgs.length > 0 && (
                <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMsgs.map((m, i) => (
                    <div key={i} style={{
                      padding: '10px 12px', borderRadius: 8, fontSize: 14, lineHeight: 1.6, maxWidth: '90%',
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      background: m.role === 'user' ? '#0369a1' : '#f1f5f9',
                      color: m.role === 'user' ? '#fff' : '#0f172a',
                    }}>
                      {m.content}
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, background: '#f1f5f9', color: '#64748b', alignSelf: 'flex-start' }}>
                      Thinking…
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              )}

              {/* Input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
                  placeholder="Ask anything about this document…"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                  disabled={chatLoading}
                />
                <button
                  type="button"
                  onClick={() => sendChat(chatInput)}
                  disabled={chatLoading || !chatInput.trim()}
                  style={{ padding: '10px 16px', borderRadius: 8, background: '#0369a1', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: chatLoading || !chatInput.trim() ? 0.5 : 1 }}
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
