// ── Elements ──
const editor    = document.getElementById('editor');
const fontSelect = document.getElementById('fontSelect');
const sizeUp    = document.getElementById('sizeUp');
const sizeDown  = document.getElementById('sizeDown');
const sizeValue = document.getElementById('sizeValue');
const swatches  = document.querySelectorAll('.swatch');
const readBtn        = document.getElementById('readBtn');
const simplifyBtn    = document.getElementById('simplifyBtn');
const simplifyPanel  = document.getElementById('simplifyPanel');
const simplifyResult = document.getElementById('simplifyResult');
const simplifyApply  = document.getElementById('simplifyApply');
const simplifyClose  = document.getElementById('simplifyClose');
const rewriteBtn     = document.getElementById('rewriteBtn');
const rewritePanel   = document.getElementById('rewritePanel');
const rewriteCards   = document.getElementById('rewriteCards');
const rewriteClose   = document.getElementById('rewriteClose');
const clearBtn       = document.getElementById('clearBtn');
const wordCount = document.getElementById('wordCount');
const saveStatus = document.getElementById('saveStatus');
const authStatus   = document.getElementById('authStatus');
const connectPanel = document.getElementById('connectPanel');
const tokenInput   = document.getElementById('tokenInput');
const connectBtn   = document.getElementById('connectBtn');
const connectClose = document.getElementById('connectClose');
const connectError = document.getElementById('connectError');

// ── State ──
let fontSize   = 17;
let bgColor    = '#fdf6e3';
let fontFamily = 'Arial, Helvetica, sans-serif';
let isReading  = false;
let saveTimer  = null;
let authToken  = null;

// ── Auth helpers ──
function updateAuthUI() {
  if (authToken) {
    authStatus.textContent = 'Connected';
    authStatus.style.color = 'rgba(167,243,208,0.9)';
  } else {
    authStatus.textContent = 'Not connected';
    authStatus.style.color = 'rgba(255,255,255,0.5)';
  }
}

connectBtn.addEventListener('click', () => {
  const val = tokenInput.value.trim();
  if (!val) { showConnectError('Paste your token first.'); return; }
  // Basic JWT shape check (three dot-separated parts)
  if (val.split('.').length !== 3) { showConnectError('That doesn\'t look like a valid token.'); return; }
  authToken = val;
  chrome.storage.local.set({ dw_token: val }, () => {
    connectPanel.style.display = 'none';
    tokenInput.value = '';
    connectError.style.display = 'none';
    updateAuthUI();
  });
});

connectClose.addEventListener('click', () => {
  connectPanel.style.display = 'none';
  connectError.style.display = 'none';
});

function showConnectError(msg) {
  connectError.textContent = msg;
  connectError.style.display = 'block';
}

// ── Load saved settings + draft ──
chrome.storage.local.get(['dw_draft', 'dw_fontSize', 'dw_bgColor', 'dw_fontFamily', 'dw_token'], (data) => {
  if (data.dw_draft)      editor.value = data.dw_draft;
  if (data.dw_fontSize)   { fontSize = data.dw_fontSize; applyFontSize(); }
  if (data.dw_bgColor)    { bgColor = data.dw_bgColor; applyBgColor(); }
  if (data.dw_fontFamily) { fontFamily = data.dw_fontFamily; applyFont(); }
  if (data.dw_token)      { authToken = data.dw_token; }
  updateWordCount();
  updateAuthUI();
});

// ── Font ──
fontSelect.addEventListener('change', () => {
  fontFamily = fontSelect.value;
  applyFont();
  save();
});

function applyFont() {
  editor.style.fontFamily = fontFamily;
  // Sync select to current value
  for (let i = 0; i < fontSelect.options.length; i++) {
    if (fontSelect.options[i].value === fontFamily) {
      fontSelect.selectedIndex = i;
      break;
    }
  }
}

