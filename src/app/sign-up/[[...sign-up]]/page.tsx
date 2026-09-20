// src/app/sign-up/[[...sign-up]]/page.tsx
'use client';
import { Suspense } from 'react';
import { SignUp } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading sign-up…</div>}>
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <h1 className="sr-only">Sign up for Dyslexia Write</h1>
        <SignUp />
      </div>
    </Suspense>
  );
}
