'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Read ?debug=1 from window to avoid useSearchParams
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setShow(params.get('debug') === '1');
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  return (
    <pre className="p-2 text-xs border rounded bg-slate-50">
      {JSON.stringify(
        {
          isLoaded,
          isSignedIn,
          userId: user?.id,
          isPro: (user?.publicMetadata as any)?.isPro ?? null,
        },
        null,
        2
      )}
    </pre>
  );
}

