// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { HeaderBar } from "@/components/HeaderBar";
// import { CookieAndAnalytics } from "@/components/CookieAndAnalytics";

export const metadata: Metadata = {
  title: "Dyslexia Writer",
  description: "Dyslexia-friendly writing and reading tools.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className={inter.className}>
        <body className="min-h-screen antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
          {/* Optional cookie banner/analytics: render only once, here */}
          {/* <CookieAndAnalytics /> */}

          {/* ✅ Render the header ONCE for the whole app */}
          <HeaderBar />

          {/* ✅ Page content renders here */}
          {children}

          <footer className="py-8 mt-16 text-sm text-center border-t border-slate-200 text-slate-500 dark:border-slate-800">
            <a href="/privacy" className="mx-2 hover:underline">Privacy Policy</a> |
            <a href="/terms" className="mx-2 hover:underline">Terms of Service</a> |
            <a href="/cookies" className="mx-2 hover:underline">Cookie Policy</a>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
