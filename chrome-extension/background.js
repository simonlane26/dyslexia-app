// ── Create context menus ───────────────────────────────────────────────────────
function createMenus() {
  chrome.contextMenus.removeAll(() => {
    // Right-click on selected text
    chrome.contextMenus.create({
      id: 'dw-simplify',
      title: 'Simplify with Dyslexia Write',
      contexts: ['selection'],
    });
    // Right-click anywhere on the page
    chrome.contextMenus.create({
      id: 'dw-simplify-page',
      title: 'Simplify this whole page',
      contexts: ['page'],
    });
  });
}

chrome.runtime.onInstalled.addListener(createMenus);

// ── Helper: ensure content script is injected ──────────────────────────────────
// Returns false if the tab is restricted (chrome://, extension pages, etc.)
async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    return true;
  } catch {
    return false; // restricted page — cannot inject
  }
}

function safeSend(tabId, msg) {
  try { chrome.tabs.sendMessage(tabId, msg); } catch { /* tab gone or restricted */ }
}

// ── Context menu handler ───────────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  // ── Selection simplify (existing) ─────────────────────────────────────────
  if (info.menuItemId === 'dw-simplify') {
    const text = (info.selectionText || '').trim();
    if (!text) return;

    const ok = await ensureContentScript(tab.id);
    if (!ok) return; // restricted page — silently bail

    safeSend(tab.id, { type: 'DW_SIMPLIFY_START' });

    const { dw_token } = await chrome.storage.local.get('dw_token');
    if (!dw_token) {
      safeSend(tab.id, { type: 'DW_SIMPLIFY_ERROR', message: 'Connect your account first — open the Dyslexia Write extension.' });
      return;
    }

    try {
      const res = await fetch('https://www.dyslexiawrite.com/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dw_token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        safeSend(tab.id, { type: 'DW_SIMPLIFY_ERROR', message: data.message || data.error || 'Something went wrong.' });
        return;
      }
      safeSend(tab.id, { type: 'DW_SIMPLIFY_RESULT', original: text, simplified: data.simplifiedText });
    } catch {
      safeSend(tab.id, { type: 'DW_SIMPLIFY_ERROR', message: 'Could not reach server. Check your connection.' });
    }
  }

  // ── Whole-page simplify (new) ──────────────────────────────────────────────
  if (info.menuItemId === 'dw-simplify-page') {
    const ok = await ensureContentScript(tab.id);
    if (!ok) return; // restricted page — silently bail

    const { dw_token, dw_simplify_level } = await chrome.storage.local.get(['dw_token', 'dw_simplify_level']);
    if (!dw_token) {
      safeSend(tab.id, { type: 'DW_SIMPLIFY_ERROR', message: 'Connect your account first — open the Dyslexia Write extension.' });
      return;
    }

    safeSend(tab.id, { type: 'DW_SIMPLIFY_PAGE', token: dw_token, level: dw_simplify_level || 2 });
  }
});
