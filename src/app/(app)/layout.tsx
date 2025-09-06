// src/app/layout.tsx
import "../globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.className} min-h-screen antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50`}
    >
      {children}
    </div>
  );
}

