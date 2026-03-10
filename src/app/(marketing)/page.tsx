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

const EXAMPLES = [
  {
    label: "Simplify",
    tag: "Simplify",
    tagColor: "#7c3aed",
    before: "I wanted too talk too my friend about are homework becuse i didnt understand it and it was really hard for me to no what to do.",
    after: "I wanted to talk to my friend about our homework because I didn't understand it and it was really hard for me to know what to do.",
    highlights: ["Correct words", "Fixed spelling", "Clearer flow"],
  },
  {
    label: "Rewrite sentence",
    tag: "Rewrite",
    tagColor: "#2563eb",
    before: "The thing what happened was me and him went to the shop and we buyed some stuff.",
    after: "He and I went to the shop and bought some things.",
    highlights: ["Shorter", "Grammatically correct", "Confident tone"],
  },
  {
    label: "Read aloud",
    tag: "Read Aloud",
    tagColor: "#059669",
    before: "Paste any text — an email, an essay, a letter — and hear it read back to you in a clear, natural voice. Great for checking your own writing or reading documents others have sent.",
    after: null,
    highlights: ["Hear your writing", "Catch mistakes by ear", "Natural AI voice"],
    isFeature: true,
  },
];

function TransformationSection({
  theme,
  darkMode,
  onGetStarted,
}: {
  theme: any;
  darkMode: boolean;
  onGetStarted: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const ex = EXAMPLES[activeIndex];

  return (
    <div style={{
      padding: '80px 24px',
      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '12px' }}>
            See it in action
          </p>
          <h2 style={{ fontSize: '34px', fontWeight: 800, color: theme.text, margin: 0, lineHeight: 1.2 }}>
            Watch your writing transform
          </h2>
          <p style={{ fontSize: '17px', color: theme.textSecondary, marginTop: '12px', marginBottom: 0 }}>
            Real examples of what Dyslexia Write does — in seconds.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              type="button"
              onClick={() => setActiveIndex(i)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: `2px solid ${activeIndex === i ? e.tagColor : (darkMode ? '#334155' : '#e2e8f0')}`,
                backgroundColor: activeIndex === i ? `${e.tagColor}14` : 'transparent',
                color: activeIndex === i ? e.tagColor : theme.textSecondary,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          borderRadius: '20px',
          border: `1px solid ${darkMode ? '#1e293b' : '#f1f5f9'}`,
          overflow: 'hidden',
          boxShadow: darkMode ? '0 8px 40px rgba(0,0,0,0.4)' : '0 8px 40px rgba(0,0,0,0.08)',
        }}>
          {ex.after !== null ? (
            /* Before / After layout */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {/* Before */}
              <div style={{
                padding: '32px 28px',
                backgroundColor: darkMode ? '#1e293b' : '#fafafa',
                borderRight: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}`,
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ef4444', marginBottom: '12px' }}>
                  Before
                </div>
                <p style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: darkMode ? '#94a3b8' : '#64748b',
                  margin: 0,
                  fontStyle: 'italic',
                }}>
                  &ldquo;{ex.before}&rdquo;
                </p>
              </div>
              {/* After */}
              <div style={{
                padding: '32px 28px',
                backgroundColor: darkMode ? '#0f1f0f' : '#f0fdf4',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#16a34a', marginBottom: '12px' }}>
                  After — with Dyslexia Write
                </div>
                <p style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: darkMode ? '#bbf7d0' : '#14532d',
                  margin: 0,
                  fontWeight: 500,
                }}>
                  &ldquo;{ex.after}&rdquo;
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '20px' }}>
                  {ex.highlights.map((h) => (
                    <span key={h} style={{
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: darkMode ? 'rgba(22,163,74,0.15)' : '#dcfce7',
                      color: '#16a34a',
                    }}>
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Feature description layout (Read Aloud) */
            <div style={{
              padding: '40px 36px',
              backgroundColor: darkMode ? '#1e293b' : '#f8faff',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#05966914',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '26px',
                }}>
                  🔊
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#059669', marginBottom: '8px' }}>
                    Read Aloud
                  </div>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: theme.text,
                    margin: 0,
                  }}>
                    {ex.before}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '20px' }}>
                    {ex.highlights.map((h) => (
                      <span key={h} style={{
                        padding: '3px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: darkMode ? 'rgba(5,150,105,0.15)' : '#d1fae5',
                        color: '#059669',
                      }}>
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            type="button"
            onClick={onGetStarted}
            style={{
              padding: '14px 36px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            }}
          >
            Start Writing Free
          </button>
          <p style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '10px' }}>
            No credit card needed
          </p>
        </div>
      </div>
    </div>
  );
}

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

      {/* Before → After Transformation Section */}
      <TransformationSection theme={theme} darkMode={darkMode} onGetStarted={() => router.push('/sign-up')} />

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
