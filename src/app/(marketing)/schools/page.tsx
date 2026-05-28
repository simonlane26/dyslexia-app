'use client';
import { useState } from 'react';
import Link from 'next/link';
import React from 'react';
import { Brain, Mic, Volume2, Smartphone, Pen, BookOpen, GraduationCap, BarChart2, ClipboardList, Calendar, Sparkles, Check } from 'lucide-react';

const S = {
  page: { fontFamily: "'DM Sans', system-ui, sans-serif", color: '#2C2C2A', lineHeight: 1.7, background: '#fff' } as React.CSSProperties,

  // Hero
  hero: { padding: '80px 40px 60px', textAlign: 'center' as const, background: 'linear-gradient(180deg,#EEEDFE 0%,#fff 100%)' },
  badge: { display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: '#EEEDFE', color: '#3C3489', fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid #CECBF6' },
  h1: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(32px,5vw,50px)', fontWeight: 600, lineHeight: 1.2, color: '#2C2C2A', maxWidth: 800, margin: '0 auto 16px' },
  em: { fontStyle: 'italic', color: '#534AB7' },
  sub: { fontSize: 18, color: '#5F5E5A', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 },
  actions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const },
  btnPrimary: { padding: '14px 32px', borderRadius: 10, background: '#1D9E75', color: '#fff', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', display: 'inline-block', textDecoration: 'none' },
  btnSecondary: { padding: '14px 32px', borderRadius: 10, background: '#fff', color: '#2C2C2A', fontSize: 15, fontWeight: 500, border: '1px solid #D3D1C7', cursor: 'pointer', display: 'inline-block', textDecoration: 'none' },
  trustRow: { marginTop: 40, display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' as const },
  trustItem: { fontSize: 13, color: '#888780', display: 'flex', alignItems: 'center', gap: 6 },

  // Stats
  statsWrap: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: '#F1EFE8', margin: '0 40px', borderRadius: 16, overflow: 'hidden' as const },
  stat: { background: '#fff', padding: '32px 20px', textAlign: 'center' as const },
  statNum: (color: string) => ({ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, marginBottom: 4, color }),
  statLabel: { fontSize: 13, color: '#5F5E5A', lineHeight: 1.4 },

  // Sections
  section: { padding: '80px 40px' },
  sectionGray: { padding: '80px 40px', background: '#F8F7F4' },
  sectionDark: { padding: '80px 40px', background: '#04342C', color: '#fff' },
  sectionCenter: { maxWidth: 800, margin: '0 auto', textAlign: 'center' as const },
  sectionLabel: (color: string) => ({ fontSize: 13, fontWeight: 500, color, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 }),
  h2: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 600, lineHeight: 1.25, marginBottom: 16, color: '#2C2C2A' },
  h2Light: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 600, lineHeight: 1.25, marginBottom: 16, color: '#fff' },
  sectionDesc: { fontSize: 16, color: '#5F5E5A', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.7 },
  sectionDescLight: { fontSize: 16, color: '#9FE1CB', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.7 },

  // Before/After
  problemGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  problemCardBefore: { borderRadius: 14, padding: '28px 24px', background: '#FAECE7', border: '1px solid #F5C4B3' },
  problemCardAfter: { borderRadius: 14, padding: '28px 24px', background: '#E1F5EE', border: '1px solid #9FE1CB' },
  problemTag: (color: string) => ({ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12, color }),
  problemItem: { fontSize: 14, color: '#5F5E5A', padding: '6px 0', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 } as React.CSSProperties,

  // Features
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 1000, margin: '0 auto' } as React.CSSProperties,
  featureCard: { background: '#F8F7F4', borderRadius: 14, padding: '28px 24px', border: '1px solid transparent' },
  featureIcon: (bg: string) => ({ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14, background: bg }),
  featureH3: { fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#2C2C2A' },
  featureP: { fontSize: 14, color: '#5F5E5A', lineHeight: 1.6 },

  // Reading modes
  modesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  modeCard: (bg: string, border: string) => ({ borderRadius: 14, padding: 24, textAlign: 'center' as const, border: `2px solid ${border}`, background: bg }),
  modeEmoji: { fontSize: 32, display: 'block' as const, marginBottom: 10 },
  modeH3: { fontSize: 16, fontWeight: 600, margin: '0 0 4px' },
  modeSub: (color: string) => ({ fontSize: 12, fontWeight: 500, marginBottom: 10, color }),
  modeP: { fontSize: 13, color: '#5F5E5A', lineHeight: 1.5 },

  // Dashboard
  dashboardBox: { maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 16, border: '1px solid #D3D1C7', overflow: 'hidden' as const },
  dashboardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F1EFE8' },
  dashboardTitle: { fontSize: 15, fontWeight: 600, color: '#2C2C2A' },
  dashboardBody: { padding: 24 },
  studentRow: { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid #F1EFE8' } as React.CSSProperties,
  studentRowLast: { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0' } as React.CSSProperties,
  studentAvatar: (bg: string) => ({ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#fff', background: bg, flexShrink: 0 }),
  studentName: { fontSize: 14, fontWeight: 500, flex: 1 },
  studentMode: (bg: string, color: string) => ({ fontSize: 12, padding: '3px 10px', borderRadius: 10, fontWeight: 500, background: bg, color }),
  studentWords: { fontSize: 13, color: '#888780', minWidth: 100, textAlign: 'right' as const },
  studentTrend: (color: string) => ({ fontSize: 12, fontWeight: 500, minWidth: 50, textAlign: 'right' as const, color }),

  // SENCO
  sencoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 800, margin: '0 auto' } as React.CSSProperties,
  sencoCard: { background: '#fff', border: '1px solid #D3D1C7', borderRadius: 14, padding: 24 },
  sencoH3: { fontSize: 15, fontWeight: 600, color: '#2C2C2A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 },
  sencoP: { fontSize: 14, color: '#5F5E5A', lineHeight: 1.6 },

  // Testimonials
  testimonialsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800, margin: '0 auto' } as React.CSSProperties,
  testimonial: { background: '#F8F7F4', borderRadius: 14, padding: 28 },
  blockquote: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontStyle: 'italic', fontWeight: 400, color: '#2C2C2A', lineHeight: 1.6, marginBottom: 14 },
  cite: { fontStyle: 'normal', fontSize: 13, color: '#888780', display: 'block' as const },

  // Pricing
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 1000, margin: '0 auto' } as React.CSSProperties,
  priceCard: { background: '#fff', border: '1px solid #D3D1C7', borderRadius: 14, padding: '28px 22px', position: 'relative' as const },
  priceCardPop: { background: '#fff', border: '2px solid #534AB7', borderRadius: 14, padding: '28px 22px', position: 'relative' as const },
  pricePop: { position: 'absolute' as const, top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 12, background: '#EEEDFE', color: '#3C3489', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' as const },
  priceName: { fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 600, textAlign: 'center' as const, marginBottom: 2 },
  priceSub: { fontSize: 13, color: '#888780', textAlign: 'center' as const, marginBottom: 16 },
  priceAmount: (color: string) => ({ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, textAlign: 'center' as const, marginBottom: 2, color }),
  pricePer: { fontSize: 12, color: '#888780', textAlign: 'center' as const, marginBottom: 20 },
  priceDivider: { height: 1, background: '#F1EFE8', margin: '0 -22px 16px' },
  priceFeat: { fontSize: 13, color: '#5F5E5A', padding: '3px 0', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 } as React.CSSProperties,
  priceCheck: { color: '#1D9E75', flexShrink: 0, fontWeight: 600 },
  priceBtn: (bg: string) => ({ display: 'block', width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 500, textAlign: 'center' as const, cursor: 'pointer', marginTop: 18, border: 'none', background: bg, color: '#fff', textDecoration: 'none' } as React.CSSProperties),
  priceNote: { maxWidth: 700, margin: '24px auto 0', textAlign: 'center' as const, fontSize: 14, color: '#888780', lineHeight: 1.6 },

  // Form
  formWrap: { maxWidth: 560, margin: '0 auto' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 } as React.CSSProperties,
  formGroup: { marginBottom: 12 },
  formLabel: { display: 'block', fontSize: 13, color: '#9FE1CB', marginBottom: 4, fontWeight: 500 },
  formInput: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontFamily: "'DM Sans', system-ui, sans-serif" } as React.CSSProperties,
  formSelect: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14 } as React.CSSProperties,
  formSubmit: { width: '100%', padding: 14, borderRadius: 8, background: '#1D9E75', color: '#fff', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', marginTop: 6 },
  formNote: { fontSize: 12, color: '#9FE1CB', textAlign: 'center' as const, marginTop: 12, opacity: 0.7 },

  // Footer
  footer: { padding: '40px', borderTop: '1px solid #F1EFE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 16 },
  footerLeft: { fontSize: 13, color: '#888780' },
  footerLinks: { display: 'flex', gap: 24 },
  footerLink: { fontSize: 13, color: '#888780', textDecoration: 'none' },
};

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  schoolName: string;
  role: string;
  schoolType: string;
  senCount: string;
  message: string;
}

export default function SchoolsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', schoolName: '',
    role: '', schoolType: '', senCount: '', message: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('mailto:Dyslexiawrite@gmail.com');
    const body = `School inquiry from ${form.firstName} ${form.lastName}\nEmail: ${form.email}\nSchool: ${form.schoolName}\nRole: ${form.role}\nSchool type: ${form.schoolType}\nSEN students: ${form.senCount}\n\n${form.message}`;
    window.location.href = `mailto:Dyslexiawrite@gmail.com?subject=School demo request — ${form.schoolName}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <div style={S.page}>
      {/* HERO */}
      <section style={S.hero}>
        <div style={S.badge}>For schools, SENCOs &amp; SEN teachers</div>
        <h1 style={S.h1}>Every dyslexic student deserves to feel <em style={S.em}>confident</em> with words</h1>
        <p style={S.sub}>AI-powered writing and reading support that meets each student where they are. Real progress data for SENCOs. From £300/year for your whole school.</p>
        <div style={S.actions}>
          <a href="#inquiry" style={S.btnPrimary}>Book a school demo</a>
          <a href="#pricing" style={S.btnSecondary}>View school pricing</a>
        </div>
        <div style={S.trustRow}>
          <span style={S.trustItem}><span>✅</span> Incensu registered education supplier</span>
          <span style={S.trustItem}><span>🔒</span> GDPR compliant &amp; UK data hosting</span>
          <span style={S.trustItem}><span>♿</span> Designed with dyslexic users</span>
        </div>
      </section>

      {/* STATS */}
      <div style={S.statsWrap}>
        <div style={S.stat}><div style={S.statNum('#534AB7')}>1 in 10</div><div style={S.statLabel}>students are dyslexic</div></div>
        <div style={S.stat}><div style={S.statNum('#0F6E56')}>3</div><div style={S.statLabel}>reading modes that track progress</div></div>
        <div style={S.stat}><div style={S.statNum('#BA7517')}>2 min</div><div style={S.statLabel}>setup per student, no IT needed</div></div>
        <div style={S.stat}><div style={S.statNum('#D85A30')}>Real</div><div style={S.statLabel}>SENCO evidence from day one</div></div>
      </div>

      {/* BEFORE / AFTER */}
      <section style={S.section}>
        <div style={S.sectionCenter}>
          <div style={S.sectionLabel('#534AB7')}>The problem you know</div>
          <h2 style={S.h2}>What changes when dyslexic students have the right tools</h2>
        </div>
        <div style={S.problemGrid}>
          <div style={S.problemCardBefore}>
            <div style={S.problemTag('#993C1D')}>WITHOUT DYSLEXIAWRITE</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>😔</span> Student avoids writing tasks and falls behind</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>😔</span> Red underlines everywhere destroy confidence</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>😔</span> Reading homework takes three times as long</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>😔</span> SENCO has anecdotal evidence only</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>😔</span> Parents feel helpless at home</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>😔</span> Teaching assistants stretched across too many students</div>
          </div>
          <div style={S.problemCardAfter}>
            <div style={S.problemTag('#0F6E56')}>WITH DYSLEXIAWRITE</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>✅</span> Student writes independently with AI support</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>✅</span> Gentle green suggestions build confidence</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>✅</span> Three reading modes match support to ability</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>✅</span> Class dashboard gives SENCO real data</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>✅</span> Students can use it at home too</div>
            <div style={S.problemItem}><span style={{ flexShrink: 0 }}>✅</span> AI scales support without extra staff</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={S.sectionGray}>
        <div style={S.sectionCenter}>
          <div style={S.sectionLabel('#534AB7')}>What students get</div>
          <h2 style={S.h2}>Tools that support without doing the work for them</h2>
          <p style={S.sectionDesc}>DyslexiaWrite helps students improve, not just cope. Every feature is designed to build skills and confidence over time.</p>
        </div>
        <div style={S.featuresGrid}>
          {([
            { icon: <Pen size={20} />, bg: '#EEEDFE', title: 'Smart writing support', desc: 'AI simplifies and improves text while teaching the student why. Catches dyslexia-specific errors like homophones and phonetic spellings that standard spell-checkers miss.' },
            { icon: <BookOpen size={20} />, bg: '#E1F5EE', title: 'Three reading modes', desc: 'Clean, Guided, and Supported modes match the level of help to the student. As they improve, they move between modes — and that progression is tracked.' },
            { icon: <Volume2 size={20} />, bg: '#FAEEDA', title: 'Read aloud with karaoke sync', desc: 'Natural voices read text aloud while each word highlights in sync. Students follow along visually and aurally, building reading fluency without frustration.' },
            { icon: <Smartphone size={20} />, bg: '#FAECE7', title: 'Tap-to-decode vocabulary', desc: 'Tap any word to hear it pronounced, see it broken into syllables, and get a simple definition. Every tapped word is saved for spaced repetition vocabulary building.' },
            { icon: <Mic size={20} />, bg: '#E6F1FB', title: 'Voice dictation', desc: 'Students speak their ideas and see words appear. For students who think fluently but freeze when typing, dictation removes the biggest barrier to written expression.' },
            { icon: <Brain size={20} />, bg: '#EEEDFE', title: 'Writing coach', desc: 'An AI mentor that asks guiding questions: "Who is this for? What do you want them to do after reading it?" Scaffolds the writing process without writing it for them.' },
          ] as { icon: React.ReactNode; bg: string; title: string; desc: string }[]).map(f => (
            <div key={f.title} style={S.featureCard}>
              <div style={S.featureIcon(f.bg)}>{f.icon}</div>
              <h3 style={S.featureH3}>{f.title}</h3>
              <p style={S.featureP}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* READING MODES */}
      <section style={S.section}>
        <div style={S.sectionCenter}>
          <div style={S.sectionLabel('#534AB7')}>A reading journey</div>
          <h2 style={S.h2}>Three modes, one measurable journey</h2>
          <p style={S.sectionDesc}>Students start with maximum support and progress toward independence. The mode they use most tells you exactly where they are.</p>
        </div>
        <div style={S.modesGrid}>
          <div style={S.modeCard('#FAECE7', '#F5C4B3')}>
            <span style={S.modeEmoji}>🎧</span>
            <h3 style={S.modeH3}>Supported</h3>
            <div style={S.modeSub('#993C1D')}>Maximum help</div>
            <p style={S.modeP}>Voice reads aloud with karaoke highlighting. Reading mask focuses on one sentence at a time. Auto-advance pacing. For students who need full support to access text.</p>
          </div>
          <div style={S.modeCard('#EEEDFE', '#CECBF6')}>
            <span style={S.modeEmoji}>🔍</span>
            <h3 style={S.modeH3}>Guided</h3>
            <div style={S.modeSub('#534AB7')}>Visual support</div>
            <p style={S.modeP}>Reading ruler and paragraph focus help track across lines. Hover highlighting shows the current sentence. Student reads independently with visual scaffolding.</p>
          </div>
          <div style={S.modeCard('#E1F5EE', '#9FE1CB')}>
            <span style={S.modeEmoji}><Sparkles size={32} /></span>
            <h3 style={S.modeH3}>Clean</h3>
            <div style={S.modeSub('#0F6E56')}>Independent reading</div>
            <p style={S.modeP}>Dyslexia-friendly font, optimised spacing, and preferred colours. No additional visual aids. The student reads on their own. Tap-to-decode still available if needed.</p>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, color: '#888780', marginTop: 24, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          When Jamie moves from Supported to Guided after three months, that&apos;s measurable progress. When they reach Clean mode, that&apos;s evidence of genuine reading development — the kind of data SENCOs need for EHCPs and annual reviews.
        </p>
      </section>

      {/* CLASS DASHBOARD */}
      <section style={S.sectionGray}>
        <div style={S.sectionCenter}>
          <div style={S.sectionLabel('#534AB7')}>For SENCOs and teachers</div>
          <h2 style={S.h2}>A class dashboard that gives you real evidence</h2>
          <p style={S.sectionDesc}>See every student&apos;s progress at a glance. No more guessing whether the intervention is working.</p>
        </div>
        <div style={S.dashboardBox}>
          <div style={S.dashboardHeader}>
            <span style={S.dashboardTitle}>Class dashboard — Year 8 English</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, background: '#EEEDFE', color: '#3C3489', fontWeight: 500 }}>Progress</span>
              <span style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, color: '#888780' }}>Assignments</span>
              <span style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, color: '#888780' }}>Vocabulary</span>
            </div>
          </div>
          <div style={S.dashboardBody}>
            {[
              { init: 'JM', name: 'Jamie M.', bg: '#7F77DD', mode: 'Guided', modeBg: '#EEEDFE', modeColor: '#534AB7', words: '4,200 words this month', trend: '↑ 22%', trendColor: '#1D9E75' },
              { init: 'SB', name: 'Sophie B.', bg: '#1D9E75', mode: 'Clean', modeBg: '#E1F5EE', modeColor: '#0F6E56', words: '6,100 words this month', trend: '↑ 8%', trendColor: '#1D9E75' },
              { init: 'LK', name: 'Leo K.', bg: '#D85A30', mode: 'Supported', modeBg: '#FAECE7', modeColor: '#993C1D', words: '1,800 words this month', trend: '↑ 45%', trendColor: '#1D9E75' },
              { init: 'ER', name: 'Emily R.', bg: '#BA7517', mode: 'Guided', modeBg: '#EEEDFE', modeColor: '#534AB7', words: '3,400 words this month', trend: '→ 0%', trendColor: '#888780' },
            ].map((s, i, arr) => (
              <div key={s.init} style={i === arr.length - 1 ? S.studentRowLast : S.studentRow}>
                <div style={S.studentAvatar(s.bg)}>{s.init}</div>
                <div style={S.studentName}>{s.name}</div>
                <span style={S.studentMode(s.modeBg, s.modeColor)}>{s.mode}</span>
                <span style={S.studentWords}>{s.words}</span>
                <span style={S.studentTrend(s.trendColor)}>{s.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SENCO EVIDENCE */}
      <section style={S.section}>
        <div style={S.sectionCenter}>
          <div style={S.sectionLabel('#534AB7')}>Evidence that matters</div>
          <h2 style={S.h2}>Data that strengthens EHCPs and annual reviews</h2>
          <p style={S.sectionDesc}>DyslexiaWrite automatically generates the evidence SENCOs need, without adding to anyone&apos;s workload.</p>
        </div>
        <div style={S.sencoGrid}>
          {([
            { icon: <BarChart2 size={20} />, title: 'Reading mode progression', desc: 'Track which reading mode each student uses over time. Movement from Supported to Guided to Clean is concrete evidence of reading development.' },
            { icon: <Pen size={20} />, title: 'Writing confidence metrics', desc: 'Words written, rewrites per piece, vocabulary range, and self-correction rate. All tracked automatically, all trended over time.' },
            { icon: <BookOpen size={20} />, title: 'Vocabulary growth', desc: "Every word a student taps for help is logged. See which words they've learned (no longer tapping) and which they're still working on." },
            { icon: <Calendar size={20} />, title: 'Termly progress reports', desc: 'Auto-generated reports ready to attach to EHCPs, annual reviews, or parent meetings. Plain-language summaries, not raw data.' },
          ] as { icon: React.ReactNode; title: string; desc: string }[]).map(c => (
            <div key={c.title} style={S.sencoCard}>
              <h3 style={S.sencoH3}><span>{c.icon}</span> {c.title}</h3>
              <p style={S.sencoP}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={S.sectionGray}>
        <div style={S.sectionCenter}>
          <div style={S.sectionLabel('#534AB7')}>From schools</div>
          <h2 style={S.h2}>What teachers and students say</h2>
        </div>
        <div style={S.testimonialsGrid}>
          <div style={S.testimonial}>
            <blockquote style={S.blockquote}>&ldquo;For the first time, I can show governors exactly what impact our dyslexia intervention is having. The reading mode progression data alone has changed how we evidence SEN support.&rdquo;</blockquote>
            <cite style={S.cite}>SENCO, Secondary School</cite>
          </div>
          <div style={S.testimonial}>
            <blockquote style={S.blockquote}>&ldquo;I used to hate English. Now I actually finish my essays before everyone else because DyslexiaWrite helps me get my ideas out fast. My teacher said my last essay was my best ever.&rdquo;</blockquote>
            <cite style={S.cite}>Year 9 student with dyslexia</cite>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={S.sectionGray} id="pricing">
        <div style={S.sectionCenter}>
          <div style={S.sectionLabel('#534AB7')}>School pricing</div>
          <h2 style={S.h2}>Simple pricing that works for any school budget</h2>
          <p style={S.sectionDesc}>All plans include the full class dashboard, reading modes, writing tools, and SENCO evidence pack.</p>
        </div>
        <div style={S.pricingGrid}>
          {/* Starter */}
          <div style={S.priceCard}>
            <div style={S.priceName}>Starter</div>
            <div style={S.priceSub}>Small groups or SEN department</div>
            <div style={S.priceAmount('#0F6E56')}>£300</div>
            <div style={S.pricePer}>per year — up to 30 students</div>
            <div style={S.priceDivider} />
            {['Full writing and reading tools', 'Three reading modes', 'Class dashboard', 'Tap-to-decode vocabulary', 'Read Aloud with all voices', 'Student progress tracking', 'Email support'].map(f => (
              <div key={f} style={S.priceFeat}><span style={S.priceCheck}>✓</span> {f}</div>
            ))}
            <a href="#inquiry" style={S.priceBtn('#1D9E75')}>Get started</a>
          </div>
          {/* Department */}
          <div style={S.priceCardPop}>
            <div style={S.pricePop}>Most popular</div>
            <div style={S.priceName}>Department</div>
            <div style={S.priceSub}>Full department or key stage</div>
            <div style={S.priceAmount('#534AB7')}>£2,000</div>
            <div style={S.pricePer}>per year — up to 200 students</div>
            <div style={S.priceDivider} />
            {['Everything in Starter', 'Assignment management', 'Vocabulary builder with spaced repetition', 'Document Decoder', 'Auto-generated termly SENCO reports', 'Voice dictation', 'Staff training session included', 'Priority support'].map(f => (
              <div key={f} style={S.priceFeat}><span style={S.priceCheck}>✓</span> {f}</div>
            ))}
            <a href="#inquiry" style={S.priceBtn('#534AB7')}>Book a demo</a>
          </div>
          {/* Whole School */}
          <div style={S.priceCard}>
            <div style={S.priceName}>Whole School</div>
            <div style={S.priceSub}>Entire school, all year groups</div>
            <div style={S.priceAmount('#185FA5')}>£5,000</div>
            <div style={S.pricePer}>per year — unlimited students</div>
            <div style={S.priceDivider} />
            {['Everything in Department', 'Unlimited student accounts', 'Chrome extension for all students', 'Multi-teacher dashboard access', 'EHCP evidence pack generator', 'Story Mode with AI-generated content', 'Onsite or virtual training for all staff', 'Dedicated account manager'].map(f => (
              <div key={f} style={S.priceFeat}><span style={S.priceCheck}>✓</span> {f}</div>
            ))}
            <a href="#inquiry" style={S.priceBtn('#185FA5')}>Contact us</a>
          </div>
        </div>
        <p style={S.priceNote}>All plans include GDPR-compliant data processing, UK data hosting, and a 30-day free trial with no credit card required. Plans are billed annually. Multi-academy trust pricing available on request.</p>
      </section>

      {/* INQUIRY FORM */}
      <section style={S.sectionDark} id="inquiry">
        <div style={S.sectionCenter}>
          <div style={S.sectionLabel('#9FE1CB')}>Get started</div>
          <h2 style={S.h2Light}>See DyslexiaWrite in your school</h2>
          <p style={S.sectionDescLight}>Book a 20-minute demo tailored to your school. We&apos;ll show you the class dashboard, reading modes, and SENCO evidence — with your own example students.</p>
        </div>
        {submitted ? (
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 40, border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Check size={48} /></div>
            <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: '#fff', marginBottom: 8 }}>Thanks — we&apos;ll be in touch!</h3>
            <p style={{ fontSize: 14, color: '#9FE1CB' }}>We respond within 1 working day. If your email client didn&apos;t open, email us directly at <a href="mailto:Dyslexiawrite@gmail.com" style={{ color: '#5DCAA5' }}>Dyslexiawrite@gmail.com</a></p>
          </div>
        ) : (
          <form style={S.formWrap} onSubmit={handleSubmit}>
            <div style={S.formRow}>
              <div>
                <label style={S.formLabel}>First name *</label>
                <input name="firstName" type="text" required style={S.formInput} placeholder="Jane" value={form.firstName} onChange={handleChange} />
              </div>
              <div>
                <label style={S.formLabel}>Last name *</label>
                <input name="lastName" type="text" required style={S.formInput} placeholder="Smith" value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>School email *</label>
              <input name="email" type="email" required style={S.formInput} placeholder="jane@school.sch.uk" value={form.email} onChange={handleChange} />
            </div>
            <div style={S.formRow}>
              <div>
                <label style={S.formLabel}>School name *</label>
                <input name="schoolName" type="text" required style={S.formInput} placeholder="Riverside Academy" value={form.schoolName} onChange={handleChange} />
              </div>
              <div>
                <label style={S.formLabel}>Your role</label>
                <select name="role" style={S.formSelect} value={form.role} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option>SENCO</option>
                  <option>Head of English</option>
                  <option>SEN Teacher / TA</option>
                  <option>Headteacher / Deputy</option>
                  <option>IT Lead</option>
                  <option>Parent (recommending)</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div style={S.formRow}>
              <div>
                <label style={S.formLabel}>School type</label>
                <select name="schoolType" style={S.formSelect} value={form.schoolType} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option>Primary</option>
                  <option>Secondary</option>
                  <option>All-through</option>
                  <option>Special school</option>
                  <option>Multi-academy trust</option>
                  <option>Independent</option>
                  <option>FE / Sixth Form</option>
                </select>
              </div>
              <div>
                <label style={S.formLabel}>How many SEN students?</label>
                <select name="senCount" style={S.formSelect} value={form.senCount} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option>1-10</option>
                  <option>11-30</option>
                  <option>31-100</option>
                  <option>100+</option>
                  <option>Not sure</option>
                </select>
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Anything else?</label>
              <textarea name="message" style={{ ...S.formInput, resize: 'vertical', minHeight: 80 }} placeholder="Tell us about your SEN provision, any current tools you're using, or questions you have..." value={form.message} onChange={handleChange} />
            </div>
            <button type="submit" style={S.formSubmit}>Book my demo</button>
            <p style={S.formNote}>We&apos;ll respond within 1 working day. No sales pressure, ever.</p>
          </form>
        )}
      </section>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={S.footerLeft}>© 2026 DyslexiaWrite. Confidence support for neurodiverse minds.</div>
        <div style={S.footerLinks}>
          <Link href="/privacy" style={S.footerLink}>Privacy</Link>
          <Link href="/terms" style={S.footerLink}>Terms</Link>
          <Link href="/schools-privacy" style={S.footerLink}>Schools GDPR</Link>
          <Link href="/enterprise" style={S.footerLink}>For Employers</Link>
          <Link href="/access-to-work" style={S.footerLink}>Access to Work</Link>
        </div>
      </footer>
    </div>
  );
}
