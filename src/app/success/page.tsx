import { Suspense } from 'react';
import SuccessClient from './SuccessClient';

export const dynamic = 'force-dynamic';

export default function SuccessPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="max-w-lg py-10 mx-auto">Loading…</div>}>
      <SuccessClient />
    </Suspense>
  );
}
