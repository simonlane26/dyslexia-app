import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement | DyslexiaWrite",
  description:
    "DyslexiaWrite's commitment to providing an accessible, inclusive writing environment for dyslexic and neurodiverse users.",
};

export default function AccessibilityPage() {
  return (
    <main className="max-w-3xl px-6 py-12 mx-auto prose prose-slate dark:prose-invert">
      <h1>Accessibility Statement</h1>
      <p><strong>DyslexiaWrite</strong></p>
      <p><strong>Last updated:</strong> 28 February 2026</p>

      <p>
        DyslexiaWrite is committed to providing an accessible, inclusive writing
        environment for dyslexic and neurodiverse users. We believe writing tools
        should adapt to how people think and process information — not force users
        to adapt to rigid systems.
      </p>
      <p>
        This accessibility statement outlines how DyslexiaWrite supports
        accessibility, where there may currently be limitations, and how users
        can report any issues.
      </p>

      <h2>Our commitment to accessibility</h2>
      <p>
        DyslexiaWrite has been designed with accessibility and neurodiversity at
        its core. The platform aims to support individuals who experience
        difficulties with reading, writing, focus, or information processing,
        including users with dyslexia, ADHD, and other neurodivergent conditions.
      </p>
      <p>
        We are committed to aligning with the Web Content Accessibility Guidelines
        (WCAG) 2.1 Level AA wherever reasonably possible and to continuously
        improving accessibility as the product evolves.
      </p>

      <h2>What DyslexiaWrite does well</h2>
      <p>
        DyslexiaWrite includes a range of accessibility and assistive features
        designed to reduce cognitive load, anxiety, and visual stress:
      </p>

      <h3>Visual &amp; reading support</h3>
      <ul>
        <li>Dyslexia-friendly fonts (including OpenDyslexic)</li>
        <li>Adjustable font size and spacing</li>
        <li>Customisable background colours to reduce visual stress</li>
        <li>Optional high-contrast mode</li>
        <li>Reading guide and highlighting tools</li>
        <li>Calm, uncluttered interface with clear visual hierarchy</li>
      </ul>

      <h3>Writing &amp; comprehension support</h3>
      <ul>
        <li>Real-time grammar and spelling assistance using non-judgemental language</li>
        <li>AI-powered writing coach focused on clarity and confidence (not grading)</li>
        <li>Text simplification tools to reduce complexity while preserving meaning</li>
        <li>Read-aloud functionality with selectable voices</li>
        <li>Dictation support for users who prefer speaking to typing</li>
      </ul>

      <h3>Interaction &amp; navigation</h3>
      <ul>
        <li>Full keyboard navigation support</li>
        <li>Clearly labelled buttons with icons and text</li>
        <li>Keyboard shortcuts for common actions</li>
        <li>Focus mode to reduce distractions</li>
        <li>No reliance on colour alone to convey meaning</li>
      </ul>

      <h3>Emotional &amp; cognitive accessibility</h3>
      <ul>
        <li>No grades, scores, or red-pen style corrections</li>
        <li>Supportive, confidence-building language throughout the app</li>
        <li>User-controlled settings with the ability to reset at any time</li>
      </ul>

      <h2>Known limitations</h2>
      <p>
        While we strive to make DyslexiaWrite as accessible as possible, we
        acknowledge that some limitations may still exist:
      </p>
      <ul>
        <li>
          Screen reader support is improving and may not yet provide a fully
          optimal experience across all assistive technologies
        </li>
        <li>
          Some advanced AI-powered features may produce content that varies in
          clarity depending on input and context
        </li>
        <li>
          Accessibility preferences are applied at the user level and may require
          adjustment on first use
        </li>
        <li>Full WCAG 2.2 conformance testing is ongoing</li>
      </ul>
      <p>
        We actively track and prioritise accessibility improvements based on user
        feedback and testing.
      </p>

      <h2>Reporting accessibility issues</h2>
      <p>
        If you experience any accessibility barriers while using DyslexiaWrite,
        we encourage you to let us know.
      </p>
      <p>You can report issues by:</p>
      <ul>
        <li>
          Emailing:{" "}
          <a href="mailto:support@dyslexiawrite.com">support@dyslexiawrite.com</a>
        </li>
        <li>Or replying directly to any DyslexiaWrite communication email</li>
      </ul>
      <p>
        When reporting an issue, it is helpful (but not required) to include:
      </p>
      <ul>
        <li>A description of the problem</li>
        <li>The device and browser you are using</li>
        <li>Any assistive technology in use (e.g. screen reader)</li>
      </ul>
      <p>
        All reports are reviewed personally, and we aim to respond promptly.
      </p>

      <h2>Commitment to continuous improvement</h2>
      <p>Accessibility is not a one-time task — it is an ongoing commitment.</p>
      <p>We regularly:</p>
      <ul>
        <li>Review user feedback from dyslexic and neurodiverse users</li>
        <li>Test new features against accessibility best practices</li>
        <li>Improve language, layout, and interaction patterns</li>
        <li>Update this statement as the platform evolves</li>
      </ul>
      <p>
        DyslexiaWrite is designed to support employers, schools, and individuals
        in meeting accessibility and reasonable adjustment needs under the
        Equality Act 2010, and we are committed to improving the platform as
        standards, guidance, and user needs evolve.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions about this accessibility statement or
        DyslexiaWrite&apos;s approach to inclusive design, please contact:
      </p>
      <p>
        <strong>Simon Lane</strong><br />
        Founder – DyslexiaWrite<br />
        <a href="mailto:Dyslexiawrite@gmail.com">Dyslexiawrite@gmail.com</a><br />
        <a href="https://www.dyslexiawrite.com">https://www.dyslexiawrite.com</a>
      </p>
    </main>
  );
}
