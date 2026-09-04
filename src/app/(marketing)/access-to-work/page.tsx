import type { Metadata } from 'next';
import AccessToWorkClient from './AccessToWorkClient';

export const metadata: Metadata = {
  title: 'Access to Work Grant for Dyslexia Software | Dyslexia Write',
  description:
    "Dyslexia Write is 100% fundable through the UK's Access to Work scheme — no formal diagnosis required. See what to include in your application and how to claim.",
  alternates: { canonical: 'https://www.dyslexiawrite.com/access-to-work' },
  openGraph: {
    title: 'Access to Work Grant for Dyslexia Software | Dyslexia Write',
    description:
      "Dyslexia Write is 100% fundable through the UK's Access to Work scheme — no formal diagnosis required.",
    url: 'https://www.dyslexiawrite.com/access-to-work',
  },
};

export default function Page() {
  return <AccessToWorkClient />;
}
