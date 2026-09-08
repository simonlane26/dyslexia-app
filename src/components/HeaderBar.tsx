'use client';

import { useEffect, useMemo } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useSchoolMode } from '@/hooks/useSchoolMode';
import { useT } from '@/lib/i18n';
import { IconPencil } from '@tabler/icons-react';

export function HeaderBar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const schoolMode = useSchoolMode();
  const t = useT();

  // Refresh once so Pro badge reflects webhook updates quickly
  useEffect(() => {
    if (isLoaded && user?.reload) user.reload().catch(() => {});
  }, [isLoaded, user]);

  const isPro = useMemo(() => user?.publicMetadata?.isPro === true, [user?.publicMetadata]);
  const isWorkplaceAdmin = useMemo(() => user?.publicMetadata?.workplaceRole === 'admin', [user?.publicMetadata]);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Writing', href: '/app' },
    { label: 'Meetings', href: '/app/meetings' },
    { label: 'Lessons', href: '/app/lessons' },
    { label: 'Stories', href: '/app/story' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
      <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto">
        <div className="flex items-center gap-2">
          <IconPencil size={22} stroke={1.75} className="text-amber-600" aria-hidden />
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Dyslexia Write
          </span>
        </div>

        {/* Centre nav — Writing / Meetings */}
        {isLoaded && isSignedIn && (
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ label, href }) => {
              const active = href === '/app' ? pathname === '/app' : pathname?.startsWith(href);
              return (
                <button
                  key={href}
                  type="button"
                  onClick={() => router.push(href)}
                  className={[
                    'px-4 py-1.5 rounded-lg text-sm transition border-b-2',
                    active
                      ? 'font-semibold text-slate-900 dark:text-slate-100 border-slate-900 dark:border-slate-100'
                      : 'font-medium text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {/* Fallback UI while Clerk loads */}
          {!isLoaded && (
            <a
              href="/sign-in"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {t('header.signIn')}
            </a>
          )}

          {isLoaded && isSignedIn && (
            <>
              {/* Workspace admin link */}
              {isWorkplaceAdmin && (
                <button
                  type="button"
                  onClick={() => router.push('/workplace/admin')}
                  className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition"
                >
                  Workspace Admin
                </button>
              )}

              {/* Manage subscription / Upgrade — left of Pro badge */}
              {isPro ? (
                <button
                  type="button"
                  onClick={() => router.push('/pricing')}
                  className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition"
                >
                  {t('header.manageSubscription')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/pricing')}
                  className="hidden sm:block rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700"
                >
                  {t('header.upgradePro')}
                </button>
              )}

              {/* Pro Member badge — flat, not a gradient, so it doesn't out-shout the brand accent */}
              {isPro && (
                <div className="items-center hidden gap-2 px-3 py-1 text-sm font-medium rounded-full sm:flex bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  {t('header.proMember')}
                </div>
              )}
            </>
          )}

          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                {t('header.signIn')}
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8' } }}
            />
          </SignedIn>

          {/* Class Dashboard — right of avatar */}
          {isLoaded && isSignedIn && schoolMode.isTeacher && (
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {t('header.classDashboard')}
            </button>
          )}

          {/* Join School — for school users not yet linked */}
          {isLoaded && isSignedIn && schoolMode.isSchoolMode && !schoolMode.schoolId && (
            <button
              type="button"
              onClick={() => router.push('/join-school')}
              className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 transition hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              {t('header.joinSchool')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
