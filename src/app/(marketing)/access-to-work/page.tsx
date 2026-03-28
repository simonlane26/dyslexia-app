'use client';
import { useState } from 'react';
import Link from 'next/link';

const S = {
  page: { fontFamily: "'DM Sans', system-ui, sans-serif", color: '#2C2C2A', lineHeight: 1.7, background: '#fff' } as React.CSSProperties,
  hero: { padding: '80px 40px 60px', textAlign: 'center' as const, background: 'linear-gradient(180deg,#FAEEDA 0%,#fff 100%)' },
  badge: { display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: '#E1F5EE', color: '#085041', fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid #9FE1CB' },
  h1: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(32px,5vw,48px)', fontWeight: 600, lineHeight: 1.2, color: '#2C2C2A', maxWidth: 750, margin: '0 auto 16px' },
  em: { fontStyle: 'italic', color: '#0F6E56' },
  sub: { fontSize: 18, color: '#5F5E5A', maxWidth: 580, margin: '0 auto 32px', lineHeight: 1.6 },
  actions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const },
  btnPrimary: { padding: '14px 32px', borderRadius: 10, background: '#1D9E75', color: '#fff', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'inline-block', textDecoration: 'none' },
  btnSecondary: { padding: '14px 32px', borderRadius: 10, background: '#fff', color: '#2C2C2A', fontSize: 15, fontWeight: 500, border: '1px solid #D3D1C7', cursor: 'pointer', display: 'inline-block', textDecoration: 'none' },
  section: { padding: '60px 40px' },
  sectionGray: { padding: '60px 40px', background: '#F8F7F4' },
  sectionLabel: { fontSize: 13, fontWeight: 500, color: '#0F6E56', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 },
  h2: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 600, lineHeight: 1.25, marginBottom: 16, color: '#2C2C2A' },
  sectionDesc: { fontSize: 16, color: '#5F5E5A', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 },
  reassureBox: { background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: 12, padding: 24, textAlign: 'center' as const, maxWidth: 700, margin: '0 auto 60px' },
  benefitsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, maxWidth: 700, margin: '0 auto' },
  benefit: { background: '#F8F7F4', borderRadius: 12, padding: 20, border: '1px solid transparent' },
  benefitH3: { fontSize: 15, fontWeight: 600, color: '#2C2C2A', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 },
  benefitP: { fontSize: 13, color: '#5F5E5A', lineHeight: 1.6 },
  steps: { maxWidth: 700, margin: '0 auto' },
  step: { display: 'flex', gap: 20, marginBottom: 32 },
  stepNum: (bg: string, border: string, color: string) => ({ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 600, flexShrink: 0, background: bg, color, border: `2px solid ${border}` }),
  stepContent: { paddingTop: 4 },
  stepH3: { fontSize: 17, fontWeight: 600, color: '#2C2C2A', marginBottom: 4 },
  stepP: { fontSize: 14, color: '#5F5E5A', lineHeight: 1.7 },
  stepTip: { marginTop: 8, padding: '10px 14px', background: '#FAEEDA', fontSize: 13, color: '#633806', lineHeight: 1.5, borderLeft: '3px solid #FAC775', borderRadius: '0 8px 8px 0' },
  stepLink: { display: 'inline-block', marginTop: 8, padding: '6px 14px', borderRadius: 6, background: '#E1F5EE', color: '#085041', fontSize: 13, fontWeight: 500, border: '1px solid #9FE1CB', textDecoration: 'none' },
  priceCard: { background: '#fff', border: '2px solid #5DCAA5', borderRadius: 14, padding: 28, textAlign: 'center' as const, maxWidth: 500, margin: '0 auto' },
  priceBadge: { display: 'inline-block', padding: '4px 14px', borderRadius: 12, background: '#E1F5EE', color: '#085041', fontSize: 12, fontWeight: 500, marginBottom: 12 },
  priceTitle: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, marginBottom: 4 },
  priceSub: { fontSize: 13, color: '#888780', marginBottom: 16 },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  option: (sel: boolean) => ({ border: `1px solid ${sel ? '#1D9E75' : '#D3D1C7'}`, borderRadius: 10, padding: 14, cursor: 'pointer', background: sel ? '#E1F5EE' : '#fff', transition: 'all 0.2s' }),
  optionPrice: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, fontWeight: 600, color: '#0F6E56' },
  optionPer: { fontSize: 12, color: '#888780' },
  optionSave: { fontSize: 11, color: '#0F6E56', fontWeight: 500, marginTop: 4 },
  priceNote: { fontSize: 13, color: '#5F5E5A', marginBottom: 16, lineHeight: 1.5, padding: 12, background: '#E1F5EE', borderRadius: 8 },
  claimBtn: { display: 'block', width: '100%', padding: 14, borderRadius: 10, background: '#1D9E75', color: '#fff', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', textDecoration: 'none' },
  includes: { textAlign: 'left' as const, marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1EFE8' },
  inc: { fontSize: 13, color: '#5F5E5A', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 8 },
  faq: { maxWidth: 700, margin: '0 auto' },
  faqItem: { borderBottom: '1px solid #F1EFE8', padding: '18px 0' },
  faqQ: { fontSize: 15, fontWeight: 600, color: '#2C2C2A', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  faqA: { fontSize: 14, color: '#5F5E5A', lineHeight: 1.7, paddingTop: 10 },
  helpBox: { maxWidth: 700, margin: '40px auto 0', background: '#EEEDFE', borderRadius: 14, padding: 32, textAlign: 'center' as const, border: '1px solid #CECBF6' },
  footer: { padding: 40, borderTop: '1px solid #F1EFE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 16 },
};

const faqs = [
  ['Do I need a formal dyslexia diagnosis?', 'No. Access to Work supports anyone whose disability or health condition affects their work. Many people apply with a GP letter, an occupational health referral, or even a self-declaration. You don\'t need a formal diagnosis.'],
  ['Will my employer know I\'ve applied?', 'You apply directly to the DWP yourself. They will need a workplace contact to confirm you work there, but won\'t contact them without your permission. Your employer doesn\'t see the grant details or amount.'],
  ['How long does the process take?', 'From application to receiving your DyslexiaWrite licence, expect 2–4 weeks. The initial application takes about 20 minutes. Once approved, we can set up your account the same day.'],
  ['Does it affect my other benefits?', 'No. Access to Work grants do not affect Universal Credit, PIP, Employment Support Allowance, or any other benefits. It is completely separate from the benefits system.'],
  ['I\'m self-employed. Can I still apply?', 'Yes. Self-employed people are fully eligible. You\'ll need your Unique Taxpayer Reference (UTR) number when you apply. The process is the same as for employed applicants.'],
  ['What if the assessor recommends a different tool?', 'The assessor\'s recommendation is guidance, not a requirement. If they recommend assistive technology and you prefer DyslexiaWrite, you have the right to choose the tool that works best for you.'],
  ['How much does Access to Work pay?', 'For software like DyslexiaWrite, the DWP pays 100% of the cost. There\'s no contribution required from you or your employer.'],
  ['I\'m about to start a new job. Can I apply now?', 'Yes. You can apply before you start a new job, so your DyslexiaWrite licence is ready from day one.'],
];

export default function AccessToWorkPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(0);

  const plans = [
    { price: '£120', per: '1 year', save: null },
    { price: '£300', per: '3 years', save: 'Save £60' },
  ];

  const includes = [
    'Unlimited simplifications and rewrites',
    'All rewrite modes (Simpler, Clearer, More confident)',
    'Writing Coach and Mentor',
    'All premium text-to-speech voices',
    'Chrome extension (Gmail, Outlook, Slack, web)',
    'Page simplification on any website',
    'Voice dictation',
    'Guided and Supported reading modes',
    'Export as MP3, PDF, DOC',
    'Free onboarding call',
    'Email and chat support',
  ];

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.badge}>Access to Work — UK Government Scheme</div>
        <h1 style={S.h1}>Get DyslexiaWrite <em style={S.em}>completely free</em> through Access to Work</h1>
        <p style={S.sub}>The UK government will pay for your DyslexiaWrite licence. No cost to you. No cost to your employer. Here's exactly how to get it.</p>
        <div style={S.actions}>
          <a href="#steps" style={S.btnPrimary}>Show me how</a>
          <a href="#get-started" style={S.btnSecondary}>I already have a grant</a>
        </div>
      </section>

      {/* Reassurance */}
      <div style={{ padding: '0 40px', marginBottom: 0 }}>
        <div style={S.reassureBox}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#085041', marginBottom: 8 }}>You don't need a formal diagnosis</h3>
          <p style={{ fontSize: 15, color: '#0F6E56', lineHeight: 1.6 }}>Access to Work supports anyone whose disability or health condition affects their work. A GP letter, workplace assessment, or even self-declaration is often enough. You don't need to have been formally diagnosed with dyslexia.</p>
        </div>
      </div>

      {/* What is ATW */}
      <section style={S.sectionGray}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={S.sectionLabel}>What is Access to Work?</div>
          <h2 style={S.h2}>A government scheme that pays for the tools you need at work</h2>
          <p style={S.sectionDesc}>Access to Work is run by the Department for Work and Pensions. It provides grants to cover the cost of assistive technology for people with disabilities or health conditions. It's not a benefit — it doesn't affect any other benefits you receive.</p>
        </div>
        <div style={S.benefitsGrid}>
          {[
            ['✅','Completely free to you','The DWP pays 100% of the cost. You don\'t pay anything, and neither does your employer in most cases.'],
            ['✅','No effect on other benefits','Grants don\'t affect Universal Credit, PIP, or any other benefits. It doesn\'t matter how much you earn.'],
            ['✅','Available to everyone in work','Full-time, part-time, self-employed, or about to start a new job. As long as you\'re 16+ in England, Scotland, or Wales.'],
            ['✅','Your employer doesn\'t have to know the details','You apply directly to the DWP. They\'ll confirm you work there, but don\'t see grant details.'],
          ].map(([icon, h, p]) => (
            <div key={String(h)} style={S.benefit}>
              <h3 style={S.benefitH3}><span>{icon}</span>{h}</h3>
              <p style={S.benefitP}>{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section style={S.section} id="steps">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={S.sectionLabel}>Step by step</div>
          <h2 style={S.h2}>How to get your free DyslexiaWrite licence</h2>
          <p style={S.sectionDesc}>The whole process typically takes 2–4 weeks. Here's exactly what happens at each stage.</p>
        </div>
        <div style={S.steps}>
          <div style={S.step}>
            <div style={S.stepNum('#E1F5EE','#5DCAA5','#085041')}>1</div>
            <div style={S.stepContent}>
              <h3 style={S.stepH3}>Apply to Access to Work</h3>
              <p style={S.stepP}>Call the Access to Work helpline on <strong>0800 121 7479</strong> or apply online at GOV.UK. You'll need your National Insurance number and information about how dyslexia affects your work.</p>
              <div style={S.stepTip}>Tip: When they ask what support you need, mention "assistive technology software for dyslexia, specifically DyslexiaWrite" — being specific speeds up the process.</div>
              <a href="https://www.gov.uk/access-to-work" target="_blank" rel="noopener noreferrer" style={S.stepLink}>Apply on GOV.UK →</a>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum('#EEEDFE','#CECBF6','#3C3489')}>2</div>
            <div style={S.stepContent}>
              <h3 style={S.stepH3}>Workplace needs assessment</h3>
              <p style={S.stepP}>The DWP will arrange a workplace needs assessment. An assessor will talk to you about your role, your challenges, and what tools would help. This is usually a phone or video call lasting 30–60 minutes.</p>
              <div style={S.stepTip}>Tip: Tell the assessor you've already tried DyslexiaWrite and found it helpful. Assessors are more likely to recommend tools the employee has already had success with.</div>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum('#FAEEDA','#FAC775','#633806')}>3</div>
            <div style={S.stepContent}>
              <h3 style={S.stepH3}>Receive your recommendation</h3>
              <p style={S.stepP}>The assessor writes a report recommending specific tools. If they recommend DyslexiaWrite (or similar assistive technology), the DWP will approve a grant to cover the cost.</p>
              <div style={S.stepTip}>Tip: If the assessor recommends a different tool but you prefer DyslexiaWrite, you can request it instead — you have the right to choose the tool that works best for you.</div>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum('#E1F5EE','#5DCAA5','#085041')}>4</div>
            <div style={S.stepContent}>
              <h3 style={S.stepH3}>Claim your DyslexiaWrite licence</h3>
              <p style={S.stepP}>Once your grant is approved, contact us with your Access to Work reference number. We'll set up your account immediately and invoice the DWP directly — you don't handle any payments or paperwork.</p>
              <a href="#get-started" style={S.stepLink}>Claim your licence →</a>
            </div>
          </div>
          <div style={S.step}>
            <div style={{ ...S.stepNum('#1D9E75','#1D9E75','#fff') }}>✓</div>
            <div style={S.stepContent}>
              <h3 style={S.stepH3}>Start using DyslexiaWrite</h3>
              <p style={S.stepP}>Log in, install the Chrome extension, and you're ready. Your licence includes full Pro features, all premium voices, the Chrome extension, and email support. We'll offer a free 20-minute onboarding call to get you set up perfectly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={S.sectionGray} id="get-started">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={S.sectionLabel}>Pricing</div>
          <h2 style={S.h2}>DyslexiaWrite Access to Work licence</h2>
          <p style={S.sectionDesc}>Choose the option that suits you. The DWP pays the full amount — these prices are for the grant application only.</p>
        </div>
        <div style={S.priceCard}>
          <div style={S.priceBadge}>Access to Work eligible</div>
          <div style={S.priceTitle}>DyslexiaWrite Pro</div>
          <div style={S.priceSub}>Full workplace assistive technology licence</div>
          <div style={S.optionsGrid}>
            {plans.map((p, i) => (
              <div key={i} style={S.option(selectedPlan === i)} onClick={() => setSelectedPlan(i)}>
                <div style={S.optionPrice}>{p.price}</div>
                <div style={S.optionPer}>{p.per}</div>
                {p.save && <div style={S.optionSave}>{p.save}</div>}
              </div>
            ))}
          </div>
          <div style={S.priceNote}><strong style={{ color: '#085041' }}>You pay nothing.</strong> The DWP covers the full cost through your Access to Work grant. We invoice them directly on your behalf.</div>
          <a
            href={`mailto:enterprise@dyslexiawrite.com?subject=Access%20to%20Work%20licence%20claim&body=Hi%2C%0A%0AI%20have%20an%20Access%20to%20Work%20grant%20and%20would%20like%20to%20claim%20a%20${encodeURIComponent(plans[selectedPlan].per)}%20DyslexiaWrite%20licence.%0A%0AMy%20Access%20to%20Work%20reference%20number%20is%3A%20%0AMy%20name%20is%3A%20%0A%0AThank%20you`}
            style={S.claimBtn}
          >
            Claim with Access to Work grant
          </a>
          <div style={S.includes}>
            {includes.map(inc => (
              <div key={inc} style={S.inc}><span style={{ color: '#1D9E75', fontWeight: 600 }}>✓</span>{inc}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={S.section}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={S.sectionLabel}>Common questions</div>
          <h2 style={S.h2}>Everything you might be wondering</h2>
        </div>
        <div style={S.faq}>
          {faqs.map(([q, a], i) => (
            <div key={i} style={S.faqItem}>
              <div style={S.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{q}</span>
                <span style={{ fontSize: 18, color: '#888780', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>+</span>
              </div>
              {openFaq === i && <div style={S.faqA}>{a}</div>}
            </div>
          ))}
        </div>

        {/* Help box */}
        <div style={S.helpBox}>
          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 600, color: '#3C3489', marginBottom: 8 }}>Need help with your application?</h3>
          <p style={{ fontSize: 14, color: '#534AB7', lineHeight: 1.6, marginBottom: 16 }}>We know the Access to Work process can feel daunting. We're happy to support you at every step — just get in touch.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:support@dyslexiawrite.com?subject=Access%20to%20Work%20help" style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: '#534AB7', color: '#fff', textDecoration: 'none' }}>Email us for help</a>
            <Link href="/enterprise" style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: '#fff', color: '#3C3489', textDecoration: 'none', border: '1px solid #CECBF6' }}>For employers →</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={{ fontSize: 13, color: '#888780' }}>© 2026 DyslexiaWrite. Confidence support for neurodiverse minds.</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Privacy','/privacy'],['Terms','/terms'],['For Employers','/enterprise'],['For Schools','/schools'],['Pricing','/pricing']].map(([l,h]) => (
            <Link key={h} href={h} style={{ fontSize: 13, color: '#888780', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
