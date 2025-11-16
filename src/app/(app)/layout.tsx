// src/app/(app)/layout.tsx  (SERVER component)

import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { HeaderBar } from "@/components/HeaderBar";
import { ToastProvider } from "@/components/ToastContainer";


const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic'; // prevents static prerender of `/`
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
          <ToastProvider>
            <HeaderBar />
            {children}
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
