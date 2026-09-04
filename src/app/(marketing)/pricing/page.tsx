import type { Metadata } from 'next';
import PricingClient from './PricingClient';

// Force dynamic rendering for Clerk authentication
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — Dyslexia Write Plans for Individuals & Schools',
  description:
    'Compare Dyslexia Write plans for individuals, workplaces, and schools — from a free tier to Access to Work-funded licences and whole-school pricing.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/pricing' },
  openGraph: {
    title: 'Pricing — Dyslexia Write Plans for Individuals & Schools',
    description:
      'Compare Dyslexia Write plans for individuals, workplaces, and schools — from a free tier to Access to Work-funded licences.',
    url: 'https://www.dyslexiawrite.com/pricing',
  },
};

export default function Page() {
  return <PricingClient />;
}
