'use client';

import React from 'react';
import { Sparkles, BookOpen, Mic, ArrowDown } from 'lucide-react';
import { ModernButton } from './ModernButton';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSeeFeatures: () => void;
  isSignedIn: boolean;
  theme: any;
  darkMode: boolean;
}

export function HeroSection({
  onGetStarted,
  onSeeFeatures,
  isSignedIn,
  theme,
  darkMode,
}: HeroSectionProps) {
  return (
    <div
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
        {/* Eyebrow text */}
        <div
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)',
          }}
        >
          ✨ AI-Powered Writing Tools for Dyslexic Writers
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '24px',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          Write Better, Faster —
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dyslexia-Friendly
          </span>{' '}
          Tools
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            lineHeight: '1.6',
            marginBottom: '40px',
            maxWidth: '700px',
            margin: '0 auto 40px',
            opacity: 0.95,
          }}
        >
          Real-time grammar checking, AI writing coach, and smart rewriting tools designed
          specifically for dyslexic writers. Write with confidence.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '48px',
          }}
        >
          <button
            onClick={onGetStarted}
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
            <Sparkles size={20} />
            {isSignedIn ? 'Start Writing' : 'Start Writing Free'}
          </button>

          <button
            onClick={onSeeFeatures}
            style={{
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: '700',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
          >
            <BookOpen size={20} />
            See Features
          </button>
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            flexWrap: 'wrap',
            fontSize: '14px',
            opacity: 0.9,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>✓</span>
            <span>No credit card required</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>✓</span>
            <span>5 free uses per day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>✓</span>
            <span>Privacy-focused</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            marginTop: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            animation: 'bounce 2s infinite',
          }}
        >
          <span style={{ fontSize: '14px', opacity: 0.8 }}>Scroll to explore</span>
          <ArrowDown size={24} style={{ opacity: 0.8 }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
      `}</style>
    </div>
  );
}
