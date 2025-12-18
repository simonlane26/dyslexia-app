'use client';

import React from 'react';
import {
  Sparkles,
  BookOpen,
  Mic,
  SpellCheck,
  Edit3,
  Highlighter,
  MessageSquare,
  Zap,
  Shield,
} from 'lucide-react';

interface FeaturesSectionProps {
  theme: any;
  darkMode: boolean;
}

export function FeaturesSection({ theme, darkMode }: FeaturesSectionProps) {
  const features = [
    {
      icon: <SpellCheck size={32} />,
      title: 'Real-Time Grammar Check',
      description:
        'Dyslexia-aware grammar checking that catches homophones, letter reversals, and common transpositions. Click underlined text for instant fixes.',
      color: '#ef4444',
    },
    {
      icon: <Edit3 size={32} />,
      title: 'AI Sentence Rewriting',
      description:
        'Select any sentence and get 3 alternatives: Simpler, More confident, or Clearer. One-click to apply. No grammar jargon, just plain language.',
      color: '#3b82f6',
    },
    {
      icon: <MessageSquare size={32} />,
      title: 'Writing Coach',
      description:
        'Intent-first coaching that asks who you\'re writing for and why. Get tips tailored to your audience, purpose, and tone—no technical terms.',
      color: '#8b5cf6',
    },
    {
      icon: <Sparkles size={32} />,
      title: 'Smart Text Simplification',
      description:
        'AI-powered simplification that makes complex text easier to read without losing meaning. Perfect for understanding difficult content.',
      color: '#f59e0b',
    },
    {
      icon: <Mic size={32} />,
      title: 'Voice Dictation',
      description:
        'Speak naturally and see your words appear in the editor. Great for when typing feels difficult or you want to capture ideas quickly.',
      color: '#10b981',
    },
    {
      icon: <BookOpen size={32} />,
      title: 'Read Aloud',
      description:
        'Listen to your text with high-quality AI voices. Hear how your writing sounds and catch mistakes you might miss while reading.',
      color: '#ec4899',
    },
    {
      icon: <Highlighter size={32} />,
      title: 'Sentence Highlighting',
      description:
        'Follow along as each sentence highlights while reading aloud. Helps you stay focused and improves reading comprehension.',
      color: '#06b6d4',
    },
    {
      icon: <Zap size={32} />,
      title: 'Progress Tracking',
      description:
        'See your writing improve over time with metrics like average sentence length and complex word usage. Encouraging, not overwhelming.',
      color: '#f97316',
    },
    {
      icon: <Shield size={32} />,
      title: 'Privacy-Focused',
      description:
        'Your writing stays private. We don\'t train AI models on your content. Documents are stored locally in your browser.',
      color: '#6366f1',
    },
  ];

  return (
    <div
      style={{
        padding: '80px 20px',
        backgroundColor: darkMode ? '#111827' : '#f9fafb',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: darkMode ? '#374151' : '#e0e7ff',
              color: darkMode ? '#a5b4fc' : '#6366f1',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '16px',
            }}
          >
            Features
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: '800',
              color: theme.text,
              marginBottom: '16px',
              lineHeight: '1.2',
            }}
          >
            Dyslexia-Friendly Writing Tools
            <br />
            You'll Actually Use
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: darkMode ? '#9ca3af' : '#6b7280',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            Every feature is designed with dyslexic writers in mind. No jargon, no complexity—just
            tools that help you write with confidence.
          </p>
        </div>

        {/* Features grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                padding: '32px',
                borderRadius: '16px',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = darkMode
                  ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                  : '0 10px 30px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = feature.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = darkMode ? '#374151' : '#e5e7eb';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: `${feature.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: theme.text,
                  marginBottom: '12px',
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: '15px',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  lineHeight: '1.6',
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            marginTop: '80px',
            textAlign: 'center',
            padding: '48px 32px',
            background: darkMode
              ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '24px',
            color: '#ffffff',
          }}
        >
          <h3
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '800',
              marginBottom: '16px',
            }}
          >
            Ready to Write with Confidence?
          </h3>
          <p
            style={{
              fontSize: '18px',
              marginBottom: '32px',
              opacity: 0.95,
            }}
          >
            Join dyslexic writers who are already using DyslexiaWrite to communicate better.
          </p>
          <button
            onClick={() => {
              const editor = document.getElementById('text');
              if (editor) {
                editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => editor.focus(), 500);
              }
            }}
            style={{
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: '700',
              backgroundColor: '#ffffff',
              color: darkMode ? '#1f2937' : '#667eea',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
            }}
          >
            Start Writing Now — It's Free
          </button>
        </div>
      </div>
    </div>
  );
}
