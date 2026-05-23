import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
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

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.dyslexiawrite.com/#organization',
      name: 'DyslexiaWrite',
      url: 'https://www.dyslexiawrite.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.dyslexiawrite.com/LogoNew.png',
      },
      founder: { '@type': 'Person', name: 'Simon Lane' },
      foundingLocation: { '@type': 'Place', addressCountry: 'GB' },
      description:
        'AI-powered assistive technology platform for dyslexic users, providing writing support, reading assistance, and document comprehension tools.',
      sameAs: ['https://twitter.com/dyslexiawriter'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.dyslexiawrite.com/#website',
      url: 'https://www.dyslexiawrite.com',
      name: 'DyslexiaWrite',
      publisher: { '@id': 'https://www.dyslexiawrite.com/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.dyslexiawrite.com/#app',
      name: 'DyslexiaWrite',
      url: 'https://www.dyslexiawrite.com',
      description:
        'AI-powered writing and reading support platform designed for dyslexic users. Provides text simplification, text-to-speech, document decoding, Chrome extension, and reading mode progression tracking.',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, Chrome Extension, PWA',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'GBP',
          description: 'Free tier with daily usage limits',
        },
        {
          '@type': 'Offer',
          name: 'Pro (Individual)',
          price: '6.99',
          priceCurrency: 'GBP',
          priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1M' },
        },
        {
          '@type': 'Offer',
          name: 'Schools Starter',
          price: '300',
          priceCurrency: 'GBP',
          priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1Y' },
          eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 30 },
        },
        {
          '@type': 'Offer',
          name: 'Workplace Business',
          price: '95',
          priceCurrency: 'GBP',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1Y',
            referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitText: 'user' },
          },
        },
        {
          '@type': 'Offer',
          name: 'Access to Work Licence',
          price: '120',
          priceCurrency: 'GBP',
          priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1Y' },
          description: 'UK Government Access to Work scheme compatible — typically 100% funded by DWP',
        },
      ],
      creator: { '@id': 'https://www.dyslexiawrite.com/#organization' },
      featureList: [
        'AI-powered text simplification and rewriting',
        'Text-to-speech with word-level karaoke highlighting',
        'Document Decoder for explaining complex documents in plain language',
        'Chrome browser extension for email and web support',
        'Three reading modes: Supported, Guided, and Clean',
        'Voice dictation',
        'Accessibility Passport generation',
        'SENCO class dashboard with progress tracking',
        'Equality Act Compliance Pack for enterprise',
        'Access to Work compatible',
        'Story Mode with AI-generated personalised stories',
        'Meeting Survival Kit and Lesson Capture',
        'Spaced repetition vocabulary builder',
      ],
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: ['student', 'teacher'],
        audienceType: 'Dyslexic users, neurodiverse individuals, schools, employers',
      },
      isAccessibleForFree: true,
      inLanguage: ['en-GB'],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17942125039"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17942125039');
        `}</Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
