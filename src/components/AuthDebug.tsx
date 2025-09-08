// src/components/AuthDebug.tsx
'use client';
import { useUser } from '@clerk/nextjs';

export default function AuthDebug() {
  const { isLoaded, isSignedIn, user } = useUser();
  return (
    <pre className="p-2 text-xs border rounded bg-slate-50">
      {JSON.stringify({
        isLoaded,
        isSignedIn,
        userId: user?.id,
        isPro: user?.publicMetadata?.isPro ?? null,
      }, null, 2)}
    </pre>
  );
}
