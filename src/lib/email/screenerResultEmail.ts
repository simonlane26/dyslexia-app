export interface ScreenerResultEmailInput {
  resultTitle: string; // e.g. "Your results show some indicators associated with dyslexia"
  audience: 'self' | 'parent-sen' | 'employer' | null;
  guideUrl: string;
  appUrl: string;
}

const B2B2C_LINE =
  "Buying for a team or a school? Reply to this email and I'll send licence pricing and an Access to Work-ready quote.";

export function buildScreenerResultEmail({ resultTitle, audience, guideUrl, appUrl }: ScreenerResultEmailInput) {
  const subject = 'Your dyslexia screener results';
  const showB2B2C = audience === 'employer' || audience === 'parent-sen';

  const text = [
    resultTitle,
    '',
    `Your 1-page guide (5 writing workarounds, and how to ask your employer or school to fund assistive tech): ${guideUrl}`,
    '',
    `Start writing with Dyslexia Write free: ${appUrl}`,
    ...(showB2B2C ? ['', B2B2C_LINE] : []),
  ].join('\n');

  const html = `
  <div style="font-family: Atkinson Hyperlegible, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #2C2C2A;">
    <p style="font-size: 15px; font-weight: 600; color: #1D9E75; margin: 0 0 20px;">DyslexiaWrite</p>
    <p style="font-size: 17px; line-height: 1.6; margin: 0 0 20px;">${resultTitle}</p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
      Here's your 1-page guide: 5 writing workarounds that help most adults with dyslexia — and how to
      ask your employer or school to fund assistive tech.
    </p>
    <p style="margin: 0 0 28px;">
      <a href="${guideUrl}" style="font-size: 15px; font-weight: 700; color: #1D9E75;">Download the guide (PDF) →</a>
    </p>
    <p style="margin: 0 0 28px;">
      <a href="${appUrl}" style="display: inline-block; background: #1D9E75; color: #ffffff; font-size: 16px; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
        Start writing with Dyslexia Write free →
      </a>
    </p>
    ${
      showB2B2C
        ? `<p style="font-size: 14px; line-height: 1.6; color: #534AB7; background: #EEEDFE; border: 1px solid #CECBF6; border-radius: 12px; padding: 14px 16px; margin: 0 0 20px;">${B2B2C_LINE}</p>`
        : ''
    }
    <p style="font-size: 12px; color: #888780; margin: 28px 0 0;">
      This screener is a screening tool, not a diagnosis. DyslexiaWrite Ltd · dyslexiawrite.com
    </p>
  </div>`;

  return { subject, text, html };
}
