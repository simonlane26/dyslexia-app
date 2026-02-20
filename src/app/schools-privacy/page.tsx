import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Schools Privacy Policy | Dyslexia Writer",
  description:
    "How Dyslexia Writer handles student data for schools — GDPR compliant, EU-hosted, no student writing stored, no ads.",
};

export default function SchoolsPrivacyPage() {
  const Today = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl px-6 py-12 mx-auto prose prose-slate dark:prose-invert">
      <h1>Schools Privacy Policy</h1>
      <p>
        <strong>Effective Date:</strong> {Today}
      </p>

      <p>
        This policy applies specifically to schools, teachers, and students using
        Dyslexia Writer under a school plan. It explains exactly what data we
        collect, what we do not collect, and how we protect student privacy.
      </p>

      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '32px',
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#4c1d95' }}>
          Key commitments at a glance:
        </p>
        <ul style={{ margin: '12px 0 0 0' }}>
          <li>We never store, read, or process student writing</li>
          <li>No data is used to train AI models</li>
          <li>No advertising, ever</li>
          <li>All school data is hosted in the EU</li>
          <li>GDPR compliant — DPA available on request</li>
        </ul>
      </div>

      <h2>1. What Data We Collect From Schools</h2>
      <p>
        We collect <strong>only the minimum data needed</strong> to show teachers
        how their students are progressing as writers. We collect:
      </p>
      <ul>
        <li>Number of writing sessions (a count — not the writing itself)</li>
        <li>Number of words typed per session (a count — not the words themselves)</li>
        <li>How often the &ldquo;Make Simpler&rdquo; tool is used (a count)</li>
        <li>Average sentence length per session (a number — not the sentences)</li>
        <li>
          A display name chosen by the teacher — real student names are not
          required and are not stored by us
        </li>
      </ul>
      <p>
        <strong>
          We never store, access, transmit, or process any student writing content.
        </strong>{" "}
        Everything a student writes stays on their own device.
      </p>

      <h2>2. What We Do Not Collect</h2>
      <ul>
        <li>Student writing, essays, or any text content</li>
        <li>Real names (a teacher-chosen display name is all that is used)</li>
        <li>Date of birth or age data</li>
        <li>Photographs or biometric data</li>
        <li>Location data</li>
        <li>Behavioural or marketing data</li>
        <li>Any special category data under UK GDPR Article 9</li>
      </ul>

      <h2>3. How We Use School Data</h2>
      <p>Session metrics are used solely to:</p>
      <ul>
        <li>Display writing progress summaries to the class teacher</li>
        <li>Show positive progress badges (&ldquo;Writing Confidence Improving&rdquo;, &ldquo;Clearer Sentences&rdquo;)</li>
        <li>Operate and improve the Dyslexia Writer service</li>
      </ul>
      <p>
        We do not sell, rent, share, or monetise school data in any form. We do
        not use school data to train AI models.
      </p>

      <h2>4. Where Data Is Stored</h2>
      <p>
        All school session data is stored in the <strong>European Union</strong>{" "}
        using Supabase (EU region). Authentication data is managed by Clerk (SOC 2
        certified). Payments are processed by Stripe (PCI DSS compliant). None of
        your school data is stored or processed in a country without adequate data
        protection under UK GDPR.
      </p>

      <h2>5. GDPR Compliance and Legal Basis</h2>
      <p>
        We process school data under the following legal bases:
      </p>
      <ul>
        <li>
          <strong>Article 6(1)(b) UK GDPR</strong> — processing necessary for
          the performance of a contract (providing the school service)
        </li>
        <li>
          <strong>Article 6(1)(f) UK GDPR</strong> — legitimate interests in
          operating and improving our service, where these are not overridden by
          the rights of data subjects
        </li>
      </ul>
      <p>
        Schools act as <strong>data controllers</strong> for any student personal
        data they provide. Dyslexia Writer acts as a <strong>data processor</strong>{" "}
        on behalf of the school. A <strong>Data Processing Agreement (DPA)</strong>{" "}
        is available on request — please contact us at the address below.
      </p>

      <h2>6. ICO Registration</h2>
      <p>
        Dyslexia Writer is registered with the UK Information Commissioner&apos;s
        Office (ICO). Our registration number is available on request.
      </p>

      <h2>7. Data Retention</h2>
      <ul>
        <li>Writing session metrics are retained for <strong>12 months</strong> from creation</li>
        <li>
          School member records are deleted within <strong>30 days</strong> of
          subscription cancellation or written request
        </li>
        <li>
          Teachers may request immediate deletion of all school data at any time
          by contacting us
        </li>
      </ul>

      <h2>8. Age-Appropriate Use</h2>
      <p>
        Dyslexia Writer for Schools is designed for students aged <strong>7 and above</strong>,
        under teacher supervision. The tool does not:
      </p>
      <ul>
        <li>Require students to create public profiles</li>
        <li>Allow students to share content with other users</li>
        <li>Show advertising to students</li>
        <li>Use nudge techniques or engagement-maximising features</li>
      </ul>
      <p>
        School Mode automatically removes all references to &ldquo;AI&rdquo; and
        technical jargon, replaces red error markers with gentle suggestions, and
        uses calm, encouraging language throughout.
      </p>

      <h2>9. Your Rights</h2>
      <p>
        Under UK GDPR, you (and the students in your care) have the right to:
      </p>
      <ul>
        <li>Access personal data we hold</li>
        <li>Correct inaccurate data</li>
        <li>Request erasure (&ldquo;right to be forgotten&rdquo;)</li>
        <li>Restrict or object to processing</li>
        <li>Data portability</li>
      </ul>
      <p>
        Because we store only aggregate metrics (not content), most requests can
        be fulfilled immediately. Contact us to exercise any of these rights.
      </p>

      <h2>10. Contact and Data Protection</h2>
      <p>
        For DPO queries, data deletion requests, or to obtain a copy of our Data
        Processing Agreement:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:privacy@dyslexiawrite.com">privacy@dyslexiawrite.com</a>
        <br />
        <strong>Subject line:</strong> Schools Data Request
      </p>
      <p>
        We aim to respond to all data requests within <strong>72 hours</strong>.
      </p>

      <hr />
      <p style={{ fontSize: '14px', color: '#64748b' }}>
        Also see our{" "}
        <Link href="/privacy">general Privacy Policy</Link>
        {" "}and{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    </main>
  );
}
