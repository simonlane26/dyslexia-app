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

  // Refresh user once when ready so Pro status updates immediately after webhooks
  useEffect(() => {
    if (isLoaded && user?.reload) {
      user.reload().catch(() => {});
    }
  }, [isLoaded, user]);

  // Derive Pro state from publicMetadata only
  const isPro = useMemo(
    () => user?.publicMetadata?.isPro === true,
    [user?.publicMetadata]
  );

  // Not ready yet — keep layout stable (optional: return a skeleton)
  if (!isLoaded) return null;

  // Not signed in — invite to sign in first
  if (!isSignedIn) {
    return (
      <ModernButton
        onClick={() => router.push('/sign-in')}
        variant="primary"
        size="lg"
        className="mb-6 transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        Sign in to upgrade
      </ModernButton>
    );
  }

  // Already Pro — show Manage link
  if (isPro) {
    return (
      <ModernButton
        onClick={() => router.push('/pricing')}
        variant="secondary"
        size="sm"
        className="mb-6"
      >
        Manage subscription
      </ModernButton>
    );
  }

  // Free user — show Upgrade
  const handleUpgrade = () => {
    setBusy(true);
    router.push('/pricing');
  };

  return (
    <ModernButton
      onClick={handleUpgrade}
      variant="primary"
      size="lg"
      disabled={busy}
      className="mb-6 transition-all duration-200 transform hover:scale-105 active:scale-95"
    >
      {busy ? 'Redirecting…' : '💎 Upgrade to Pro'}
    </ModernButton>
  );
}

