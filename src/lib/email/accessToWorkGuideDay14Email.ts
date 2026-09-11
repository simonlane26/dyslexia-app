export interface Day14EmailInput {
  firstName: string | null;
  guideUrl: string;
  appUrl: string;
}

// Note: the original brief called for a "case study" here. We don't have a
// verified, named Access to Work case study to point to, and inventing one
// would be fabricated social proof — so this is honest, pattern-level
// reassurance about where most applicants are at the two-week mark instead.
export function buildDay14Email({ firstName, guideUrl, appUrl }: Day14EmailInput) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const subject = "Still waiting on Access to Work? Here's what's normal at this point";

  const text = [
    greeting,
    '',
    "It's been about two weeks since you asked for the Access to Work funding guide, so a quick check-in.",
    '',
    "If you haven't heard back from the DWP yet, that's completely normal right now — their own target is 25 working days, but current backlogs mean many applicants wait well beyond that. It's not a sign anything's wrong.",
    '',
    'A few things worth doing while you wait:',
    "- Double-check you have your Access to Work reference number saved somewhere safe",
    "- If it's been over 25 working days, it's reasonable to call the helpline (0800 121 7479) and ask for a status update quoting that reference number",
    '- Keep using Dyslexia Write\'s free tier if you haven\'t already — it means you can genuinely tell your assessor "I\'ve already tried it and it helps", which is exactly the kind of concrete evidence that speeds up a recommendation',
    '',
    `Re-read the guide any time: ${guideUrl}`,
    `Start writing free (no card required): ${appUrl}`,
    '',
    "We'll check in again in a few weeks. Reply any time if you want a hand with anything.",
  ].join('\n');

  const html = `
  <div style="font-family: Atkinson Hyperlegible, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #2C2C2A;">
    <p style="font-size: 15px; font-weight: 600; color: #2F7A6B; margin: 0 0 20px;">DyslexiaWrite</p>
    <p style="font-size: 17px; line-height: 1.6; margin: 0 0 20px;">${greeting}</p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      It's been about two weeks since you asked for the Access to Work funding guide, so a quick check-in.
    </p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      If you haven't heard back from the DWP yet, that's completely normal right now — their own
      target is 25 working days, but current backlogs mean many applicants wait well beyond that.
      It's not a sign anything's wrong.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #6B6558; background: #F4EEDE; border-radius: 12px; padding: 16px 18px; margin: 0 0 24px;">
      <strong style="color: #2C2C2A;">While you wait:</strong><br/>
      • Keep your Access to Work reference number saved somewhere safe<br/>
      • Past 25 working days? It's reasonable to call 0800 121 7479 and ask for a status update<br/>
      • Try the free tier now, so you can honestly tell your assessor you've already used it and it helps
    </p>
    <p style="margin: 0 0 16px;">
      <a href="${guideUrl}" style="font-size: 15px; font-weight: 700; color: #2F7A6B;">Re-read the guide (PDF) →</a>
    </p>
    <p style="margin: 0 0 28px;">
      <a href="${appUrl}" style="display: inline-block; background: #D98C2B; color: #ffffff; font-size: 16px; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
        Start writing free →
      </a>
    </p>
    <p style="font-size: 12px; color: #888780; margin: 28px 0 0;">
      DyslexiaWrite Ltd · dyslexiawrite.com · Reply any time if you want a hand with anything.
    </p>
  </div>`;

  return { subject, text, html };
}
