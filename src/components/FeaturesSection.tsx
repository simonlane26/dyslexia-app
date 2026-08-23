'use client';

import React from 'react';
import {
  Sparkles,
  BookOpen,
  Mic,
  SpellCheck,
  Edit3,
  Highlighter,
  Zap,
  Shield,
  Eye,
  Crown,
  Brain,
  Calendar,
  GraduationCap,
  Volume2,
  ScanText,
} from 'lucide-react';
import { landing } from '@/lib/landingTheme';
import { Reveal } from './Reveal';

interface Feature {
  icon: React.ReactNode;
  imgSrc?: string;
  title: string;
  description: string;
  isPro?: boolean;
  isNew?: boolean;
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div
      style={{
        backgroundColor: landing.panel,
        padding: '22px',
        borderRadius: '12px',
        border: `1px solid ${landing.line}`,
        transition: 'transform .2s, border-color .2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = landing.inkFaint;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = landing.line;
      }}
    >
      {feature.imgSrc ? (
        <div
          style={{
            width: '56px',
            height: '56px',
            marginBottom: '14px',
            borderRadius: '10px',
            border: `1px solid ${landing.line}`,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
          }}
        >
          <img
            src={feature.imgSrc}
            alt={feature.title}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '34px',
            height: '34px',
            marginBottom: '14px',
            color: landing.amberDark,
          }}
        >
          {feature.icon}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
        {feature.isNew && (
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '10px',
              letterSpacing: '0.03em',
              backgroundColor: landing.tealTint,
              color: landing.teal,
            }}
          >
            NEW
          </span>
        )}
        {feature.isPro && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '10px',
              letterSpacing: '0.03em',
              backgroundColor: landing.amberTint,
              color: landing.amberDark,
            }}
          >
            <Crown size={10} /> PRO
          </span>
        )}
      </div>

      <h4 style={{ fontFamily: landing.fontDisplay, fontSize: '16.5px', fontWeight: 600, margin: '0 0 8px', color: landing.ink }}>
        {feature.title}
      </h4>
      <p style={{ fontSize: '13.5px', color: landing.inkMuted, lineHeight: 1.55, margin: 0 }}>{feature.description}</p>
    </div>
  );
}

function CatDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '52px 0 24px' }}>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: landing.amberDark,
          backgroundColor: landing.amberTint,
          padding: '6px 12px',
          borderRadius: '14px',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: landing.line }} />
    </div>
  );
}

