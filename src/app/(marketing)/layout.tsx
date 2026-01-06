import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { LandingHeader } from "@/components/LandingHeader";

export const metadata: Metadata = {
  title: "Dyslexia Writer — Dyslexia-friendly Writing App",
  description:
    "Write faster with dictation, simplify complex text, and listen back. Dyslexia-friendly fonts, high-contrast themes, and easy exports.",
  alternates: { canonical: "https://www.dyslexiawrite.com/" },
  openGraph: {
    title: "Dyslexia Writer — Write, Simplify & Read Aloud",
    description:
      "Dictation, text simplification, and read-aloud built for dyslexic readers and writers.",
    url: "https://www.dyslexiawrite.com/",
    siteName: "Dyslexia Writer",
    images: [{ url: "https://www.dyslexiawrite.com/og/cover.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dyslexia Writer — Write, Simplify & Read Aloud",
    description:
      "Dyslexia-friendly writing app with dictation, simplification, and read-aloud.",
    images: ["https://www.dyslexiawrite.com/og/cover.jpg"],
  },
};

// ✅ required default export
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <div className="min-h-screen">
        <LandingHeader />
        {children}
      </div>
    </ClerkProvider>
  );
}
