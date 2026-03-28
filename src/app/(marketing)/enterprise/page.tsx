'use client';
import { useState } from 'react';
import Link from 'next/link';

const S = {
  page: { fontFamily: "'DM Sans', system-ui, sans-serif", color: '#2C2C2A', lineHeight: 1.7, background: '#fff' } as React.CSSProperties,
  hero: { padding: '80px 40px 60px', textAlign: 'center' as const, background: 'linear-gradient(180deg,#E1F5EE 0%,#fff 100%)' },
  badge: { display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: '#E1F5EE', color: '#085041', fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid #9FE1CB' },
  h1: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 600, lineHeight: 1.2, color: '#2C2C2A', maxWidth: 800, margin: '0 auto 16px' },
  em: { fontStyle: 'italic', color: '#0F6E56' },
  sub: { fontSize: 18, color: '#5F5E5A', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 },
  actions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const },
  btnPrimary: { padding: '14px 32px', borderRadius: 10, background: '#1D9E75', color: '#fff', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'inline-block', textDecoration: 'none' },
  btnSecondary: { padding: '14px 32px', borderRadius: 10, background: '#fff', color: '#2C2C2A', fontSize: 15, fontWeight: 500, border: '1px solid #D3D1C7', cursor: 'pointer', display: 'inline-block', textDecoration: 'none' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: '#F1EFE8', margin: '0 40px', borderRadius: 16, overflow: 'hidden' },
  stat: { background: '#fff', padding: '32px 20px', textAlign: 'center' as const },
  statNum: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, color: '#0F6E56', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#5F5E5A', lineHeight: 1.4 },
  section: { padding: '80px 40px' },
  sectionGray: { padding: '80px 40px', background: '#F8F7F4' },
  sectionLabel: { fontSize: 13, fontWeight: 500, color: '#0F6E56', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 },
  h2: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 600, lineHeight: 1.25, marginBottom: 16, color: '#2C2C2A' },
  sectionDesc: { fontSize: 16, color: '#5F5E5A', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 1000, margin: '0 auto' },
  featCard: { background: '#F8F7F4', borderRadius: 12, padding: '28px 24px', border: '1px solid transparent' },
  featIcon: (bg: string) => ({ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14, background: bg }),
  featH3: { fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#2C2C2A' },
  featP: { fontSize: 14, color: '#5F5E5A', lineHeight: 1.6 },
  compGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800, margin: '0 auto' },
  compCard: { border: '1px solid #D3D1C7', borderRadius: 12, padding: 24, background: '#fff' },
  compH3: { fontSize: 15, fontWeight: 600, marginBottom: 8, color: '#2C2C2A' },
  compP: { fontSize: 14, color: '#5F5E5A', lineHeight: 1.6 },
  testimonial: { maxWidth: 700, margin: '0 auto', background: '#F8F7F4', borderRadius: 16, padding: 40, textAlign: 'center' as const },
  quote: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontStyle: 'italic', color: '#2C2C2A', lineHeight: 1.6, marginBottom: 16 },
  cite: { fontStyle: 'normal', fontSize: 14, color: '#888780' },
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 1000, margin: '0 auto' },
  priceCard: (pop: boolean) => ({ background: '#fff', border: pop ? '2px solid #534AB7' : '1px solid #D3D1C7', borderRadius: 14, padding: '28px 22px', position: 'relative' as const }),
  pricePopBadge: { position: 'absolute' as const, top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 12, background: '#EEEDFE', color: '#3C3489', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' as const },
  priceName: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 600, textAlign: 'center' as const, marginBottom: 2 },
  priceSub: { fontSize: 13, color: '#888780', textAlign: 'center' as const, marginBottom: 16 },
  priceAmount: (color: string) => ({ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, textAlign: 'center' as const, marginBottom: 2, color }),
  pricePer: { fontSize: 12, color: '#888780', textAlign: 'center' as const, marginBottom: 4 },
  priceEquiv: { fontSize: 11, color: '#888780', textAlign: 'center' as const, marginBottom: 20, fontStyle: 'italic' },
  priceDivider: { height: 1, background: '#F1EFE8', margin: '0 -22px 16px' },
  priceFeat: { fontSize: 13, color: '#5F5E5A', padding: '3px 0', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 },
  check: { color: '#1D9E75', flexShrink: 0, fontWeight: 600 },
  priceBtn: (bg: string) => ({ display: 'block', width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 500, textAlign: 'center' as const, cursor: 'pointer', marginTop: 18, border: 'none', background: bg, color: '#fff', textDecoration: 'none' }),
  compareBox: { maxWidth: 700, margin: '32px auto 0', background: '#fff', borderRadius: 12, border: '1px solid #D3D1C7', overflow: 'hidden' },
  compareRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #F1EFE8', fontSize: 14 },
  atwBanner: { maxWidth: 700, margin: '24px auto 0', background: '#E1F5EE', borderRadius: 12, padding: '20px 24px', border: '1px solid #9FE1CB' },
  formSection: { background: '#04342C', color: '#fff', padding: '80px 40px' },
  formWrap: { maxWidth: 560, margin: '0 auto' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  formGroup: { marginBottom: 12 },
  formLabel: { display: 'block', fontSize: 13, color: '#5DCAA5', marginBottom: 4, fontWeight: 500 },
  formInput: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const },
  formSelect: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const },
  formSubmit: { width: '100%', padding: 14, borderRadius: 8, background: '#1D9E75', color: '#fff', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', marginTop: 6 },
  formNote: { fontSize: 12, color: '#5DCAA5', textAlign: 'center' as const, marginTop: 12, opacity: 0.7 },
  footer: { padding: 40, borderTop: '1px solid #F1EFE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 16 },
  footerLeft: { fontSize: 13, color: '#888780' },
  footerLinks: { display: 'flex', gap: 24 },
};

export default function EnterprisePage() {
  const [submitted, setSubmitted] = useState(false);

  const features = [
    { icon: '✍️', bg: '#E1F5EE', h: 'AI writing support', p: 'Simplify, rewrite, and improve any text. Catches dyslexia-specific errors like homophones and phonetic spellings that normal spell-checkers miss.' },
    { icon: '🔊', bg: '#EEEDFE', h: 'Read any document aloud', p: 'Natural-sounding voices read emails, PDFs, and web pages. Employees hear their writing back to catch errors before sending.' },
    { icon: '🌐', bg: '#FAEEDA', h: 'Chrome extension', p: 'Works inside Gmail, Outlook, Slack, Teams, and any website. Simplifies web pages and helps with forms — everywhere they work.' },
    { icon: '🎙️', bg: '#E6F1FB', h: 'Voice dictation', p: 'Speak naturally and see words appear. For employees who think faster than they type, dictation removes the biggest barrier.' },
    { icon: '📊', bg: '#E1F5EE', h: 'Usage analytics for HR', p: 'See adoption rates, most-used features, and aggregate engagement. Prove the ROI of your accessibility investment.' },
    { icon: '📋', bg: '#EEEDFE', h: 'Accessibility passport', p: 'Each employee builds a personal accessibility profile that follows them across teams and roles.' },
  ];

  const compliance = [
    { h: 'Equality Act 2010', p: 'Providing DyslexiaWrite counts as a reasonable adjustment. We include template documentation proving your compliance — ready for any audit or tribunal.' },
    { h: 'Access to Work approved', p: 'Eligible for full DWP Access to Work funding. Employees can claim the cost through the government scheme — so the employer often pays nothing.' },
    { h: 'GDPR compliant', p: 'Employee writing is never stored or used for AI training. Data Processing Agreements provided. EU data hosting available.' },
    { h: 'Quarterly impact reports', p: 'Automated reports showing tool adoption, engagement metrics, and accessibility outcomes for your D&I report.' },
  ];

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.badge}>For employers &amp; HR teams</div>
        <h1 style={S.h1}>Support your neurodiverse employees to <em style={S.em}>thrive</em></h1>
        <p style={S.sub}>DyslexiaWrite gives dyslexic employees AI-powered writing and reading tools that work everywhere they do. 70% cheaper than legacy alternatives.</p>
        <div style={S.actions}>
          <a href="#inquiry" style={S.btnPrimary}>Book a demo</a>
          <a href="#pricing" style={S.btnSecondary}>View pricing</a>
        </div>
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#888780', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Trusted by Disability Confident employers</p>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', opacity: 0.4 }}>
            {['Disability Confident', 'GDPR Compliant', 'Equality Act Ready', 'Access to Work Eligible'].map(l => (
              <span key={l} style={{ fontSize: 14, fontWeight: 600, color: '#5F5E5A' }}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div style={S.stats}>
        {[['1 in 10','UK employees are dyslexic'],['70%','cheaper than TextHelp Read&Write'],['100%','fundable via Access to Work'],['2 min','setup per employee, no IT needed']].map(([n,l]) => (
          <div key={n} style={S.stat}>
            <div style={S.statNum}>{n}</div>
            <div style={S.statLabel} dangerouslySetInnerHTML={{ __html: l }} />
          </div>
        ))}
      </div>

      {/* Why */}
      <section style={S.section}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={S.sectionLabel}>The business case</div>
          <h2 style={S.h2}>Dyslexia support isn't charity. It's smart business.</h2>
          <p style={S.sectionDesc}>Employees with dyslexia bring creative problem-solving, visual thinking, and innovation. But without the right tools, they spend hours battling emails and reports. DyslexiaWrite removes that barrier.</p>
        </div>
        <div style={S.featGrid}>
          {features.map(f => (
            <div key={f.h} style={S.featCard}>
              <div style={S.featIcon(f.bg)}>{f.icon}</div>
              <h3 style={S.featH3}>{f.h}</h3>
              <p style={S.featP}>{f.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance */}
      <section style={S.sectionGray}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={S.sectionLabel}>Legal compliance</div>
          <h2 style={S.h2}>Meet your Equality Act obligations with confidence</h2>
          <p style={S.sectionDesc}>UK employers have a legal duty to make reasonable adjustments for disabled employees. DyslexiaWrite makes compliance simple and affordable.</p>
        </div>
        <div style={S.compGrid}>
          {compliance.map(c => (
            <div key={c.h} style={S.compCard}>
              <h3 style={S.compH3}>{c.h}</h3>
              <p style={S.compP}>{c.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section style={S.section}>
        <div style={S.testimonial}>
          <blockquote style={S.quote}>"Before DyslexiaWrite, I'd spend 45 minutes on a single email, terrified of making mistakes. Now I write confidently in minutes. My manager noticed the difference within a week."</blockquote>
          <cite style={S.cite}>Employee with dyslexia, using DyslexiaWrite through Access to Work</cite>
        </div>
      </section>

      {/* Pricing */}
      <section style={S.sectionGray} id="pricing">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={S.sectionLabel}>Pricing</div>
          <h2 style={S.h2}>Simple, transparent, and 70% less than alternatives</h2>
          <p style={S.sectionDesc}>No hidden fees. No per-feature charges. Every plan includes the full DyslexiaWrite experience.</p>
        </div>
        <div style={S.pricingGrid}>
          {/* Starter */}
          <div style={S.priceCard(false)}>
            <div style={S.priceName}>Starter</div>
            <div style={S.priceSub}>Individual employees</div>
            <div style={S.priceAmount('#0F6E56')}>£120</div>
            <div style={S.pricePer}>per user / year</div>
            <div style={S.priceEquiv}>£10/month per user</div>
            <div style={S.priceDivider} />
            {['Full Pro features','Chrome extension','All premium voices','Email and chat support','Personal usage reports','1–5 users','Access to Work eligible'].map(f => (
              <div key={f} style={S.priceFeat}><span style={S.check}>✓</span>{f}</div>
            ))}
            <a href="#inquiry" style={S.priceBtn('#1D9E75')}>Get started</a>
          </div>
          {/* Business */}
          <div style={S.priceCard(true)}>
            <div style={S.pricePopBadge}>Most popular</div>
            <div style={S.priceName}>Business</div>
            <div style={S.priceSub}>Teams and departments</div>
            <div style={S.priceAmount('#534AB7')}>£95</div>
            <div style={S.pricePer}>per user / year</div>
            <div style={S.priceEquiv}>£7.92/month per user</div>
            <div style={S.priceDivider} />
            {['Everything in Starter','Admin dashboard','Bulk user management','Usage analytics for HR','SSO integration','6–50 users','Priority support','Onboarding session included'].map(f => (
              <div key={f} style={S.priceFeat}><span style={S.check}>✓</span>{f}</div>
            ))}
            <a href="#inquiry" style={S.priceBtn('#534AB7')}>Talk to sales</a>
          </div>
          {/* Enterprise */}
          <div style={S.priceCard(false)}>
            <div style={S.priceName}>Enterprise</div>
            <div style={S.priceSub}>Organisation-wide</div>
            <div style={S.priceAmount('#185FA5')}>Custom</div>
            <div style={S.pricePer}>volume pricing</div>
            <div style={S.priceEquiv}>From £60/user/year at scale</div>
            <div style={S.priceDivider} />
            {['Everything in Business','Unlimited users','Accessibility passport','Custom branding','API access','Dedicated account manager','Equality Act compliance pack','Quarterly impact reports'].map(f => (
              <div key={f} style={S.priceFeat}><span style={S.check}>✓</span>{f}</div>
            ))}
            <a href="#inquiry" style={S.priceBtn('#185FA5')}>Contact us</a>
          </div>
        </div>

        <div style={S.compareBox}>
          {[['TextHelp Read&Write single licence (3yr avg)','£378–500/user/year',false],['DyslexiaWrite Starter','£120/user/year',false],['DyslexiaWrite Business','£95/user/year',false],['Your saving vs legacy tools','68–81% cheaper',true]].map(([l,v,g]) => (
            <div key={String(l)} style={{ ...S.compareRow, borderBottom: l === 'Your saving vs legacy tools' ? 'none' : '1px solid #F1EFE8' }}>
              <span style={{ color: '#5F5E5A' }} dangerouslySetInnerHTML={{ __html: String(l) }} />
              <span style={{ fontWeight: 500, color: g ? '#0F6E56' : '#2C2C2A' }}>{String(v)}</span>
            </div>
          ))}
        </div>

        <div style={S.atwBanner}>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#085041', marginBottom: 6 }}>Access to Work funding available</h4>
          <p style={{ fontSize: 14, color: '#0F6E56', lineHeight: 1.6 }}>
            DyslexiaWrite is eligible for Access to Work grants. Employees can claim the full licence cost — meaning the employer pays nothing.{' '}
            <Link href="/access-to-work" style={{ color: '#085041', fontWeight: 500, textDecoration: 'underline' }}>Learn how it works →</Link>
          </p>
        </div>
      </section>

      {/* Inquiry Form */}
      <section style={S.formSection} id="inquiry">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ ...S.sectionLabel, color: '#5DCAA5' }}>Get started</div>
          <h2 style={{ ...S.h2, color: '#fff' }}>Let's talk about supporting your team</h2>
          <p style={{ ...S.sectionDesc, color: '#9FE1CB' }}>Tell us about your organisation and we'll get back to you within one working day.</p>
        </div>
        {submitted ? (
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Thanks — we'll be in touch!</h3>
            <p style={{ color: '#9FE1CB', fontSize: 15 }}>We'll respond within 1 working day.</p>
          </div>
        ) : (
          <div style={S.formWrap}>
            <div style={S.formRow}>
              <div><label style={S.formLabel}>First name *</label><input style={S.formInput} placeholder="Jane" /></div>
              <div><label style={S.formLabel}>Last name *</label><input style={S.formInput} placeholder="Smith" /></div>
            </div>
            <div style={S.formGroup}><label style={S.formLabel}>Work email *</label><input type="email" style={S.formInput} placeholder="jane@company.co.uk" /></div>
            <div style={S.formRow}>
              <div><label style={S.formLabel}>Company name *</label><input style={S.formInput} placeholder="Acme Ltd" /></div>
              <div>
                <label style={S.formLabel}>Your role</label>
                <select style={S.formSelect}>
                  {['Select...','HR / People','Diversity & Inclusion','Wellbeing / Health','IT / Procurement','Manager supporting an employee','Employee (self-referral)','Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={S.formRow}>
              <div>
                <label style={S.formLabel}>Number of employees</label>
                <select style={S.formSelect}>
                  {['Select...','1–5','6–20','21–50','51–200','201–1000','1000+'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={S.formLabel}>Interested in</label>
                <select style={S.formSelect}>
                  {['Select...','Starter (1–5 users)','Business (6–50 users)','Enterprise (50+ users)','Access to Work claim','Not sure yet'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Anything else?</label>
              <textarea style={{ ...S.formInput, resize: 'vertical', minHeight: 80 }} placeholder="Tell us about your accessibility needs, timelines, or any questions..." />
            </div>
            <button style={S.formSubmit} onClick={() => setSubmitted(true)}>Send inquiry</button>
            <p style={S.formNote}>We'll respond within 1 working day. No sales spam, ever.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={S.footerLeft}>© 2026 DyslexiaWrite. Confidence support for neurodiverse minds.</div>
        <div style={S.footerLinks}>
          {[['Privacy','/privacy'],['Terms','/terms'],['Access to Work','/access-to-work'],['For Schools','/schools'],['Pricing','/pricing']].map(([l,h]) => (
            <Link key={h} href={h} style={{ fontSize: 13, color: '#888780', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
