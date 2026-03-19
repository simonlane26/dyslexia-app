(() => {
  const PANEL_ID   = 'dw-simplify-panel';
  const OVERLAY_ID = 'dw-progress-overlay';
  const TOGGLE_ID  = 'dw-page-toggle';
  const API_URL    = 'https://www.dyslexiawrite.com/api/simplify-page';

  // ── Right-click selection panel (existing) ─────────────────────────────────

  function removePanel() {
    document.getElementById(PANEL_ID)?.remove();
  }

  function showPanel(html, simplified, original) {
    removePanel();
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = html;
    Object.assign(panel.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '2147483647',
      width: '340px', background: 'white', borderRadius: '14px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)', fontFamily: 'Arial, sans-serif',
      fontSize: '14px', overflow: 'hidden', border: '1px solid #e2e8f0',
    });
    document.body.appendChild(panel);

    panel.querySelector('#dw-close')?.addEventListener('click', removePanel);

    panel.querySelector('#dw-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(simplified).then(() => {
        const btn = panel.querySelector('#dw-copy');
        if (btn) { btn.textContent = 'Copied!'; btn.style.background = '#16a34a'; }
        setTimeout(() => { if (btn) { btn.textContent = 'Copy'; btn.style.background = '#7c3aed'; } }, 2000);
      });
    });

    panel.querySelector('#dw-replace')?.addEventListener('click', () => {
      const active = document.activeElement;
      if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
        const start = active.selectionStart, end = active.selectionEnd;
        active.value = active.value.slice(0, start) + simplified + active.value.slice(end);
        active.selectionStart = active.selectionEnd = start + simplified.length;
        active.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (active?.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          sel.deleteFromDocument();
          sel.getRangeAt(0).insertNode(document.createTextNode(simplified));
          sel.collapseToEnd();
        }
      } else {
        navigator.clipboard.writeText(simplified);
      }
      removePanel();
    });
  }

  // ── Page simplification ─────────────────────────────────────────────────────

  const pageState = {
    hasRun: false,
    isShowingSimplified: true,
    blocks: [], // { element, originalHTML, simplifiedText }
  };

  function detectPageType() {
    const url = location.href.toLowerCase();
    const sample = (document.body.innerText || '').toLowerCase().slice(0, 5000);
    if (url.includes('gov.uk') || url.includes('.gov.') || url.includes('council.')) return 'government';
    if (url.includes('nhs.uk') || sample.includes('your gp') || sample.includes('prescription')) return 'medical';
    if (sample.includes('tenancy') || sample.includes('section 21') || sample.includes('landlord')) return 'legal';
    if (sample.includes('apr') || sample.includes('mortgage') || sample.includes('interest rate')) return 'financial';
    return 'general';
  }

  function needsSimplification(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 8) return false;
    const avgWordLen = words.reduce((s, w) => s + w.replace(/[^a-zA-Z]/g, '').length, 0) / words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const avgSentLen = words.length / Math.max(sentences.length, 1);
    return avgWordLen > 5.5 || avgSentLen > 16;
  }

  function findTextBlocks() {
    const seen = new Set();
    const blocks = [];
    document.querySelectorAll('p, li, h2, h3, h4, td, th, blockquote, dd, figcaption').forEach(el => {
      if (seen.has(el)) return;
      if (el.dataset.dwProcessed) return;
      if (el.closest('script, style, code, pre, nav, header, footer, [role="navigation"], [role="banner"], [role="menubar"], form, noscript')) return;
      const text = (el.innerText || '').trim();
      if (text.length < 50) return;
      if (!needsSimplification(text)) return;
      seen.add(el);
      blocks.push({ element: el, text, originalHTML: el.innerHTML, simplifiedText: null });
    });
    return blocks;
  }

  function chunkBlocks(blocks) {
    const chunks = [];
    let current = [], wordCount = 0;
    for (const b of blocks) {
      const wc = b.text.split(/\s+/).length;
      if (wordCount + wc > 600 && current.length > 0) {
        chunks.push(current);
        current = [];
        wordCount = 0;
      }
      current.push(b);
      wordCount += wc;
    }
    if (current.length > 0) chunks.push(current);
    return chunks;
  }

  // Cache helpers
  function getCached(key) {
    return new Promise(resolve => chrome.storage.local.get(key, d => resolve(d[key] || null)));
  }
  function setCached(key, value) {
    return new Promise(resolve => chrome.storage.local.set({ [key]: value }, resolve));
  }
  async function hashText(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function simplifyChunk(chunk, token, level, pageType) {
    // Check cache first
    const cacheKeys = await Promise.all(chunk.map(b => hashText(b.text + ':level' + level)));
    const cached = await Promise.all(cacheKeys.map(k => getCached('dw_cache_' + k)));

    if (cached.every(Boolean)) return cached;

    // Build marked text for API
    const text = chunk.map((b, i) => `[P${i}]\n${b.text}`).join('\n\n');

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text, level, pageType }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error ${res.status}`);
    }

    const data = await res.json();
    const results = data.simplified || [];

    // Write cache
    await Promise.all(results.map((r, i) => {
      if (r && cacheKeys[i]) return setCached('dw_cache_' + cacheKeys[i], r);
    }));

    return results;
  }

  // ── Progress overlay ────────────────────────────────────────────────────────

  function showOverlay(msg) {
    document.getElementById(OVERLAY_ID)?.remove();
    if (!document.getElementById('dw-anim')) {
      const s = document.createElement('style');
      s.id = 'dw-anim';
      s.textContent = '@keyframes dw-spin{to{transform:rotate(360deg)}} @keyframes dw-fadein{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);
    }
    const el = document.createElement('div');
    el.id = OVERLAY_ID;
    Object.assign(el.style, {
      position: 'fixed', top: '16px', right: '16px', zIndex: '2147483647',
      background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white',
      padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
      fontFamily: 'Arial, sans-serif', fontWeight: '600',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)', display: 'flex',
      alignItems: 'center', gap: '10px', animation: 'dw-fadein 0.2s ease',
    });
    el.innerHTML = `<span style="display:inline-block;animation:dw-spin 0.8s linear infinite;font-size:15px;">⟳</span><span id="dw-overlay-msg">${esc(msg)}</span>`;
    document.body.appendChild(el);
  }

  function updateOverlay(msg) {
    const el = document.getElementById('dw-overlay-msg');
    if (el) el.textContent = msg;
  }

  function hideOverlay() {
    document.getElementById(OVERLAY_ID)?.remove();
  }

  // ── Apply / restore simplified text ────────────────────────────────────────

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function applySimplified(block, text) {
    block.simplifiedText = text;
    block.element.dataset.dwProcessed = 'true';
    // Render line breaks as separate spans
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length > 1) {
      block.element.innerHTML = lines.map(l => `<span style="display:block;margin-bottom:0.4em">${esc(l)}</span>`).join('');
    } else {
      block.element.innerText = text;
    }
    block.element.style.borderLeft = '3px solid #22c55e';
    block.element.style.paddingLeft = '10px';
    block.element.style.transition = 'border-left 0.3s,padding-left 0.3s';
  }

  function restoreOriginal(block) {
    block.element.innerHTML = block.originalHTML;
    block.element.style.borderLeft = '';
    block.element.style.paddingLeft = '';
  }

  // ── Simplified / Original toggle bar ───────────────────────────────────────

  function showToggleBar(blockCount) {
    document.getElementById(TOGGLE_ID)?.remove();

    const bar = document.createElement('div');
    bar.id = TOGGLE_ID;
    Object.assign(bar.style, {
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      zIndex: '2147483647', background: 'white', borderRadius: '28px',
      padding: '6px 8px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: '4px',
      border: '1px solid #e2e8f0', fontFamily: 'Arial, sans-serif',
      animation: 'dw-fadein 0.2s ease',
    });

    bar.innerHTML = `
      <button id="dw-btn-simplified"
        style="padding:7px 16px;border-radius:20px;border:none;background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;font-size:12px;font-weight:700;cursor:pointer;transition:opacity 0.15s;">
        ✨ Simplified
      </button>
      <button id="dw-btn-original"
        style="padding:7px 16px;border-radius:20px;border:none;background:transparent;color:#94a3b8;font-size:12px;font-weight:600;cursor:pointer;transition:opacity 0.15s;">
        Original
      </button>
      <span style="font-size:11px;color:#cbd5e1;padding:0 4px 0 2px;">${blockCount} blocks</span>
      <button id="dw-btn-dismiss"
        style="padding:5px 9px;border-radius:20px;border:none;background:transparent;color:#94a3b8;font-size:13px;cursor:pointer;">
        ✕
      </button>
    `;
    document.body.appendChild(bar);

    const BG_ON  = 'padding:7px 16px;border-radius:20px;border:none;background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;font-size:12px;font-weight:700;cursor:pointer;';
    const BG_OFF = 'padding:7px 16px;border-radius:20px;border:none;background:transparent;color:#94a3b8;font-size:12px;font-weight:600;cursor:pointer;';

    document.getElementById('dw-btn-original').addEventListener('click', () => {
      if (!pageState.isShowingSimplified) return;
      pageState.blocks.forEach(b => restoreOriginal(b));
      pageState.isShowingSimplified = false;
      document.getElementById('dw-btn-original').style.cssText = BG_ON;
      document.getElementById('dw-btn-simplified').style.cssText = BG_OFF;
    });

    document.getElementById('dw-btn-simplified').addEventListener('click', () => {
      if (pageState.isShowingSimplified) return;
      pageState.blocks.forEach(b => { if (b.simplifiedText) applySimplified(b, b.simplifiedText); });
      pageState.isShowingSimplified = true;
      document.getElementById('dw-btn-simplified').style.cssText = BG_ON;
      document.getElementById('dw-btn-original').style.cssText = BG_OFF;
    });

    document.getElementById('dw-btn-dismiss').addEventListener('click', () => bar.remove());
  }

  // ── Main page simplify ──────────────────────────────────────────────────────

  async function simplifyPage(token, level) {
    // Re-show if already run
    if (pageState.hasRun) {
      pageState.blocks.forEach(b => { if (b.simplifiedText) applySimplified(b, b.simplifiedText); });
      pageState.isShowingSimplified = true;
      showToggleBar(pageState.blocks.filter(b => b.simplifiedText).length);
      return;
    }

    const blocks = findTextBlocks();
    if (blocks.length === 0) {
      showOverlay('Nothing to simplify on this page.');
      setTimeout(hideOverlay, 3000);
      return;
    }

    const pageType = detectPageType();
    const chunks = chunkBlocks(blocks);
    pageState.blocks = blocks;

    showOverlay(`Simplifying… 0 / ${chunks.length}`);

    let done = 0;
    let simplified = 0;

    await Promise.all(chunks.map(async (chunk) => {
      try {
        const results = await simplifyChunk(chunk, token, level, pageType);
        chunk.forEach((block, j) => {
          if (results[j]) { applySimplified(block, results[j]); simplified++; }
        });
      } catch (e) {
        console.warn('[DyslexiaWrite]', e);
      } finally {
        done++;
        updateOverlay(`Simplifying… ${done} / ${chunks.length}`);
      }
    }));

    pageState.hasRun = true;
    hideOverlay();
    if (simplified > 0) showToggleBar(simplified);
  }

  // ── Message listener ────────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg) => {

    // Existing: right-click selection simplify
    if (msg.type === 'DW_SIMPLIFY_START') {
      showPanel(`
        <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
          <span style="color:white;font-weight:700;font-size:13px;">✨ Dyslexia Write</span>
          <button id="dw-close" style="background:rgba(255,255,255,0.2);border:none;color:white;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:12px;">✕</button>
        </div>
        <div style="padding:16px;color:#64748b;font-size:13px;">Simplifying…</div>
      `);
    }

    if (msg.type === 'DW_SIMPLIFY_RESULT') {
      const safe = esc(msg.simplified);
      showPanel(`
        <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
          <span style="color:white;font-weight:700;font-size:13px;">✨ Dyslexia Write</span>
          <button id="dw-close" style="background:rgba(255,255,255,0.2);border:none;color:white;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:12px;">✕</button>
        </div>
        <div style="padding:14px 16px;">
          <div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Simplified</div>
          <div style="font-size:14px;line-height:1.7;color:#1e293b;margin-bottom:14px;">${safe}</div>
          <div style="display:flex;gap:8px;">
            <button id="dw-replace" style="flex:1;background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;border:none;border-radius:8px;padding:9px;font-size:13px;font-weight:600;cursor:pointer;">Replace selection</button>
            <button id="dw-copy" style="background:#7c3aed;color:white;border:none;border-radius:8px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;">Copy</button>
          </div>
        </div>
      `, msg.simplified, msg.original);
    }

    if (msg.type === 'DW_SIMPLIFY_ERROR') {
      showPanel(`
        <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
          <span style="color:white;font-weight:700;font-size:13px;">✨ Dyslexia Write</span>
          <button id="dw-close" style="background:rgba(255,255,255,0.2);border:none;color:white;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:12px;">✕</button>
        </div>
        <div style="padding:14px 16px;color:#dc2626;font-size:13px;">${esc(msg.message)}</div>
      `);
    }

    // New: whole-page simplify (triggered from popup or background context menu)
    if (msg.type === 'DW_SIMPLIFY_PAGE') {
      simplifyPage(msg.token, msg.level || 2).catch(e => {
        hideOverlay();
        showOverlay('Error: ' + (e?.message || 'Something went wrong'));
        setTimeout(hideOverlay, 4000);
      });
    }

  });

})();
