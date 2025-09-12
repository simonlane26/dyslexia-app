// src/app/layout.tsx  (SERVER component)
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { HeaderBar } from "@/components/HeaderBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dyslexia Writer",
  description: "Dyslexia-friendly writing and reading tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>
        {/* Clerk auto-reads NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY */}
        <ClerkProvider>
          <HeaderBar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}


