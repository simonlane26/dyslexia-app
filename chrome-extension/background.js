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
async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch { /* already injected or restricted page */ }
}

// ── Context menu handler ───────────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  // ── Selection simplify (existing) ─────────────────────────────────────────
  if (info.menuItemId === 'dw-simplify') {
    const text = (info.selectionText || '').trim();
    if (!text) return;

    await ensureContentScript(tab.id);
    chrome.tabs.sendMessage(tab.id, { type: 'DW_SIMPLIFY_START' });

    const { dw_token } = await chrome.storage.local.get('dw_token');
    if (!dw_token) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'DW_SIMPLIFY_ERROR',
        message: 'Connect your account first — open the Dyslexia Write extension.',
      });
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
        chrome.tabs.sendMessage(tab.id, { type: 'DW_SIMPLIFY_ERROR', message: data.message || data.error || 'Something went wrong.' });
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type: 'DW_SIMPLIFY_RESULT', original: text, simplified: data.simplifiedText });
    } catch {
      chrome.tabs.sendMessage(tab.id, { type: 'DW_SIMPLIFY_ERROR', message: 'Could not reach server. Check your connection.' });
    }
  }

  // ── Whole-page simplify (new) ──────────────────────────────────────────────
  if (info.menuItemId === 'dw-simplify-page') {
    await ensureContentScript(tab.id);

    const { dw_token, dw_simplify_level } = await chrome.storage.local.get(['dw_token', 'dw_simplify_level']);
    if (!dw_token) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'DW_SIMPLIFY_ERROR',
        message: 'Connect your account first — open the Dyslexia Write extension.',
      });
      return;
    }

    chrome.tabs.sendMessage(tab.id, {
      type: 'DW_SIMPLIFY_PAGE',
      token: dw_token,
      level: dw_simplify_level || 2,
    });
  }
});
