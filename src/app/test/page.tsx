'use client';

import { useUser } from '@clerk/nextjs';

export default function TestPage() {
  const { user } = useUser()
  return <div>Hello {user?.firstName}</div>;
}