'use client';

import { landing } from '@/lib/landingTheme';
import { Reveal } from './Reveal';

const QA = [
  {
    q: 'Is Dyslexia Write funded by Access to Work?',
    a: "Yes. Dyslexia Write is assistive software that can be funded in full through an Access to Work grant for employed and self-employed adults in the UK — you pay nothing. Once your Access to Work assessment recommends dyslexia writing support and your grant is approved, send us your Access to Work reference number and we'll set up your account and invoice the DWP directly, so there's no paperwork on your end. Employers, disability leads and SENCOs can also buy multi-seat licences directly for a team or school. Email support@dyslexiawrite.com for a quote, help with your application, or a free trial before you apply.",
  },
  {
    q: 'Does Dyslexia Write work with Microsoft Word and Google Docs?',
    a: "It depends where you're writing. Dyslexia Write works inside Gmail, Google Docs, Outlook on the web, Slack and Microsoft Teams through our Chrome extension, plus its own built-in web editor — no need to copy text into a separate app for any of those. It doesn't yet have a native add-in for the Microsoft Word desktop app; if you write mainly in desktop Word, paste your text into the Dyslexia Write editor to get the same corrections. The web editor works in any modern browser on Windows, Mac, iOS and Android.",
  },
];

export function FundingCompatibilityFAQ() {
  return (
    <div style={{ padding: '60px 20px', backgroundColor: landing.bg }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: landing.fontDisplay,
              fontSize: 'clamp(24px, 3.6vw, 30px)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '32px',
              color: landing.ink,
            }}
          >
            Funding and compatibility questions
          </h2>
        </Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {QA.map(({ q, a }) => (
            <Reveal key={q}>
              <div
                style={{
                  background: landing.panel,
                  border: `1px solid ${landing.line}`,
                  borderRadius: '14px',
                  padding: '24px 26px',
                }}
              >
                <h3
                  style={{
                    fontFamily: landing.fontDisplay,
                    fontSize: '17px',
                    fontWeight: 600,
                    marginBottom: '10px',
                    color: landing.ink,
                  }}
                >
                  {q}
                </h3>
                <p style={{ fontSize: '14.5px', color: landing.inkMuted, lineHeight: 1.65, margin: 0 }}>{a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
