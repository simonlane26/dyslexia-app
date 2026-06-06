import type { Metadata } from 'next';
import DyslexiaScreener from '@/components/screener/DyslexiaScreener';

export const metadata: Metadata = {
  title: 'Free Dyslexia Screener | DyslexiaWrite',
  description:
    'Take a free, private 5-minute screener to understand whether your reading and writing experiences might be linked to dyslexia. No login required. Results are not stored.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/screener' },
  openGraph: {
    title: 'Could it be dyslexia? Free screener from DyslexiaWrite',
    description:
      'A quick, free, private screener to help you understand whether your reading and writing difficulties might be linked to dyslexia.',
    url: 'https://www.dyslexiawrite.com/screener',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Free Dyslexia Screener',
  description:
    'A free, private screening questionnaire that identifies indicators commonly associated with dyslexia. Not a diagnostic tool — designed to help users understand whether professional assessment may be beneficial.',
  url: 'https://www.dyslexiawrite.com/screener',
  publisher: {
    '@type': 'Organization',
    name: 'DyslexiaWrite Ltd',
    url: 'https://www.dyslexiawrite.com',
  },
  about: {
    '@type': 'MedicalCondition',
    name: 'Dyslexia',
    alternateName: 'Specific Learning Difficulty in Reading',
  },
  audience: {
    '@type': 'PeopleAudience',
    audienceType: 'Adults and young people who suspect they may have dyslexia',
  },
  isAccessibleForFree: true,
  inLanguage: 'en-GB',
};

export default function ScreenerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ minHeight: '100vh', background: '#FDF6E3' }}>
        <DyslexiaScreener />
      </div>
    </>
  );
}
