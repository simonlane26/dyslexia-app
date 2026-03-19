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

  // ── Compose Overlay — Gmail, Outlook, Slack, Teams ────────────────────────

  const COMPOSE_PANEL_ID = 'dw-compose-panel';
  const CHECK_API = 'https://www.dyslexiawrite.com/api/check-message';
  const TONE_API  = 'https://www.dyslexiawrite.com/api/tone-check';

  // ── Platform detection ──────────────────────────────────────────────────────

  function detectPlatform() {
    const h = location.hostname;
    if (h.includes('mail.google.com'))                                   return 'gmail';
    if (h.includes('outlook.live.com') || h.includes('outlook.office')) return 'outlook';
    if (h.includes('slack.com'))                                         return 'slack';
    if (h.includes('teams.microsoft.com'))                               return 'teams';
    return null;
  }

  const COMPOSE_SELECTORS = {
    gmail:   'div[aria-label="Message Body"][contenteditable="true"]',
    outlook: 'div[aria-label*="Message body"][contenteditable="true"]',
    slack:   'div.ql-editor[contenteditable="true"]',
    teams:   'div[data-tid="ckeditor"][contenteditable="true"]',
  };

  // ── Local pre-filter ────────────────────────────────────────────────────────

  const HOMOPHONES = {
    'their': { check: ctx => /their (is|are|was|were|has|have)\b/.test(ctx), fix: 'there'  },
    'there': { check: ctx => /there (car|house|book|phone|dog|friend|family)\b/.test(ctx), fix: 'their' },
    'your':  { check: ctx => /\byour (going|welcome|right|wrong|sure)\b/.test(ctx),         fix: "you're" },
    'its':   { check: ctx => /\bits (been|not|a |the |going|very|really)\b/.test(ctx),      fix: "it's"  },
    'to':    { check: ctx => /\bto (much|many|late|early|soon)\b/.test(ctx),                fix: 'too'   },
    'then':  { check: ctx => /\b(more|less|bigger|better|worse) then\b/.test(ctx),          fix: 'than'  },
    'were':  { check: ctx => /\bwere (going|is|you)\b/.test(ctx),                           fix: "we're" },
    'of':    { check: ctx => /\b(could|would|should|might) of\b/.test(ctx),                 fix: 'have'  },
  };

  const MISSPELLINGS = [
    ['becuse','because'], ['becaus','because'], ['wich','which'], ['thort','thought'],
    ['wensday','Wednesday'], ['wendnesday','Wednesday'], ['feburary','February'],
    ['definately','definitely'], ['definate','definite'], ['seperate','separate'],
    ['occured','occurred'], ['recieve','receive'], ['neccessary','necessary'],
    ['accomodate','accommodate'], ['tomorow','tomorrow'], ['tommorow','tomorrow'],
    ['beleive','believe'], ['wierd','weird'], ['untill','until'], ['alot','a lot'],
    ['goverment','government'], ['enviroment','environment'], ['collegue','colleague'],
    ['calender','calendar'], ['truely','truly'], ['arguement','argument'],
    ['basicaly','basically'], ['probaly','probably'], ['supose','suppose'],
    ['writting','writing'], ['begining','beginning'], ['comming','coming'],
  ];

  function localPreFilter(text) {
    const results = [];
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);

    words.forEach((word, idx) => {
      const entry = HOMOPHONES[word];
      if (!entry) return;
      const ctx = words.slice(Math.max(0, idx - 4), idx + 5).join(' ');
      if (entry.check(ctx)) {
        results.push({ original: text.split(/\s+/)[idx], suggestion: entry.fix, reason: 'Common mix-up', source: 'local' });
      }
    });

    for (const [wrong, right] of MISSPELLINGS) {
      const re = new RegExp(`\\b${wrong}\\b`, 'gi');
      let m;
      while ((m = re.exec(text)) !== null) {
        results.push({ original: m[0], suggestion: right, reason: 'Spelling', source: 'local' });
      }
    }

    return results;
  }

  // ── Pattern learning ────────────────────────────────────────────────────────

  function getPatterns() {
    return new Promise(resolve =>
      chrome.storage.local.get('dw_user_patterns', d => resolve(d.dw_user_patterns || []))
    );
  }

  function logCorrection(original, correction) {
    getPatterns().then(patterns => {
      const existing = patterns.find(p => p.original === original.toLowerCase());
      if (existing) {
        existing.frequency = (existing.frequency || 1) + 1;
        existing.lastSeen = Date.now();
      } else {
        patterns.push({ original: original.toLowerCase(), correction: correction.toLowerCase(), frequency: 1, lastSeen: Date.now() });
      }
      // Keep only the 50 most-frequent patterns
      patterns.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
      chrome.storage.local.set({ dw_user_patterns: patterns.slice(0, 50) });
    });
  }

  // ── Apply a fix to a contenteditable area ──────────────────────────────────

  function applyFix(original, fix, area) {
    const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
    const re = new RegExp(escapeRegex(original), 'i');
    let node;
    while ((node = walker.nextNode())) {
      if (re.test(node.textContent)) {
        node.textContent = node.textContent.replace(re, fix);
        area.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── Compose suggestion panel ────────────────────────────────────────────────

  function removeComposePanel() {
    document.getElementById(COMPOSE_PANEL_ID)?.remove();
  }

  function showComposePanel(suggestions, area, token) {
    removeComposePanel();
    if (suggestions.length === 0) return;

    const panel = document.createElement('div');
    panel.id = COMPOSE_PANEL_ID;
    Object.assign(panel.style, {
      position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
      zIndex: '2147483647', background: 'white', borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.16)', fontFamily: 'Arial, sans-serif',
      fontSize: '13px', width: '360px', border: '1px solid #e2e8f0',
      animation: 'dw-fadein 0.2s ease', overflow: 'hidden',
    });

    const sugItems = suggestions.map((s, i) => `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid #f1f5f9;">
        <span style="flex:1;color:#1e293b;">
          <span style="background:#fde68a;padding:1px 4px;border-radius:3px;">${esc(s.original)}</span>
          <span style="color:#94a3b8;margin:0 4px;">→</span>
          <span style="background:#d1fae5;padding:1px 4px;border-radius:3px;font-weight:600;">${esc(s.suggestion)}</span>
          <span style="color:#94a3b8;font-size:11px;margin-left:4px;">${esc(s.reason || '')}</span>
        </span>
        <button type="button" data-idx="${i}"
          style="background:#7c3aed;color:white;border:none;border-radius:5px;padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;">
          Fix
        </button>
      </div>
    `).join('');

    panel.innerHTML = `
      <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
        <span style="color:white;font-weight:700;font-size:13px;">✍️ ${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''}</span>
        <div style="display:flex;gap:6px;">
          <button id="dw-comp-tone" type="button"
            style="background:rgba(255,255,255,0.2);border:none;color:white;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:12px;">
            Check tone
          </button>
          <button id="dw-comp-close" type="button"
            style="background:rgba(255,255,255,0.15);border:none;color:white;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:12px;">
            ✕
          </button>
        </div>
      </div>
      <div id="dw-comp-suggestions">${sugItems}</div>
      <div style="padding:8px 14px;background:#f8fafc;display:flex;gap:6px;justify-content:flex-end;">
        <button id="dw-comp-fix-all" type="button"
          style="background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;border:none;border-radius:6px;padding:5px 14px;font-size:12px;font-weight:700;cursor:pointer;">
          Fix all
        </button>
        <button id="dw-comp-dismiss" type="button"
          style="background:#e2e8f0;color:#475569;border:none;border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;">
          Dismiss
        </button>
      </div>
      <div id="dw-tone-result" style="display:none;"></div>
    `;

    document.body.appendChild(panel);

    // Individual fix buttons
    panel.querySelectorAll('[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = suggestions[Number(btn.dataset.idx)];
        if (applyFix(s.original, s.suggestion, area)) {
          logCorrection(s.original, s.suggestion);
          btn.closest('div').remove();
          // Update header count
          const remaining = panel.querySelectorAll('[data-idx]').length;
          if (remaining === 0) removeComposePanel();
          else panel.querySelector('span[style*="font-weight:700"]').textContent =
            `✍️ ${remaining} suggestion${remaining > 1 ? 's' : ''}`;
        }
      });
    });

    // Fix all
    panel.querySelector('#dw-comp-fix-all').addEventListener('click', () => {
      suggestions.forEach(s => {
        if (applyFix(s.original, s.suggestion, area)) logCorrection(s.original, s.suggestion);
      });
      removeComposePanel();
    });

    // Dismiss
    panel.querySelector('#dw-comp-dismiss').addEventListener('click', removeComposePanel);
    panel.querySelector('#dw-comp-close').addEventListener('click', removeComposePanel);

    // Tone check
    panel.querySelector('#dw-comp-tone').addEventListener('click', async () => {
      const toneBtn = panel.querySelector('#dw-comp-tone');
      toneBtn.textContent = '…';
      toneBtn.disabled = true;
      try {
        const text = area.innerText.trim();
        const res = await fetch(TONE_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ text }),
        });
        const data = await res.json();
        showToneResult(data, area, panel);
      } catch {
        toneBtn.textContent = 'Check tone';
        toneBtn.disabled = false;
      }
    });
  }

  function showToneResult(result, area, panel) {
    const { confidence, summary, suggestion, rewrite } = result || {};
    const colors = {
      'sounds great':        { bg: '#d1fae5', text: '#065f46', icon: '✓' },
      'mostly good':         { bg: '#fef3c7', text: '#92400e', icon: '~' },
      'might need adjusting':{ bg: '#fee2e2', text: '#991b1b', icon: '!' },
    };
    const c = colors[confidence] || colors['mostly good'];

    const toneDiv = panel.querySelector('#dw-tone-result');
    toneDiv.style.cssText = `display:block;padding:10px 14px;background:${c.bg};color:${c.text};font-size:13px;line-height:1.5;border-top:1px solid rgba(0,0,0,0.06);`;
    toneDiv.innerHTML = `
      <div style="font-weight:600;margin-bottom:4px;">${c.icon} ${esc(summary || '')}</div>
      ${suggestion ? `<div style="opacity:0.8;font-size:12px;margin-bottom:8px;">${esc(suggestion)}</div>` : ''}
      ${rewrite ? `
        <div style="display:flex;gap:6px;">
          <button id="dw-use-rewrite" type="button"
            style="background:${c.text};color:white;border:none;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;">
            Use friendlier version
          </button>
          <button id="dw-keep-mine" type="button"
            style="background:transparent;border:none;color:${c.text};font-size:12px;cursor:pointer;">
            Keep mine
          </button>
        </div>` : ''}
    `;

    if (rewrite) {
      toneDiv.querySelector('#dw-use-rewrite').addEventListener('click', () => {
        area.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(area);
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('insertText', false, rewrite);
        removeComposePanel();
      });
      toneDiv.querySelector('#dw-keep-mine').addEventListener('click', () => {
        toneDiv.style.display = 'none';
      });
    }
  }

  // ── Compose area attachment ─────────────────────────────────────────────────

  function attachToCompose(area, token) {
    if (area.dataset.dwCompose) return;
    area.dataset.dwCompose = 'true';

    let debounceTimer = null;
    let lastChecked = '';

    area.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const text = area.innerText.trim();
        if (text === lastChecked || text.length < 20) return;
        lastChecked = text;

        // 1. Local pre-filter (instant)
        const patterns = await getPatterns();
        let suggestions = localPreFilter(text);

        // Build a set of already-found originals to avoid dupes
        const found = new Set(suggestions.map(s => s.original.toLowerCase()));

        // 2. AI check for anything local didn't catch
        try {
          const res = await fetch(CHECK_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ text, userPatterns: patterns.slice(0, 10) }),
          });
          if (res.ok) {
            const data = await res.json();
            for (const s of (data.suggestions || [])) {
              if (!found.has(s.original.toLowerCase())) {
                suggestions.push(s);
                found.add(s.original.toLowerCase());
              }
            }
          }
        } catch { /* network error — local results are enough */ }

        if (suggestions.length > 0) showComposePanel(suggestions, area, token);
        else removeComposePanel();
      }, 1500);
    });

    // Remove panel when compose area is removed
    new MutationObserver((_, obs) => {
      if (!document.body.contains(area)) {
        removeComposePanel();
        obs.disconnect();
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ── Watch for compose windows appearing ────────────────────────────────────

  function watchForCompose(platform, token) {
    const selector = COMPOSE_SELECTORS[platform];
    if (!selector) return;

    // Check existing elements
    document.querySelectorAll(selector).forEach(el => attachToCompose(el, token));

    // Watch for new ones
    new MutationObserver(() => {
      document.querySelectorAll(selector).forEach(el => attachToCompose(el, token));
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ── Start compose monitoring if on a supported platform ────────────────────
  const platform = detectPlatform();
  if (platform) {
    chrome.storage.local.get('dw_token', ({ dw_token }) => {
      watchForCompose(platform, dw_token || null);
    });
  }

})();
