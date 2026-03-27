'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { WorkplaceAdminDashboard } from '@/components/WorkplaceAdminDashboard';

const WORKPLACE_PLANS = ['workplace_starter', 'workplace_business', 'workplace_enterprise'];

export default function WorkplaceAdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const meta = (user?.publicMetadata ?? {}) as Record<string, any>;

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.replace('/sign-in'); return; }
    if (!WORKPLACE_PLANS.includes(meta.plan) || meta.workplaceRole !== 'admin') {
      router.replace('/app');
    }
  }, [isLoaded, user, meta.plan, meta.workplaceRole, router]);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#6b7280' }}>
        Loading…
      </div>
    );
  }

  if (!user || !WORKPLACE_PLANS.includes(meta.plan) || meta.workplaceRole !== 'admin') {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>✍️</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', fontFamily: "'Lexend', sans-serif" }}>
            DyslexiaWrite
          </span>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>/</span>
          <span style={{ fontSize: 13, color: '#374151', fontFamily: "'Lexend', sans-serif" }}>Workspace Admin</span>
        </div>
        <a href="/app" style={{ fontSize: 13, color: '#185FA5', textDecoration: 'none', fontFamily: "'Lexend', sans-serif" }}>
          ← Back to app
        </a>
      </div>

      <WorkplaceAdminDashboard />
    </div>
  );
}
