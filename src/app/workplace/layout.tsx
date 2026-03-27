import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/lib/i18n";

export const dynamic = 'force-dynamic';

export default function WorkplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ClerkProvider>
  );
}