// ── Font size ──
sizeUp.addEventListener('click', () => {
  if (fontSize >= 28) return;
  fontSize++;
  applyFontSize();
  save();
});

sizeDown.addEventListener('click', () => {
  if (fontSize <= 12) return;
  fontSize--;
  applyFontSize();
  save();
});

function applyFontSize() {
  editor.style.fontSize = fontSize + 'px';
  sizeValue.textContent = fontSize;
}

// ── Background colour ──
swatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    bgColor = swatch.dataset.color;
    applyBgColor();
    save();
  });
});

function applyBgColor() {
  editor.style.backgroundColor = bgColor;
  // Dark bg needs light text
  editor.style.color = isDark(bgColor) ? '#f1f5f9' : '#1e293b';
  editor.style.caretColor = isDark(bgColor) ? '#f1f5f9' : '#1e293b';
  // Update active swatch
  swatches.forEach(s => {
    s.classList.toggle('active', s.dataset.color === bgColor);
  });
}

function isDark(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0,2),16);
  const g = parseInt(c.substr(2,2),16);
  const b = parseInt(c.substr(4,2),16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}

// ── Word count ──
editor.addEventListener('input', () => {
  updateWordCount();
  scheduleSave();
});

function updateWordCount() {
  const words = editor.value.trim()
    ? editor.value.trim().split(/\s+/).filter(w => w.length > 0).length
    : 0;
  wordCount.textContent = words + (words === 1 ? ' word' : ' words');
}

// ── Auto-save (debounced 1.5s) ──
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 1500);
}

function save() {
  chrome.storage.local.set({
    dw_draft: editor.value,
    dw_fontSize: fontSize,
    dw_bgColor: bgColor,
    dw_fontFamily: fontFamily,
  }, () => {
    showSaved();
  });
}

function showSaved() {
  saveStatus.classList.add('visible');
  clearTimeout(saveStatus._timer);
  saveStatus._timer = setTimeout(() => saveStatus.classList.remove('visible'), 1800);
}

// ── Read aloud ──
readBtn.addEventListener('click', () => {
  if (isReading) {
    window.speechSynthesis.cancel();
    isReading = false;
    readBtn.textContent = '🔊 Read aloud';
    readBtn.classList.remove('active');
    return;
  }

  const text = editor.value.trim();
  if (!text) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-GB';
  utter.rate = 0.9;

  utter.onstart = () => {
    isReading = true;
    readBtn.textContent = '⏹ Stop';
    readBtn.classList.add('active');
    readBtn.classList.remove('primary');
  };

  utter.onend = () => {
    isReading = false;
    readBtn.textContent = '🔊 Read aloud';
    readBtn.classList.remove('active');
    readBtn.classList.add('primary');
  };

  utter.onerror = () => {
    isReading = false;
    readBtn.textContent = '🔊 Read aloud';
    readBtn.classList.remove('active');
    readBtn.classList.add('primary');
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
});

// ── Simplify ──
const API_URL = 'https://www.dyslexiawrite.com/api/simplify';
let lastSimplified = '';

simplifyBtn.addEventListener('click', async () => {
  const text = editor.value.trim();
  if (!text) return;

  if (!authToken) {
    simplifyPanel.style.display = 'none';
    connectPanel.style.display = 'block';
    return;
  }

  simplifyBtn.disabled = true;
  simplifyBtn.textContent = 'Simplifying…';
  simplifyPanel.style.display = 'none';
  connectPanel.style.display = 'none';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        authToken = null;
        chrome.storage.local.remove('dw_token');
        updateAuthUI();
        connectPanel.style.display = 'block';
        return;
      }
      const msg = data?.message || data?.error || 'Something went wrong. Please try again.';
      simplifyResult.textContent = msg;
      simplifyPanel.style.background = '#fef2f2';
      simplifyPanel.style.borderTopColor = '#fecaca';
      simplifyResult.style.color = '#991b1b';
      simplifyApply.style.display = 'none';
      simplifyPanel.style.display = 'block';
      return;
    }

    lastSimplified = data.simplifiedText || '';
    simplifyResult.textContent = lastSimplified;
    simplifyResult.style.color = '#14532d';
    simplifyPanel.style.background = '#f0fdf4';
    simplifyPanel.style.borderTopColor = '#bbf7d0';
    simplifyApply.style.display = '';
    simplifyPanel.style.display = 'block';
  } catch {
    simplifyResult.textContent = 'Could not reach the server. Check your connection.';
    simplifyPanel.style.background = '#fef2f2';
    simplifyPanel.style.borderTopColor = '#fecaca';
    simplifyResult.style.color = '#991b1b';
    simplifyApply.style.display = 'none';
    simplifyPanel.style.display = 'block';
  } finally {
    simplifyBtn.disabled = false;
    simplifyBtn.textContent = '✨ Simplify';
  }
});

