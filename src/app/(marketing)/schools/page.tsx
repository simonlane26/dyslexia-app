import type { Metadata } from 'next';
import SchoolsClient from './SchoolsClient';

export const metadata: Metadata = {
  title: 'Dyslexia Writing Software for Schools — Site Licences | Dyslexia Write',
  description:
    'Whole-school licences for pupils with dyslexia, with a teacher dashboard, child-safe copy, and GDPR-compliant EU data hosting. Book a demo with your SENCO or inclusion lead.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/schools' },
  openGraph: {
    title: 'Dyslexia Writing Software for Schools — Site Licences | Dyslexia Write',
    description:
      'Whole-school licences for pupils with dyslexia, with a teacher dashboard, child-safe copy, and GDPR-compliant EU data hosting.',
    url: 'https://www.dyslexiawrite.com/schools',
  },
};

export default function Page() {
  return <SchoolsClient />;
}
