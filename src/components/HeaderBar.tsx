'use client';

import { useEffect, useMemo } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSchoolMode } from '@/hooks/useSchoolMode';

export function HeaderBar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const schoolMode = useSchoolMode();

  // Refresh once so Pro badge reflects webhook updates quickly
  useEffect(() => {
    if (isLoaded && user?.reload) user.reload().catch(() => {});
  }, [isLoaded, user]);

  const isPro = useMemo(() => user?.publicMetadata?.isPro === true, [user?.publicMetadata]);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
      <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>✍️</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Dyslexia Write
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Fallback UI while Clerk loads */}
          {!isLoaded && (
            <a
              href="/sign-in"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Sign in
            </a>
          )}

          {isLoaded && isSignedIn && (
            <>
              {/* Manage subscription / Upgrade — left of Pro badge */}
              {isPro ? (
                <button
                  type="button"
                  onClick={() => router.push('/pricing')}
                  className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition"
                >
                  Manage subscription
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/pricing')}
                  className="hidden sm:block rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                >
                  💎 Upgrade to Pro
                </button>
              )}

              {/* Pro Member badge */}
              {isPro && (
                <div className="items-center hidden gap-2 px-3 py-1 text-sm font-medium text-white rounded-full shadow-sm bg-gradient-to-r from-purple-600 to-pink-600 sm:flex">
                  ✨ Pro Member
                </div>
              )}
            </>
          )}

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8' } }}
              afterSignOutUrl="/"
            />
          </SignedIn>

          {/* Class Dashboard — right of avatar */}
          {isLoaded && isSignedIn && schoolMode.isTeacher && (
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              📊 Class Dashboard
            </button>
          )}

          {/* Join School — for school users not yet linked */}
          {isLoaded && isSignedIn && schoolMode.isSchoolMode && !schoolMode.schoolId && (
            <button
              type="button"
              onClick={() => router.push('/join-school')}
              className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 transition hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              🏫 Join your school
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
