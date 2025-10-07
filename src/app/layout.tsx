import type { Metadata } from 'next';
import './globals.css'; // <-- must be here

export const metadata: Metadata = {
  title: 'Dyslexia Writer',
  description: 'Write clearly, read easily',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
