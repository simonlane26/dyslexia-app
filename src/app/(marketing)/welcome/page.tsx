import type { Metadata } from 'next';
import WelcomeClient from './client';

// Reached only via the extension's first-install redirect — not a page
// worth ranking, and indexing it would just compete with the real guides.
export const metadata: Metadata = {
  title: "You're in — Welcome to DyslexiaWrite",
  description: 'Connect your DyslexiaWrite account to the Chrome extension to unlock AI Simplify everywhere you write.',
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return <WelcomeClient />;
}
