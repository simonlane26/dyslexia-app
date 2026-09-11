'use client';

import React from 'react';
import { landing } from '@/lib/landingTheme';
import { Reveal } from './Reveal';

interface CoreBenefit {
  eyebrow: string;
  title: string;
  description: string;
  imgSrc: string;
  imgAlt: string;
}

const CORE_BENEFITS: CoreBenefit[] = [
  {
    eyebrow: 'Writing',
    title: 'Three ways to say it, one click to apply',
    description:
      "Select any sentence and Dyslexia Write offers three real alternatives — Simpler, Clearer, or More confident — each with a plain-English note on why it changed. No grammar jargon, just a version that actually sounds like you.",
    imgSrc: '/images/screenshots/shot-rewrite.png',
    imgAlt: 'The Dyslexia Write rewrite panel showing three alternative versions of a sentence — Simpler, Clearer, and More confident — each with an Apply button',
  },
  {
    eyebrow: 'Writing',
    title: 'Catches the mistakes dyslexic writers make most',
    description:
      'Standard spellcheckers miss reversed letters and homophones like their/there or weather/whether. Dyslexia Write catches them specifically, underlines them right where they happen, and explains the fix in plain language.',
    imgSrc: '/images/screenshots/shot-grammar.png',
    imgAlt: 'A paragraph of text with grammar and homophone mistakes underlined in red and amber wavy lines, directly in the editor',
  },
  {
    eyebrow: 'Reading',
    title: 'Reading modes built for how your brain reads',
    description:
      "Clean mode strips away distractions. Guided mode focuses your eyes line by line. Supported mode adds a reading ruler, colour tint, and full audio. Switch between them any time — there's no single 'right' way to read.",
    imgSrc: '/images/screenshots/shot-reading.png',
    imgAlt: 'A document open in Guided reading mode, with each word underlined to help track along the line',
  },
  {
    eyebrow: 'Writing',
    title: 'An AI mentor that asks before it helps',
    description:
      "Instead of guessing, the Writing Mentor asks what you're writing and who it's for, then gives suggestions tailored to that — an email reads differently to an essay, and it treats them that way.",
    imgSrc: '/images/screenshots/shot-mentor.png',
    imgAlt: 'The Writing Mentor side panel, asking "What are you writing today?" with quick-start options like Email, Essay, and Work message',
  },
];

function BenefitRow({ benefit, reversed }: { benefit: CoreBenefit; reversed: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '48px',
        alignItems: 'center',
        padding: '48px 0',
      }}
      className="benefit-row"
    >
      <div style={{ order: reversed ? 2 : 1 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: landing.amberDark,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '12px',
          }}
        >
          {benefit.eyebrow}
        </div>
        <h3
          style={{
            fontFamily: landing.fontDisplay,
            fontSize: 'clamp(21px, 2.6vw, 26px)',
            fontWeight: 600,
            color: landing.ink,
            marginBottom: '12px',
            lineHeight: 1.25,
          }}
        >
          {benefit.title}
        </h3>
        <p style={{ fontSize: '15.5px', color: landing.inkMuted, lineHeight: 1.7, margin: 0 }}>
          {benefit.description}
        </p>
      </div>
      <div style={{ order: reversed ? 1 : 2 }}>
        <div
          style={{
            borderRadius: '16px',
            border: `1px solid ${landing.line}`,
            overflow: 'hidden',
            background: '#f1f5f9',
            boxShadow: '0 12px 32px rgba(43, 42, 40, 0.08)',
            height: '360px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <img
            src={benefit.imgSrc}
            alt={benefit.imgAlt}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
          />
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <div style={{ padding: '70px 20px', backgroundColor: landing.bg }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: landing.amberDark,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '14px',
              }}
            >
              Features
            </div>
            <h2 style={{ fontFamily: landing.fontDisplay, fontSize: 'clamp(26px, 4vw, 32px)', fontWeight: 600, marginBottom: '14px', color: landing.ink }}>
              How Dyslexia Write works
            </h2>
            <p style={{ color: landing.inkMuted, fontSize: '15.5px', maxWidth: '640px', margin: '0 auto', lineHeight: 1.65, textAlign: 'left' }}>
              You write or paste text into the editor, and Dyslexia Write checks it in real time for the
              spelling and grammar mistakes dyslexic writers make most often — reversed letters,
              homophones, and missed words. Select any sentence to get a simpler, clearer, or more
              confident rewrite in one click. When you&apos;d rather speak than type, dictate instead;
              when you&apos;d rather listen than read, have any document read back to you with each word
              highlighted as it&apos;s spoken.
            </p>
          </div>
        </Reveal>

        <div style={{ borderTop: `1px solid ${landing.line}`, marginTop: '40px' }}>
          {CORE_BENEFITS.map((benefit, i) => (
            <div key={benefit.title} style={{ borderBottom: `1px solid ${landing.line}` }}>
              <Reveal>
                <BenefitRow benefit={benefit} reversed={i % 2 === 1} />
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .benefit-row {
            grid-template-columns: 1fr !important;
          }
          .benefit-row > div {
            order: initial !important;
          }
        }
      `}</style>
    </div>
  );
}
