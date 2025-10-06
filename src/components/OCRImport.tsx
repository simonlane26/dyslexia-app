'use client';

import { useRef, useState } from 'react';

export type OCRProps = { onTextAction: (text: string) => void };

/** Load pdf.js UMD build from CDN and return window.pdfjsLib */
async function ensurePdfjsFromCdn() {
  if (typeof window === 'undefined') throw new Error('pdf.js needs a browser');
  const w = window as any;

  // Already loaded?
  if (w.pdfjsLib?.getDocument) return w.pdfjsLib;

  // Inject the UMD script (non-module), which exposes window.pdfjsLib
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load pdf.js from CDN'));
    document.head.appendChild(s);
  });

  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib?.getDocument) {
    throw new Error('pdf.js did not expose pdfjsLib');
  }

  // Point to matching worker on the same CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  return pdfjsLib;
}

export default function OCRImport({ onTextAction }: OCRProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const MAX_PAGES = 20; // cap during testing
  const OCR_SCALE = 2;

  async function handleImport() {
    setErrorMsg('');
    const file = selectedFile || fileRef.current?.files?.[0];
    if (!file) return;

    setProgress('Loading PDF…');
    setRunning(true);

    try {
      // ✅ Load pdf.js from CDN (no webpack/SSR issues)
      const pdfjsLib: any = await ensurePdfjsFromCdn();
      // ✅ Load Tesseract dynamically
      const { createWorker, PSM } = await import('tesseract.js');

      // Read as typed array for pdf.js
      const uint8 = new Uint8Array(await file.arrayBuffer());
      const loadingTask = pdfjsLib.getDocument({ data: uint8 });
      const pdf = await loadingTask.promise;
      const numPages: number = pdf.numPages;

      // ---- Fast path: embedded text (no OCR) ----
      setProgress('Checking for embedded text…');
      let quickText = '';
      const quickPages = Math.min(numPages, 3);
      for (let i = 1; i <= quickPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        const pageText = (tc.items as any[])
          .map((it) => (typeof it.str === 'string' ? it.str : ''))
          .join(' ')
          .trim();
        quickText += pageText + '\n\n';
      }

      if (quickText.replace(/\s+/g, '').length > 200) {
        setProgress('Extracting embedded text (no OCR)…');
        let allText = '';
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          const pageText = (tc.items as any[])
            .map((it) => (typeof it.str === 'string' ? it.str : ''))
            .join(' ')
            .replace(/[ \t]+\n/g, '\n')
            .trim();
          allText += pageText + '\n\n';
        }
        setProgress('Done (no OCR needed).');
        onTextAction(allText.trim());
        setRunning(false);
        return;
      }

      // ---- OCR path: Tesseract per page ----
      setProgress('Starting OCR worker…');
      const worker = await createWorker('eng', 1, {
        workerPath: 'https://unpkg.com/tesseract.js@5/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        logger: (m: any) => {
          if (m?.status === 'recognizing text') {
            setProgress(`OCR ${Math.round((m.progress || 0) * 100)}% (current page)`);
          }
        },
      });
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });

      let fullText = '';
      const pagesToProcess = Math.min(numPages, MAX_PAGES);

      for (let i = 1; i <= pagesToProcess; i++) {
        setProgress(`Rendering page ${i}/${pagesToProcess}…`);
        const page = await pdf.getPage(i);

        const viewport = page.getViewport({ scale: OCR_SCALE });
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        if (!ctx) throw new Error('Canvas 2D context not available');

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Render page to canvas
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

        setProgress(`Running OCR on page ${i}/${pagesToProcess}…`);
        const { data } = await worker.recognize(canvas as unknown as HTMLCanvasElement);
        fullText += (data.text || '') + '\n\n';
      }

      await worker.terminate();

      if (numPages > MAX_PAGES) {
        fullText += `\n\n[Note: OCR truncated to first ${MAX_PAGES} pages for speed during testing.]`;
      }

      setProgress('Done (OCR).');
      onTextAction(fullText.trim());
    } catch (e: any) {
      console.error('OCR Import error:', e);
      const message =
        e?.message ||
        e?.toString?.() ||
        'Failed to OCR this file. It might be encrypted or too large.';
      setErrorMsg(message);
      setProgress('Failed. See error below.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-4 border rounded-xl bg-white/70">
      <h3 className="mb-2 font-semibold">📥 Import Scanned PDF</h3>

      <input
        type="file"
        ref={fileRef}
        accept="application/pdf,.pdf"
        className="block mb-3"
        disabled={running}
        onChange={(e) => {
          setSelectedFile(e.target.files?.[0] ?? null);
          setErrorMsg('');
          setProgress('');
        }}
      />

      <button
        type="button"
        onClick={handleImport}
        disabled={running || !selectedFile}
        className="px-4 py-2 text-white bg-blue-600 rounded-lg disabled:opacity-60"
      >
        {running ? 'Processing…' : 'Import Document'}
      </button>

      {progress && <div className="mt-3 text-sm text-slate-600">{progress}</div>}
      {errorMsg && (
        <div className="p-2 mt-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
          {errorMsg}
        </div>
      )}
      <div className="mt-2 text-xs text-slate-500">
              </div>
    </div>
  );
}
