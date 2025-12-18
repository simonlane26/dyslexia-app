import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // <-- must be here

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dyslexia Writer',
  description: 'Write clearly, read easily',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
