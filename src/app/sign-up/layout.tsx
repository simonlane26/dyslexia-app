// app/sign-up/[[...sign-up]]/layout.tsx
'use client';

import { ClerkProvider } from '@clerk/nextjs';

export default function SignUpLayout({
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
