"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CookieBanner } from "./CookieBanner";

const CONSENT_KEY = "cookie-consent-v1";

export function CookieAndAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const c = JSON.parse(raw) as { analytics?: boolean };
        setAllowed(Boolean(c.analytics));
      }
    } catch {}

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { analytics?: boolean };
      setAllowed(Boolean(detail?.analytics));
    };

    window.addEventListener("cookie-consent-changed", onChange as EventListener);
    return () =>
      window.removeEventListener("cookie-consent-changed", onChange as EventListener);
  }, []);

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      <CookieBanner />
      {allowed && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}