simplifyApply.addEventListener('click', () => {
  if (!lastSimplified) return;
  editor.value = lastSimplified;
  updateWordCount();
  save();
  simplifyPanel.style.display = 'none';
  lastSimplified = '';
});

simplifyClose.addEventListener('click', () => {
  simplifyPanel.style.display = 'none';
  lastSimplified = '';
});

// ── Rewrite ──
const REWRITE_URL = 'https://www.dyslexiawrite.com/api/coach/rewrite-sentence';

rewriteBtn.addEventListener('click', async () => {
  const text = editor.value.trim();
  if (!text) return;

  if (!authToken) {
    rewritePanel.style.display = 'none';
    connectPanel.style.display = 'block';
    return;
  }

  rewriteBtn.disabled = true;
  rewriteBtn.textContent = 'Rewriting…';
  rewritePanel.style.display = 'none';
  simplifyPanel.style.display = 'none';
  connectPanel.style.display = 'none';

  try {
    const res = await fetch(REWRITE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ sentence: text }),
    });

    if (res.status === 401) {
      authToken = null;
      chrome.storage.local.remove('dw_token');
      updateAuthUI();
      connectPanel.style.display = 'block';
      return;
    }

    const raw = await res.text();
    let alternatives = [];
    try {
      const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(clean);
      alternatives = parsed.alternatives || [];
    } catch {
      rewriteCards.innerHTML = '<div style="color:#991b1b;font-size:13px;">Could not parse suggestions. Try again.</div>';
      rewritePanel.style.display = 'block';
      return;
    }

    rewriteCards.innerHTML = '';
    alternatives.forEach((alt) => {
      const card = document.createElement('div');
      card.style.cssText = 'background:white;border:1px solid #c7d7fd;border-radius:8px;padding:10px 12px;';
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="font-size:14px;">${alt.icon || '✏️'}</span>
          <span style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.05em;">${(alt.label || '').replace(/</g,'&lt;')}</span>
        </div>
        <div style="font-size:13px;line-height:1.6;color:#1e293b;margin-bottom:8px;">${(alt.text || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
        <button type="button" style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;border:none;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;">Use this</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        editor.value = alt.text;
        updateWordCount();
        save();
        rewritePanel.style.display = 'none';
      });
      rewriteCards.appendChild(card);
    });

    rewritePanel.style.display = 'block';
  } catch {
    rewriteCards.innerHTML = '<div style="color:#991b1b;font-size:13px;">Could not reach the server. Check your connection.</div>';
    rewritePanel.style.display = 'block';
  } finally {
    rewriteBtn.disabled = false;
    rewriteBtn.textContent = '✏️ Rewrite';
  }
});

rewriteClose.addEventListener('click', () => {
  rewritePanel.style.display = 'none';
});

// ── Clear ──
clearBtn.addEventListener('click', () => {
  if (!editor.value.trim()) return;
  if (!confirm('Clear your draft?')) return;
  editor.value = '';
  updateWordCount();
  save();
});
