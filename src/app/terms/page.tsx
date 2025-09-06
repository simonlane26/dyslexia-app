// src/app/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Dyslexia Writer",
  description:
    "Terms and conditions for using the Dyslexia Writer website and app.",
};

export default function TermsPage() {
  const Today = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl px-6 py-12 mx-auto prose prose-slate dark:prose-invert">
      <h1>Terms of Service</h1>
      <p>
        <strong>Effective Date:</strong> {Today}
      </p>

      <p>
        Welcome to <strong>[DyslexiaWrite.com]</strong> (“we”, “our”, “us”). By
        accessing or using our website and app, you agree to these Terms of
        Service.
      </p>

      <h2>1. Use of Service</h2>
      <ul>
        <li>You must be at least 13 years old to use the service.</li>
        <li>
          You agree not to misuse the service or upload unlawful, harmful, or
          abusive content.
        </li>
        <li>
          We may suspend or terminate accounts that violate these terms or harm
          the service or other users.
        </li>
      </ul>

      <h2>2. Accounts</h2>
      <ul>
        <li>You are responsible for your account and keeping your credentials secure.</li>
        <li>
          Please notify us immediately of any unauthorised use of your account.
        </li>
      </ul>

      <h2>3. Plans & Subscriptions</h2>
      <ul>
        <li>
          The Free plan includes limited features (e.g., daily simplification
          limits, limited voices).
        </li>
        <li>
          Pro and School plans provide additional features and higher limits.
        </li>
        <li>
          Features available per plan may change as we improve the service.
        </li>
      </ul>

      <h2>4. Payments & Renewals</h2>
      <ul>
        <li>Payments are processed by Stripe. We do not store card data.</li>
        <li>Subscriptions renew automatically unless cancelled.</li>
        <li>
          You can cancel at any time; access continues until the end of the
          current billing period.
        </li>
        <li>Refunds are handled in accordance with applicable law.</li>
      </ul>

      <h2>5. Content & Intellectual Property</h2>
      <ul>
        <li>You retain ownership of the text you submit.</li>
        <li>
          You grant us a limited licence to process your content to provide the
          service (e.g., simplify, convert to speech).
        </li>
        <li>
          We retain all rights to our software, design, branding, and services.
        </li>
      </ul>

      <h2>6. Third-Party Services</h2>
      <p>
        The service integrates with third-party providers (e.g., Clerk, Stripe,
        OpenAI, ElevenLabs). Your use of those services is subject to their
        terms and policies.
      </p>

      <h2>7. Disclaimer</h2>
      <p>
        The service is provided “as is” without warranties of any kind. We do
        not guarantee uninterrupted or error-free operation.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect,
        incidental, special, consequential, or punitive damages arising from
        your use of the service.
      </p>

      <h2>9. Changes to the Terms</h2>
      <p>
        We may update these Terms from time to time. The updated Terms will be
        posted here with the new Effective Date.
      </p>

      <h2>10. Governing Law</h2>
      <p>These Terms are governed by the laws of England and Wales.</p>

      <h2>11. Contact</h2>
      <p>
        Questions? Contact us at{" "}
        <a href="mailto:[support@dyslexiawrite.com]">[support@dyslexiawrite.com]</a>.
      </p>
    </main>
  );
}
