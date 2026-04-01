'use client';

export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';

const OnboardingWizard = nextDynamic(() => import('@/components/OnboardingWizard'), { ssr: false });

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
