// src/components/UpgradeButton.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ModernButton } from '@/components/ModernButton';

export function UpgradeButton() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isLoaded && user?.reload) user.reload().catch(() => {});
  }, [isLoaded, user]);

  const isPro = useMemo(() => user?.publicMetadata?.isPro === true, [user?.publicMetadata]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <ModernButton onClick={() => router.push('/sign-in')} variant="primary" size="lg" className="mb-6">
        Sign in to upgrade
      </ModernButton>
    );
  }

  if (isPro) {
    return (
      <ModernButton onClick={() => router.push('/pricing')} variant="secondary" size="sm" className="mb-6">
        Manage subscription
      </ModernButton>
    );
  }

  return (
    <ModernButton
      onClick={() => { setBusy(true); router.push('/pricing'); }}
      variant="primary" size="lg" disabled={busy} className="mb-6"
    >
      {busy ? 'Redirecting…' : '💎 Upgrade to Pro'}
    </ModernButton>
  );
}

