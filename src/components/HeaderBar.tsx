'use client';

import { useEffect, useMemo } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

export function HeaderBar() {
  const { user, isLoaded } = useUser();

  // Refresh user once when ready so Pro status updates immediately after webhooks
  useEffect(() => {
    if (isLoaded && user?.reload) {
      user.reload().catch(() => {});
    }
  }, [isLoaded, user]);

  // Derive Pro state safely from publicMetadata only
  const isPro = useMemo(
    () => (user?.publicMetadata?.isPro === true),
    [user?.publicMetadata]
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
      <div className="flex items-center justify-between max-w-5xl px-4 py-3 mx-auto">
        {/* Left: brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            ✍️
          </span>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Dyslexia Writer
          </span>
        </div>

        {/* Right: Pro badge + auth controls */}
        <div className="flex items-center gap-3">
          {/* Only show Pro badge when we know the user + metadata */}
          {isLoaded && isPro && (
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
            {/* afterSignOutUrl is fine; routes back home */}
            <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8' } }} afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

