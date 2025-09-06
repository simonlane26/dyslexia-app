'use client';

import { useUser, UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

export function HeaderBar() {
  const { user, isLoaded } = useUser();

  // Show nothing until Clerk hydrates (prevents flicker)
  if (!isLoaded) return null;

  const isPro =
    (user?.publicMetadata as any)?.isPro === true ||
    (user?.unsafeMetadata as any)?.isPro === true;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
      <div className="flex items-center justify-between max-w-5xl px-4 py-3 mx-auto">
        {/* Left: app title / logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>✍️</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Dyslexia Writer
          </span>
        </div>

        {/* Right: Pro badge + UserButton OR Sign in */}
        <div className="flex items-center gap-3">
          {isPro && (
            <div className="items-center hidden gap-2 px-3 py-1 text-sm font-medium text-white rounded-full shadow-sm sm:flex bg-gradient-to-r from-purple-600 to-pink-600">
              ✨ Pro Member
            </div>
          )}

          <SignedIn>
            {/* On sign out, route to home (change if you want) */}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
