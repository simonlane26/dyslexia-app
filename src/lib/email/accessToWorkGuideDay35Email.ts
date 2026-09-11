export interface Day35EmailInput {
  firstName: string | null;
  appUrl: string;
  atwUrl: string;
}

// Note: the original brief framed this as "once funding typically clears" —
// but real 2026 DWP-reported processing times mean most applicants are
// still waiting at the 5-week mark, not newly funded. Reframed to be honest
// either way, rather than assuming approval has landed.
export function buildDay35Email({ firstName, appUrl, atwUrl }: Day35EmailInput) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const subject = 'One month on — heard back yet?';

  const text = [
    greeting,
    '',
    "It's been about five weeks since you signed up for our Access to Work funding guide.",
    '',
    "If your grant has come through — congratulations! Send us your Access to Work reference number and we'll set up your account the same day, no paperwork on your end.",
    '',
    "If you're still waiting, you're far from alone right now — current DWP backlogs mean this is common well past this point. Worth a call to the helpline (0800 121 7479) for a status update if you haven't checked in recently.",
    '',
    "Either way, there's no need to wait to start: the free tier is unlimited, no card required, and if funding does come through later, upgrading takes two minutes.",
    '',
    `Full Access to Work walkthrough: ${atwUrl}`,
    `Start writing free: ${appUrl}`,
  ].join('\n');

  const html = `
  <div style="font-family: Atkinson Hyperlegible, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #2C2C2A;">
    <p style="font-size: 15px; font-weight: 600; color: #2F7A6B; margin: 0 0 20px;">DyslexiaWrite</p>
    <p style="font-size: 17px; line-height: 1.6; margin: 0 0 20px;">${greeting}</p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      It's been about five weeks since you signed up for our Access to Work funding guide.
    </p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
      <strong>If your grant has come through</strong> — congratulations! Send us your Access to
      Work reference number and we'll set up your account the same day, no paperwork on your end.
    </p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      <strong>If you're still waiting</strong>, you're far from alone right now — current DWP
      backlogs mean this is common well past this point. Worth a call to
      <strong>0800 121 7479</strong> for a status update if you haven't checked in recently.
    </p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
      Either way, there's no need to wait to start: the free tier is unlimited, no card required,
      and if funding does come through later, upgrading takes two minutes.
    </p>
    <p style="margin: 0 0 16px;">
      <a href="${atwUrl}" style="font-size: 14px; color: #6B6558;">Full Access to Work walkthrough →</a>
    </p>
    <p style="margin: 0 0 28px;">
      <a href="${appUrl}" style="display: inline-block; background: #D98C2B; color: #ffffff; font-size: 16px; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
        Start writing free →
      </a>
    </p>
    <p style="font-size: 12px; color: #888780; margin: 28px 0 0;">
      DyslexiaWrite Ltd · dyslexiawrite.com
    </p>
  </div>`;

  return { subject, text, html };
}
