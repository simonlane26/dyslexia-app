// src/components/AuthDebug.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [show, setShow] = useState(false);
  const allow = process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true';
if (!allow || !show) return null;


  // Only show when you add ?debug=1 to the URL
  useEffect(() => {
    try {
      const v = new URLSearchParams(window.location.search).get('debug');
      setShow(v === '1');
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  const isPro = (user?.publicMetadata as any)?.isPro ?? null;

  return (
    <pre className="p-2 text-xs border rounded bg-slate-50">
      {JSON.stringify({ isLoaded, isSignedIn, userId: user?.id, isPro }, null, 2)}
    </pre>
  );
}