export function FeaturesSection() {
  const writingFeatures: Feature[] = [
    {
      icon: <Brain size={28} />,
      imgSrc: '/images/Notebookpencil.png',
      title: 'Writing Mentor',
      description:
        "Intent-first AI mentor that asks who you're writing for and why, then gives plain-English suggestions tailored to your audience, purpose, and tone. No jargon — just clear guidance.",
      isPro: true,
      isNew: true,
    },
    {
      icon: <SpellCheck size={28} />,
      imgSrc: '/images/Grammarcheck.png',
      title: 'Real-Time Grammar Check',
      description:
        'Dyslexia-aware grammar checking that catches homophones, letter reversals, and common transpositions. Click any underlined word for instant fixes.',
    },
    {
      icon: <Edit3 size={28} />,
      imgSrc: '/images/Rewrite.png',
      title: 'AI Sentence Rewriting',
      description:
        'Select any sentence and get 3 alternatives: Simpler, More confident, or Clearer. One click to apply — no grammar jargon, just plain language.',
      isPro: true,
    },
    {
      icon: <Sparkles size={28} />,
      imgSrc: '/images/Simplification.png',
      title: 'Smart Simplification',
      description:
        'AI-powered simplification that makes complex text easier to understand without losing meaning. Paste anything — an email, a letter, a form — and get a plain-English version.',
    },
    {
      icon: <Mic size={28} />,
      imgSrc: '/images/Dictation.png',
      title: 'Voice Dictation',
      description:
        'Speak naturally and see your words appear in the editor. Great for when typing feels difficult or you want to capture ideas quickly.',
    },
    {
      icon: <Zap size={28} />,
      imgSrc: '/images/Progresstrack.png',
      title: 'Progress Tracking',
      description:
        'See your writing improve over time with metrics like average sentence length and complex word usage. Encouraging, not overwhelming.',
    },
  ];

  const readingFeatures: Feature[] = [
    {
      icon: <Eye size={28} />,
      imgSrc: '/images/Readingmodes.png',
      title: 'Three Reading Modes',
      description:
        'Clean mode removes all distractions. Guided mode focuses line-by-line with a spotlight. Supported mode adds a reading ruler and colour tint. Choose the mode that works for your brain.',
      isNew: true,
    },
    {
      icon: <ScanText size={28} />,
      imgSrc: '/images/Brainbook.png',
      title: 'Memory Reading',
      description:
        'Any document broken into manageable chunks. Tap any word for its definition, pronunciation, and an example sentence. A running summary builds as you read — so nothing slips away.',
      isPro: true,
      isNew: true,
    },
    {
      icon: <Volume2 size={28} />,
      imgSrc: '/images/Readaloud.png',
      title: 'Read Aloud',
      description:
        'Listen to your text with high-quality AI voices. Hear how your writing sounds and catch mistakes you might miss while reading silently.',
    },
    {
      icon: <Highlighter size={28} />,
      imgSrc: '/images/Sentencehighlight.png',
      title: 'Sentence Highlighting',
      description:
        "Each sentence highlights as it's read aloud. Helps you stay on the right line, follow along with ease, and improve reading comprehension.",
    },
  ];

  const workplaceFeatures: Feature[] = [
    {
      icon: <Calendar size={28} />,
      imgSrc: '/images/Brainstorm.png',
      title: 'Meeting Survival Kit',
      description:
        'Prepare for meetings with an AI briefing in plain English. Capture live transcripts simplified in real time. Walk away with decisions, action items, and a draft follow-up email — automatically.',
      isNew: true,
    },
    {
      icon: <GraduationCap size={28} />,
      imgSrc: '/images/LessonCapture.png',
      title: 'Lesson Capture',
      description:
        'Students: prep before class with vocab previews, capture teacher speech in real time as simplified notes, then get instant revision notes — key facts, a visual memory prompt, and a quick quiz.',
      isNew: true,
    },
    {
      icon: <BookOpen size={28} />,
      imgSrc: '/images/Vocabulary.png',
      title: 'Vocabulary Builder',
      description:
        'Every word you look up is saved and scheduled for spaced-repetition review. Build a personal word bank from your reading and lessons, with pronunciation guides and examples.',
      isPro: true,
    },
    {
      icon: <Shield size={28} />,
      imgSrc: '/images/Privacy.png',
      title: 'Privacy-Focused',
      description:
        'Your writing stays private. We never train AI models on your content. Documents are stored locally in your browser — nothing leaves your device unless you choose.',
    },
  ];

  return (
    <div style={{ padding: '70px 20px', backgroundColor: landing.bg }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
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
              Every tool your <span style={{ background: `linear-gradient(120deg, ${landing.amber}52 0%, ${landing.amber}52 100%)`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 0.42em', backgroundPosition: '0 86%', padding: '0 2px' }}>brain</span> needs to write, read, and learn
            </h2>
            <p style={{ color: landing.inkMuted, fontSize: '15.5px', maxWidth: '520px', margin: '0 auto' }}>
              Built for dyslexic thinkers — from the first word to the final read-through, in the classroom and in the workplace.
            </p>
          </div>
        </Reveal>

        <CatDivider label="Writing" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
          {writingFeatures.map((f, i) => (
            <Reveal key={i}>
              <FeatureCard feature={f} />
            </Reveal>
          ))}
        </div>

        <CatDivider label="Reading" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
          {readingFeatures.map((f, i) => (
            <Reveal key={i}>
              <FeatureCard feature={f} />
            </Reveal>
          ))}
        </div>

        <CatDivider label="Workplace & Learning" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
          {workplaceFeatures.map((f, i) => (
            <Reveal key={i}>
              <FeatureCard feature={f} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
