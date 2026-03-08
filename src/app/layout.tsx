import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // <-- must be here

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Dyslexia Write - AI-Powered Writing Tools for Dyslexic Writers',
    template: '%s | Dyslexia Write',
  },
  description:
    'Free dyslexia-friendly writing app with AI grammar check, sentence rewriting, reading guides, and writing coach. Designed specifically for dyslexic writers to write with confidence.',
  keywords: [
    'dyslexia writing app',
    'dyslexia tools',
    'dyslexic writing help',
    'grammar checker for dyslexia',
    'AI writing assistant',
    'text to speech',
    'voice dictation',
    'reading guide',
    'sentence rewriter',
    'writing coach',
    'dyslexia-friendly',
    'assistive technology',
    'learning disability tools',
  ],
  authors: [{ name: 'Dyslexia Write Ltd' }],
  creator: 'Dyslexia Write Ltd',
  publisher: 'Dyslexia Write Ltd',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.dyslexiawrite.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Dyslexia Write - AI-Powered Writing Tools for Dyslexic Writers',
    description:
      'Free dyslexia-friendly writing app with AI grammar check, sentence rewriting, reading guides, and writing coach. Write with confidence.',
    url: 'https://www.dyslexiawrite.com',
    siteName: 'Dyslexia Write',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/OG%20Image.png',
        width: 1200,
        height: 630,
        alt: 'Dyslexia Write - Write Better, Faster',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dyslexia Write - AI-Powered Writing Tools for Dyslexic Writers',
    description:
      'Free dyslexia-friendly writing app with AI grammar check, sentence rewriting, and reading guides.',
    images: ['/OG%20Image.png'],
    creator: '@dyslexiawriter',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you set them up
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
