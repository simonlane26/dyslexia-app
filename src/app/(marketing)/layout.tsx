import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Atkinson_Hyperlegible } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { LandingHeader } from "@/components/LandingHeader";
import { landing } from "@/lib/landingTheme";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dyslexia Write — Dyslexia-friendly Writing App",
  description:
    "Write faster with dictation, simplify complex text, and listen back. Dyslexia-friendly fonts, high-contrast themes, and easy exports.",
  alternates: { canonical: "https://www.dyslexiawrite.com/" },
  openGraph: {
    title: "Dyslexia Write — Write, Simplify & Read Aloud",
    description:
      "Dictation, text simplification, and read-aloud built for dyslexic readers and writers.",
    url: "https://www.dyslexiawrite.com/",
    siteName: "Dyslexia Write",
    images: [{ url: "https://www.dyslexiawrite.com/og/cover.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dyslexia Write — Write, Simplify & Read Aloud",
    description:
      "Dyslexia-friendly writing app with dictation, simplification, and read-aloud.",
    images: ["https://www.dyslexiawrite.com/og/cover.jpg"],
  },
};

// ✅ required default export
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <div
        className={`min-h-screen ${fraunces.variable} ${atkinson.variable}`}
        style={{ backgroundColor: landing.bg, fontFamily: landing.fontBody, color: landing.ink }}
      >
        <LandingHeader />
        {children}
      </div>
    </ClerkProvider>
  );
}
