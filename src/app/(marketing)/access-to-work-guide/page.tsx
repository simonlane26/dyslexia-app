import type { Metadata } from 'next';
import AccessToWorkGuideClient from './AccessToWorkGuideClient';

export const metadata: Metadata = {
  title: 'Free Access to Work Funding Guide | Dyslexia Write',
  description:
    'Get a free guide to the Access to Work application process for assistive software — step-by-step, plus a funding request template for your employer, SENCO, or assessor.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/access-to-work-guide' },
  openGraph: {
    title: 'Free Access to Work Funding Guide | Dyslexia Write',
    description:
      'Get a free guide to the Access to Work application process for assistive software, sent straight to your inbox.',
    url: 'https://www.dyslexiawrite.com/access-to-work-guide',
  },
};

export default function Page() {
  return <AccessToWorkGuideClient />;
}
