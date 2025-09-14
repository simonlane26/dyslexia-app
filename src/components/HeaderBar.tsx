'use client';

import { useEffect, useMemo } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

export function HeaderBar() {
  const { user, isLoaded, isSignedIn } = useUser();

  // Refresh once so Pro badge reflects webhook updates quickly
  useEffect(() => {
    if (isLoaded && user?.reload) user.reload().catch(() => {});
  }, [isLoaded, user]);

  const isPro = useMemo(() => user?.publicMetadata?.isPro === true, [user?.publicMetadata]);

  return (
  <header className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
    <div className="flex items-center justify-between max-w-5xl px-4 py-3 mx-auto">
<div className="flex items-center gap-2">
  <span className="text-2xl" aria-hidden>✍️</span>
  <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
    Dyslexia Writer
    <sup
      className="ml-0.5 align-super text-[0.65em]"
      aria-label="Trademark"
      title="Trademark"
    >
      ™
    </sup>
  </span>
</div>

  <div className="flex items-center gap-3">
          {/* Fallback UI while Clerk loads — prevents an empty right side */}
          {!isLoaded && (
            <a
              href="/sign-in"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Sign in
            </a>
          )}

          {/* Real auth-aware UI once Clerk loads */}
          {isLoaded && isSignedIn && isPro && (
            <div className="items-center hidden gap-2 px-3 py-1 text-sm font-medium text-white rounded-full shadow-sm bg-gradient-to-r from-purple-600 to-pink-600 sm:flex">
              ✨ Pro Member
            </div>
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
        </div>
      </div>
    </header>
  );
}


