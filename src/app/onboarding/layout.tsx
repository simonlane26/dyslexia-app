import { ClerkProvider } from '@clerk/nextjs';
import { LanguageProvider } from '@/lib/i18n';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ClerkProvider>
  );
}
