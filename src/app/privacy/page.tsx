// src/app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Dyslexia Writer",
  description:
    "How DyslexiaWrite.com collects, uses, and protects your information (UK + GDPR).",
};

export default function PrivacyPage() {
  const Today = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl px-6 py-12 mx-auto prose prose-slate dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Effective Date:</strong> {Today}
      </p>

      <p>
        Welcome to <strong>[DyslexiaWrite.com]</strong> (“we”, “our”, “us”). Your
        privacy is important to us. This policy explains how we collect, use,
        and protect your information when you use our website and app.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account Information</strong>: Name, email, and login data via
          our authentication provider (Clerk).
        </li>
        <li>
          <strong>Payment Information</strong>: Processed by Stripe. We do not
          store card details.
        </li>
        <li>
          <strong>Usage Data</strong>: App activity (e.g., simplifications,
          preferences).
        </li>
        <li>
          <strong>Content</strong>: Text you submit for simplification and
          audio creation, processed by OpenAI and ElevenLabs.
        </li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>Provide, operate, and improve the service.</li>
        <li>Manage accounts, subscriptions, and billing.</li>
        <li>Personalise features (e.g., voices, settings).</li>
        <li>Support and respond to enquiries.</li>
        <li>Analytics and service quality (if enabled).</li>
      </ul>

      <h2>3. Sharing of Information</h2>
      <p>We share data only with trusted processors that help us run the app:</p>
      <ul>
        <li>Clerk (authentication)</li>
        <li>Stripe (payments & subscriptions)</li>
        <li>OpenAI (text processing)</li>
        <li>ElevenLabs (text-to-speech)</li>
        <li>[Your hosting / database vendor, e.g., Vercel, Supabase] (hosting/storage)</li>
      </ul>
      <p>We do not sell or rent your personal data.</p>

      <h2>4. Lawful Basis</h2>
      <p>
        Under UK GDPR/EU GDPR, we process data on the basis of contract
        (providing the service), legitimate interests (service improvement),
        and consent (e.g., optional analytics/cookies where applicable).
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We keep personal data while your account is active and for as long as
        necessary for legal/operational purposes. You can request deletion at
        any time.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        You may request access, correction, deletion, restriction, or
        portability of your personal data, and object to certain processing.
        To exercise these rights, contact us at{" "}
        <a href="mailto:[support@dyslexiawrite.com]">[your-email]</a>.
      </p>

      <h2>7. Security</h2>
      <p>
        We use appropriate technical and organisational measures. However, no
        method of transmission or storage is 100% secure.
      </p>

      <h2>8. International Transfers</h2>
      <p>
        Some providers may process data outside the UK/EU. We use appropriate
        safeguards (e.g., Standard Contractual Clauses) where required.
      </p>

      <h2>9. Children</h2>
      <p>
        The service is not directed to children under 13. If you believe a
        child provided data, contact us to remove it.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this policy. We’ll post changes here and update the
        “Effective Date”.
      </p>

      <h2>11. Contact</h2>
      <p>
        📧 <a href="mailto:[support@dyslexiawrite.com]">[support@dyslexiawrite.com]</a>
      </p>
    </main>
  );
}
