// src/app/(app)/layout.tsx  (SERVER component)

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { HeaderBar } from "@/components/HeaderBar";
import { ToastProvider } from "@/components/ToastContainer";

export const dynamic = 'force-dynamic'; // prevents static prerender of `/`
export const metadata: Metadata = {
  title: "Dyslexia Writer",
  description: "Dyslexia-friendly writing and reading tools.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ToastProvider>
        <HeaderBar />
        {children}
      </ToastProvider>
    </ClerkProvider>
  );
}
