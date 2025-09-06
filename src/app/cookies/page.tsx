// src/app/cookies/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Dyslexia Writer",
  description:
    "How we use cookies and similar technologies on Dyslexia Writer.",
};

export default function CookiesPage() {
  const Today = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl px-6 py-12 mx-auto prose prose-slate dark:prose-invert">
      <h1>Cookie Policy</h1>
      <p><strong>Last Updated:</strong> {Today}</p>

      <p>
        This Cookie Policy explains how <strong>[Dyslexia Writer]</strong> (“we”, “our”, “us”)
        uses cookies and similar technologies on our website and app.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device that help websites function,
        remember your settings, and understand how you use the site.
      </p>

      <h2>Types of cookies we use</h2>
      <ul>
        <li>
          <strong>Strictly Necessary</strong> – required for core functionality
          (e.g., authentication, security). These always run.
        </li>
        <li>
          <strong>Analytics (Optional)</strong> – help us understand site usage
          (e.g., Google Analytics). We only use these with your consent.
        </li>
      </ul>

      <h2>Managing your preferences</h2>
      <p>
        On your first visit, we ask for your consent for non-essential cookies.
        You can change your choice at any time via the cookie banner if it reappears
        or by clearing your site data and revisiting the page.
      </p>

      <h2>Third-party services</h2>
      <ul>
        <li>Clerk (authentication)</li>
        <li>Stripe (payments)</li>
        <li>OpenAI & ElevenLabs (AI features; do not set marketing cookies)</li>
        <li>Google Analytics (analytics – only if you consent)</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions? Email us at <a href="mailto:[support@dyslexiawrite.com]">[support@dyslexiawrite.com]</a>.
      </p>
    </main>
  );
}
