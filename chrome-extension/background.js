// ── Create context menu ──
function createMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'dw-simplify',
      title: 'Simplify with Dyslexia Write',
      contexts: ['selection'],
    });
  });
}

chrome.runtime.onInstalled.addListener(createMenu);
chrome.runtime.onStartup.addListener(createMenu);

// ── Handle context menu click ──
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'dw-simplify' || !tab?.id) return;

  const text = (info.selectionText || '').trim();
  if (!text) return;

  // Ensure content script is injected (handles already-open tabs)
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
  } catch { /* already injected or page doesn't allow scripts */ }

  // Tell content script to show loading state
  chrome.tabs.sendMessage(tab.id, { type: 'DW_SIMPLIFY_START' });

  // Check for auth token
  const { dw_token } = await chrome.storage.local.get('dw_token');
  if (!dw_token) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'DW_SIMPLIFY_ERROR',
      message: 'Connect your account first — open the Dyslexia Write extension and click Simplify.',
    });
    return;
  }

  try {
    const res = await fetch('https://www.dyslexiawrite.com/api/simplify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dw_token}`,
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (!res.ok) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'DW_SIMPLIFY_ERROR',
        message: data.message || data.error || 'Something went wrong.',
      });
      return;
    }

    chrome.tabs.sendMessage(tab.id, {
      type: 'DW_SIMPLIFY_RESULT',
      original: text,
      simplified: data.simplifiedText,
    });
  } catch {
    chrome.tabs.sendMessage(tab.id, {
      type: 'DW_SIMPLIFY_ERROR',
      message: 'Could not reach server. Check your connection.',
    });
  }
});
