'use client';

import dynamic from 'next/dynamic';

const WorkplaceAdminPage = dynamic(
  () => import('./WorkplaceAdminPage'),
  { ssr: false }
);

export default function Page() {
  return <WorkplaceAdminPage />;
}
