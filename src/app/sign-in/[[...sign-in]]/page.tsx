// src/app/sign-in/[[...sign-in]]/page.tsx
'use client';

import { Suspense } from 'react';
import { ClerkLoaded, ClerkLoading, SignIn } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading sign-in…</div>}>
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ClerkLoading>
          <div className="px-4 py-3 text-sm border rounded-lg">Loading authentication…</div>
        </ClerkLoading>
        <ClerkLoaded>
          <SignIn />
        </ClerkLoaded>
      </div>
    </Suspense>
  );
}

