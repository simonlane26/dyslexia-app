'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { landing } from '@/lib/landingTheme';

const NAV_LINKS = [
  { href: '#features-section', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/enterprise', label: 'For Employers' },
  { href: '/access-to-work', label: 'Access to Work' },
  { href: '/schools', label: 'For Schools' },
  { href: '/screener', label: 'Free Screener' },
  { href: '/faq', label: 'FAQ' },
  { href: '/compare', label: 'vs TextHelp' },
  { href: '/about', label: 'About' },
];

export function LandingHeader() {
  return (
    <header
      className="sticky top-0 z-30 w-full border-b backdrop-blur"
      style={{ backgroundColor: 'rgba(251,247,239,0.92)', borderColor: landing.line }}
    >
      <div className="flex items-center justify-between max-w-6xl gap-4 px-4 py-3 mx-auto">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M6 20 L17 9 L21 13 L10 24 L5 25 Z" stroke={landing.amber} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M15 11 L19 15" stroke={landing.amber} strokeWidth="1.6" />
          </svg>
          <span
            className="text-lg font-semibold"
            style={{ fontFamily: landing.fontDisplay, color: landing.ink }}
          >
            DyslexiaWrite
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden text-sm font-medium transition sm:block"
              style={{ color: landing.inkMuted }}
              onMouseOver={(e) => (e.currentTarget.style.color = landing.ink)}
              onMouseOut={(e) => (e.currentTarget.style.color = landing.inkMuted)}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="hidden text-sm font-bold sm:block"
                  style={{ color: landing.ink }}
                >
                  Sign in
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="rounded-full px-5 py-2.5 text-sm font-bold text-white transition"
                style={{ backgroundColor: landing.amber }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = landing.amberDark)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = landing.amber)}
              >
                Start Writing Free
              </Link>
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
