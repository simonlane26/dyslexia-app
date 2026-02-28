'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import {
  websiteSchema,
  organizationSchema,
  softwareApplicationSchema,
  faqSchema,
} from '@/app/schema';

// Prevent static generation - requires runtime environment
export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Theme management
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState({
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  });

  useEffect(() => {
    setMounted(true);
    // Load theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Update theme colors based on dark mode
    if (darkMode) {
      setTheme({
        background: '#1f2937',
        surface: '#374151',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        border: '#4b5563',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      });
    } else {
      setTheme({
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      });
    }
  }, [darkMode]);

  // Redirect authenticated users to the app
  useEffect(() => {
    if (mounted && isLoaded && isSignedIn) {
      router.push('/app');
    }
  }, [mounted, isLoaded, isSignedIn, router]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
      }}>
        <div style={{ color: theme.text }}>Loading...</div>
      </div>
    );
  }

  // If user is signed in, they'll be redirected (show nothing)
  if (isSignedIn) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            websiteSchema,
            organizationSchema,
            softwareApplicationSchema,
            faqSchema,
          ]),
        }}
      />

      {/* Hero Section */}
      <HeroSection
        onGetStarted={() => {
          router.push('/sign-up');
        }}
        onSeeFeatures={() => {
          const features = document.getElementById('features-section');
          if (features) {
            features.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        isSignedIn={false}
        theme={theme}
        darkMode={darkMode}
      />

      {/* Trust Signals Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '48px',
          padding: '48px 32px',
          backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        {/* Education Supplier Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <img
            src="/Incensu.jpg"
            alt="Approved Education Supplier"
            style={{ height: '110px', width: 'auto' }}
          />
          <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0, textAlign: 'center' }}>
            Trusted by schools across the UK
          </p>
        </div>

        {/* Divider */}
        <div style={{
          width: '1px',
          height: '80px',
          backgroundColor: theme.border,
          display: 'block',
        }} />

        {/* Disability Confident Employer Signal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', maxWidth: '260px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: darkMode ? '#1d4ed8' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: 700,
            color: theme.text,
            margin: 0,
            textAlign: 'center',
            lineHeight: '1.4',
          }}>
            Used by Disability Confident employers
          </p>
          <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0, textAlign: 'center' }}>
            Supporting neurodiverse staff in the workplace
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section">
        <FeaturesSection theme={theme} darkMode={darkMode} />
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection theme={theme} darkMode={darkMode} />

      {/* Final CTA Section */}
      <div
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          background: darkMode
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '16px',
            color: theme.text,
          }}
        >
          Ready to Write with Confidence?
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: theme.textSecondary,
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px',
          }}
        >
          Join thousands of dyslexic writers who are writing better, faster, and with more confidence.
        </p>
        <button
          onClick={() => router.push('/sign-up')}
          style={{
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
          }}
        >
          Get Started Free
        </button>
        <p
          style={{
            marginTop: '16px',
            fontSize: '14px',
            color: theme.textSecondary,
          }}
        >
          No credit card required • 5 free uses per day
        </p>
      </div>
    </div>
  );
}
