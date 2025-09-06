// src/components/CookieBanner.tsx
"use client";

import { useEffect, useState } from "react";

type Consent = {
  essential: true;          // always true (cannot be turned off)
  analytics: boolean;       // user choice
};

const CONSENT_KEY = "cookie-consent-v1";

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
  // Fire an event so the app/layout can react (e.g., load/unload analytics)
  window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: c }));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setVisible(!existing); // show banner if no prior choice
  }, []);

  const acceptAll = () => {
    writeConsent({ essential: true, analytics: true });
    setVisible(false);
  };

  const rejectNonEssential = () => {
    writeConsent({ essential: true, analytics: false });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 w-full max-w-3xl p-4 mx-auto border shadow-xl rounded-t-xl border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700 dark:text-slate-200">
          We use essential cookies to make our site work. With your permission,
          we also use analytics cookies to improve the app. See our{" "}
          <a className="underline" href="/cookies">Cookie Policy</a>.
        </p>
        <div className="flex gap-2 sm:shrink-0">
          <button
            onClick={rejectNonEssential}
            className="px-3 py-2 text-sm font-medium border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Reject non-essential
          </button>
          <button
            onClick={acceptAll}
            className="px-3 py-2 text-sm font-semibold text-white rounded-lg shadow bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
