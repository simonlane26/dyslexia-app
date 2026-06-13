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

interface FeaturesSectionProps {
  theme: any;
  darkMode: boolean;
}

interface Feature {
  icon: React.ReactNode;
  imgSrc?: string;
  title: string;
  description: string;
  color: string;
  isPro?: boolean;
  isNew?: boolean;
}

function FeatureCard({ feature, theme, darkMode }: { feature: Feature; theme: any; darkMode: boolean }) {
  return (
    <div
      style={{
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        padding: '28px',
        borderRadius: '16px',
        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        transition: 'all 0.25s ease',
        cursor: 'default',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = darkMode
          ? '0 10px 30px rgba(0,0,0,0.5)'
          : '0 10px 30px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = feature.color;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = darkMode ? '#374151' : '#e5e7eb';
      }}
    >
      {feature.imgSrc ? (
        <div style={{
          width: '72px', height: '72px', marginBottom: '18px',
          borderRadius: '12px', border: '1px solid #f0f0f0',
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fff',
        }}>
          <img
            src={feature.imgSrc}
            alt={feature.title}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: `${feature.color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            color: feature.color,
          }}
        >
          {feature.icon}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.text, margin: 0 }}>
          {feature.title}
        </h3>
        {feature.isPro && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            padding: '3px 8px', backgroundColor: '#fbbf24', color: '#000',
            borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            <Crown size={11} /> Pro
          </span>
        )}
        {feature.isNew && (
          <span style={{
            padding: '3px 8px', backgroundColor: '#10b981', color: '#fff',
            borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            New
          </span>
        )}
      </div>

      <p style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', lineHeight: 1.65, margin: 0 }}>
        {feature.description}
      </p>
    </div>
  );
}

function GroupHeader({ label, color, darkMode }: { label: string; color: string; darkMode: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
      <span style={{
        padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        backgroundColor: `${color}18`, color,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: darkMode ? '#374151' : '#e5e7eb' }} />
    </div>
  );
}

export function FeaturesSection({ theme, darkMode }: FeaturesSectionProps) {

  const writingFeatures: Feature[] = [
    {
      icon: <Brain size={28} />,
      imgSrc: '/images/Notebookpencil.png',
      title: 'Writing Mentor',
      description: 'Intent-first AI mentor that asks who you\'re writing for and why, then gives plain-English suggestions tailored to your audience, purpose, and tone. No jargon — just clear guidance.',
      color: '#8b5cf6',
      isPro: true,
      isNew: true,
    },
    {
      icon: <SpellCheck size={28} />,
      imgSrc: '/images/Grammarcheck.png',
      title: 'Real-Time Grammar Check',
      description: 'Dyslexia-aware grammar checking that catches homophones, letter reversals, and common transpositions. Click any underlined word for instant fixes.',
      color: '#ef4444',
    },
    {
      icon: <Edit3 size={28} />,
      imgSrc: '/images/Rewrite.png',
      title: 'AI Sentence Rewriting',
      description: 'Select any sentence and get 3 alternatives: Simpler, More confident, or Clearer. One click to apply — no grammar jargon, just plain language.',
      color: '#3b82f6',
      isPro: true,
    },
    {
      icon: <Sparkles size={28} />,
      imgSrc: '/images/Simplification.png',
      title: 'Smart Simplification',
      description: 'AI-powered simplification that makes complex text easier to understand without losing meaning. Paste anything — an email, a letter, a form — and get a plain-English version.',
      color: '#f59e0b',
    },
    {
      icon: <Mic size={28} />,
      imgSrc: '/images/Dictation.png',
      title: 'Voice Dictation',
      description: 'Speak naturally and see your words appear in the editor. Great for when typing feels difficult or you want to capture ideas quickly.',
      color: '#10b981',
    },
    {
      icon: <Zap size={28} />,
      imgSrc: '/images/Progresstrack.png',
      title: 'Progress Tracking',
      description: 'See your writing improve over time with metrics like average sentence length and complex word usage. Encouraging, not overwhelming.',
      color: '#f97316',
    },
  ];

  const readingFeatures: Feature[] = [
    {
      icon: <Eye size={28} />,
      imgSrc: '/images/Readingmodes.png',
      title: 'Three Reading Modes',
      description: 'Clean mode removes all distractions. Guided mode focuses line-by-line with a spotlight. Supported mode adds a reading ruler and colour tint. Choose the mode that works for your brain.',
      color: '#10b981',
      isNew: true,
    },
    {
      icon: <ScanText size={28} />,
      imgSrc: '/images/Brainbook.png',
      title: 'Memory Reading',
      description: 'Any document broken into manageable chunks. Tap any word for its definition, pronunciation, and an example sentence. A running summary builds as you read — so nothing slips away.',
      color: '#7c3aed',
      isPro: true,
      isNew: true,
    },
    {
      icon: <Volume2 size={28} />,
      imgSrc: '/images/Readaloud.png',
      title: 'Read Aloud',
      description: 'Listen to your text with high-quality AI voices. Hear how your writing sounds and catch mistakes you might miss while reading silently.',
      color: '#ec4899',
    },
    {
      icon: <Highlighter size={28} />,
      imgSrc: '/images/Sentencehighlight.png',
      title: 'Sentence Highlighting',
      description: 'Each sentence highlights as it\'s read aloud. Helps you stay on the right line, follow along with ease, and improve reading comprehension.',
      color: '#06b6d4',
    },
  ];

  const workplaceFeatures: Feature[] = [
    {
      icon: <Calendar size={28} />,
      imgSrc: '/images/Brainstorm.png',
      title: 'Meeting Survival Kit',
      description: 'Prepare for meetings with an AI briefing in plain English. Capture live transcripts simplified in real time. Walk away with decisions, action items, and a draft follow-up email — automatically.',
      color: '#1D9E75',
      isNew: true,
    },
    {
      icon: <GraduationCap size={28} />,
      imgSrc: '/images/LessonCapture.png',
      title: 'Lesson Capture',
      description: 'Students: prep before class with vocab previews, capture teacher speech in real time as simplified notes, then get instant revision notes — key facts, a visual memory prompt, and a quick quiz.',
      color: '#534AB7',
      isNew: true,
    },
    {
      icon: <BookOpen size={28} />,
      imgSrc: '/images/Vocabulary.png',
      title: 'Vocabulary Builder',
      description: 'Every word you look up is saved and scheduled for spaced-repetition review. Build a personal word bank from your reading and lessons, with pronunciation guides and examples.',
      color: '#0ea5e9',
      isPro: true,
    },
    {
      icon: <Shield size={28} />,
      imgSrc: '/images/Privacy.png',
      title: 'Privacy-Focused',
      description: 'Your writing stays private. We never train AI models on your content. Documents are stored locally in your browser — nothing leaves your device unless you choose.',
      color: '#6366f1',
    },
  ];

  return (
    <div style={{ padding: '80px 20px', backgroundColor: darkMode ? '#111827' : '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block', padding: '8px 20px',
            backgroundColor: darkMode ? '#374151' : '#e0e7ff',
            color: darkMode ? '#a5b4fc' : '#6366f1',
            borderRadius: '50px', fontSize: '14px', fontWeight: 600, marginBottom: '16px',
          }}>
            Features
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800,
            color: theme.text, marginBottom: '16px', lineHeight: 1.2,
          }}>
            Every tool your brain needs
            <br />to write, read, and learn
          </h2>
          <p style={{
            fontSize: '18px', color: darkMode ? '#9ca3af' : '#6b7280',
            maxWidth: '700px', margin: '0 auto', lineHeight: 1.6,
          }}>
            Built for dyslexic thinkers — from the first word to the final read-through, in the classroom and in the workplace.
          </p>
        </div>

        {/* ── Writing Support ── */}
        <GroupHeader label="Writing" color="#8b5cf6" darkMode={darkMode} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '56px',
        }}>
          {writingFeatures.map((f, i) => (
            <FeatureCard key={i} feature={f} theme={theme} darkMode={darkMode} />
          ))}
        </div>

        {/* ── Reading Support ── */}
        <GroupHeader label="Reading" color="#10b981" darkMode={darkMode} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '56px',
        }}>
          {readingFeatures.map((f, i) => (
            <FeatureCard key={i} feature={f} theme={theme} darkMode={darkMode} />
          ))}
        </div>

        {/* ── Workplace & Learning ── */}
        <GroupHeader label="Workplace &amp; Learning" color="#1D9E75" darkMode={darkMode} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '64px',
        }}>
          {workplaceFeatures.map((f, i) => (
            <FeatureCard key={i} feature={f} theme={theme} darkMode={darkMode} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign: 'center', padding: '48px 32px',
          background: darkMode
            ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px', color: '#ffffff',
        }}>
          <h3 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: '16px' }}>
            Ready to Write with Confidence?
          </h3>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.95 }}>
            Join dyslexic writers who are already using DyslexiaWrite to communicate better.
          </p>
          <a
            href="/sign-up"
            style={{
              display: 'inline-block', padding: '16px 40px', fontSize: '18px', fontWeight: 700,
              backgroundColor: '#ffffff', color: '#667eea',
              borderRadius: '12px', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.2s',
            }}
          >
            Start Writing Free — No card needed
          </a>
        </div>
      </div>
    </div>
  );
}
