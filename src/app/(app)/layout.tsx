// src/app/layout.tsx (Server Component)
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Do NOT pass publishableKey prop; SDK reads NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY */}
        <ClerkProvider>
          <HeaderBar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

