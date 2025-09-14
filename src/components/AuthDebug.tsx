// src/components/AuthDebug.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function AuthDebug() {
  const { isLoaded, isSignedIn, user } = useUser();
  const params = useSearchParams();

  // Only show when you add ?debug=1 to the URL
  const show = params?.get('debug') === '1';
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

