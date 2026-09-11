export interface AccessToWorkGuideEmailInput {
  firstName: string | null;
  guideUrl: string;
  appUrl: string;
  atwUrl: string;
}

export function buildAccessToWorkGuideEmail({ firstName, guideUrl, appUrl, atwUrl }: AccessToWorkGuideEmailInput) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const subject = 'Your Access to Work funding guide';

  const text = [
    greeting,
    '',
    "Here's your free guide to the Access to Work application process for assistive software — the step-by-step breakdown, the wording that speeds up approval, and a funding request template you can hand to your employer, SENCO, or assessor.",
    '',
    `Download the guide (PDF): ${guideUrl}`,
    '',
    `Full Access to Work walkthrough: ${atwUrl}`,
    '',
    `When you're ready, start writing with Dyslexia Write free: ${appUrl}`,
    '',
    "We'll check in in a few weeks to see how your application's going. No spam, no sales calls — just a heads-up service for people mid-funding.",
  ].join('\n');

  const html = `
  <div style="font-family: Atkinson Hyperlegible, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #2C2C2A;">
    <p style="font-size: 15px; font-weight: 600; color: #2F7A6B; margin: 0 0 20px;">DyslexiaWrite</p>
    <p style="font-size: 17px; line-height: 1.6; margin: 0 0 20px;">${greeting}</p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
      Here's your free guide to the Access to Work application process for assistive software —
      the step-by-step breakdown, the wording that speeds up approval, and a funding request
      template you can hand to your employer, SENCO, or assessor.
    </p>
    <p style="margin: 0 0 20px;">
      <a href="${guideUrl}" style="font-size: 15px; font-weight: 700; color: #2F7A6B;">Download the guide (PDF) →</a>
    </p>
    <p style="margin: 0 0 28px;">
      <a href="${atwUrl}" style="font-size: 14px; color: #6B6558;">Or read the full Access to Work walkthrough on our site →</a>
    </p>
    <p style="margin: 0 0 28px;">
      <a href="${appUrl}" style="display: inline-block; background: #D98C2B; color: #ffffff; font-size: 16px; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
        Start writing with Dyslexia Write free →
      </a>
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #6B6558; background: #F4EEDE; border-radius: 12px; padding: 14px 16px; margin: 0 0 20px;">
      We'll check in in a few weeks to see how your application's going. No spam, no sales calls —
      just a heads-up service for people mid-funding.
    </p>
    <p style="font-size: 12px; color: #888780; margin: 28px 0 0;">
      DyslexiaWrite Ltd · dyslexiawrite.com · You're receiving this because you asked for our
      Access to Work funding guide. Reply to this email any time to opt out.
    </p>
  </div>`;

  return { subject, text, html };
}
