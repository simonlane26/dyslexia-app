'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
      <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
          <span className="text-2xl" aria-hidden>✍️</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Dyslexia Writer
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="#features-section"
            className="hidden text-sm font-medium transition text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 sm:block"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="hidden text-sm font-medium transition text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 sm:block"
          >
            Pricing
          </Link>

          <div className="flex items-center gap-3">
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
        </nav>
      </div>
    </header>
  );
}
