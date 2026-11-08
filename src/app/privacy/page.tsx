import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DyslexiaWrite',
  description:
    'DyslexiaWrite Privacy Policy: the account, payment and usage data we collect, how your writing is processed by OpenAI/ElevenLabs, and your GDPR rights.',
  alternates: { canonical: 'https://www.dyslexiawrite.com/privacy' },
};

export default function PrivacyPage() {
  const today = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="max-w-3xl px-6 py-12 mx-auto prose prose-slate dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Effective Date:</strong> {today}
      </p>

      <p>
        Welcome to <strong>DyslexiaWrite</strong> ("we", "our", "us"), a product of IgnisTech Ltd.
        Your privacy is important to us. This policy explains how we collect, use, and protect your
        information when you use our website and app at dyslexiawrite.com.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account Information</strong>: Name, email, and login data via our authentication
          provider (Clerk).
        </li>
        <li>
          <strong>Payment Information</strong>: Processed by Stripe. We do not store card details.
        </li>
        <li>
          <strong>Usage Data</strong>: App activity (e.g., simplifications, preferences).
        </li>
        <li>
          <strong>Content</strong>: Text you submit to an AI feature (Simplify, Rewrite, Writing
          Coach, AI Writing Assistant) or for audio creation, processed by OpenAI (or OpenRouter as
          a backup if OpenAI is unavailable) and ElevenLabs respectively. Text you check with the
          grammar/spell checker is sent directly from your browser to LanguageTool, a third-party
          checking service, and does not pass through our servers. All of these AI and grammar
          features are optional and can be turned off in the app&apos;s settings.
        </li>
        <li>
          <strong>Free Screener (optional)</strong>: The screener itself runs on your device and
          isn&apos;t stored. If you choose to email yourself a copy of your result, we store the
          email address and result category (not your individual answers) so we can send it, and
          occasional related tips you can unsubscribe from at any time.
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
        <li>Stripe (payments &amp; subscriptions)</li>
        <li>OpenAI (AI text processing)</li>
        <li>OpenRouter (backup AI text processing, used only if OpenAI is unavailable)</li>
        <li>LanguageTool (grammar and spell checking)</li>
        <li>ElevenLabs (text-to-speech)</li>
        <li>Resend (transactional email delivery)</li>
        <li>Vercel (hosting) and Supabase — EU region (database)</li>
      </ul>
      <p>We do not sell or rent your personal data.</p>

      <h2>4. Lawful Basis</h2>
      <p>
        Under UK GDPR/EU GDPR, we process data on the basis of contract (providing the service),
        legitimate interests (service improvement), and consent (e.g., optional analytics/cookies
        where applicable).
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We keep personal data while your account is active and for as long as necessary for
        legal/operational purposes. You can request deletion at any time.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Under UK GDPR you have the right to access, correct, delete, restrict, or port your
        personal data, and to object to certain processing. To exercise any of these rights,
        contact us at{' '}
        <a href="mailto:support@dyslexiawrite.com">support@dyslexiawrite.com</a>.
      </p>

      <h2>7. Security</h2>
      <p>
        We use appropriate technical and organisational measures to protect your data. However,
        no method of transmission or storage is 100% secure.
      </p>

      <h2>8. International Transfers</h2>
      <p>
        Some providers may process data outside the UK/EU. We use appropriate safeguards
        (e.g., Standard Contractual Clauses) where required.
      </p>

      <h2>9. Children</h2>
      <p>
        The service is not directed to children under 13. If you believe a child has provided
        data, contact us to remove it.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this policy. We will post changes here and update the "Effective Date".
      </p>

      <h2>11. How to Make a Complaint</h2>
      <p>
        If you have a complaint about how we handle your personal data, please contact us first:
      </p>
      <p>
        <strong>Email:</strong>{' '}
        <a href="mailto:support@dyslexiawrite.com">support@dyslexiawrite.com</a>
      </p>
      <p>
        We will acknowledge your complaint within 30 days and investigate it promptly. We aim
        to resolve all complaints fairly and thoroughly.
      </p>
      <p>
        If you are not satisfied with our response, or if you feel we have not addressed your
        concern adequately, you have the right to escalate your complaint to the UK Information
        Commissioner&apos;s Office (ICO):
      </p>
      <ul>
        <li>
          <strong>Website:</strong>{' '}
          <a href="https://ico.org.uk/make-a-complaint" target="_blank" rel="noopener noreferrer">
            ico.org.uk/make-a-complaint
          </a>
        </li>
        <li>
          <strong>Helpline:</strong> 0303 123 1113
        </li>
      </ul>

      <h2>12. Contact</h2>
      <p>
        For any privacy-related questions:{' '}
        <a href="mailto:support@dyslexiawrite.com">support@dyslexiawrite.com</a>
        <br />
        IgnisTech Ltd · United Kingdom
      </p>
    </main>
  );
}
