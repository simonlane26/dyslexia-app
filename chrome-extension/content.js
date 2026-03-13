(() => {
  const PANEL_ID = 'dw-simplify-panel';

  function removePanel() {
    const el = document.getElementById(PANEL_ID);
    if (el) el.remove();
  }

  function showPanel(html, simplified, original) {
    removePanel();

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = html;

    Object.assign(panel.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '2147483647',
      width: '340px',
      background: 'white',
      borderRadius: '14px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
    });

    document.body.appendChild(panel);

    // Close button
    panel.querySelector('#dw-close')?.addEventListener('click', removePanel);

    // Copy button
    panel.querySelector('#dw-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(simplified).then(() => {
        const btn = panel.querySelector('#dw-copy');
        if (btn) { btn.textContent = 'Copied!'; btn.style.background = '#16a34a'; }
        setTimeout(() => {
          if (btn) { btn.textContent = 'Copy'; btn.style.background = '#7c3aed'; }
        }, 2000);
      });
    });

    // Replace button — tries to replace selected text in focused input/textarea
    panel.querySelector('#dw-replace')?.addEventListener('click', () => {
      const active = document.activeElement;
      if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
        const start = active.selectionStart;
        const end = active.selectionEnd;
        const val = active.value;
        active.value = val.slice(0, start) + simplified + val.slice(end);
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
        // Fallback: just copy
        navigator.clipboard.writeText(simplified);
      }
      removePanel();
    });
  }

  chrome.runtime.onMessage.addListener((msg) => {
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
      showPanel(`
        <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
          <span style="color:white;font-weight:700;font-size:13px;">✨ Dyslexia Write</span>
          <button id="dw-close" style="background:rgba(255,255,255,0.2);border:none;color:white;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:12px;">✕</button>
        </div>
        <div style="padding:14px 16px;">
          <div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Simplified</div>
          <div style="font-size:14px;line-height:1.7;color:#1e293b;margin-bottom:14px;">${msg.simplified.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
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
        <div style="padding:14px 16px;color:#dc2626;font-size:13px;">${msg.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      `);
    }
  });
})();
