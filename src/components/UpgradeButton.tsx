// src/components/UpgradeButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ModernButton } from '@/components/ModernButton';

export function UpgradeButton() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const pro =
      (user.publicMetadata as any)?.isPro === true ||
      (user.unsafeMetadata as any)?.isPro === true;
    setIsPro(pro);
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) return null;
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
  const handleUpgrade = () => {
    setLoading(true);
    router.push('/pricing');
  };

  return (
    <ModernButton
      onClick={handleUpgrade}
      variant="primary"
      size="lg"
      disabled={loading}
      className="mb-6 transition-all duration-200 transform hover:scale-105 active:scale-95"
    >
      {loading ? 'Redirecting…' : '💎 Upgrade to Pro'}
    </ModernButton>
  );
}
