import type { Metadata } from 'next';
import EnterpriseClient from './EnterpriseClient';

export const metadata: Metadata = {
  title: 'Dyslexia Support for Employees at Work | Dyslexia Write',
  description:
    'Dyslexia support for employees — Access to Work eligible licences, an admin dashboard, and Equality Act compliance documentation for HR and inclusion teams.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/enterprise' },
  openGraph: {
    title: 'Dyslexia Support for Employees at Work | Dyslexia Write',
    description:
      'Dyslexia support for employees — Access to Work eligible licences, an admin dashboard, and Equality Act compliance documentation.',
    url: 'https://www.dyslexiawrite.com/enterprise',
  },
};

export default function Page() {
  return <EnterpriseClient />;
}
