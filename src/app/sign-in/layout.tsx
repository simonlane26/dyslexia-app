// app/sign-in/[[...sign-in]]/layout.tsx
'use client';

import { ClerkProvider } from '@clerk/nextjs';

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div style={{ minHeight: '100vh', padding: '2rem' }}>
        {children}
      </div>
    </ClerkProvider>
  );
}