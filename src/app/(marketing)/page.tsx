'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/HeroSection';
import { DualPathSection } from '@/components/DualPathSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { FundingCompatibilityFAQ } from '@/components/FundingCompatibilityFAQ';
import { HomeInfoSections } from '@/components/HomeInfoSections';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { StatsStrip } from '@/components/StatsStrip';
import { Reveal } from '@/components/Reveal';
import { landing } from '@/lib/landingTheme';
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

  // Redirect authenticated users to the app. This never hides the marketing
  // content below — search engines and AI crawlers that don't execute
  // client JS still need to see the full page in the initial HTML.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/app');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div style={{ minHeight: '100vh' }}>
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
        onGetStarted={() => router.push('/sign-up')}
        onSeeFunding={() => {
          const target = document.getElementById('path-funders');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      />

      {/* Dual-path: individuals vs. employers/schools */}
      <DualPathSection />

      {/* Trust Signals Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '60px',
          padding: '34px 32px',
          backgroundColor: landing.bgAlt,
          borderTop: `1px solid ${landing.line}`,
          borderBottom: `1px solid ${landing.line}`,
        }}
      >
        {/* Education Supplier Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <img src="/Incensu.jpg" alt="Approved Education Supplier" style={{ height: '90px', width: 'auto', borderRadius: '8px' }} />
          <p style={{ fontSize: '13px', color: landing.inkMuted, margin: 0, textAlign: 'center' }}>
            Trusted by schools across the UK
          </p>
        </div>

        {/* Disability Confident Employer Signal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', maxWidth: '260px' }}>
          <div
            style={{
              fontFamily: landing.fontDisplay,
              fontWeight: 700,
              fontSize: '14px',
              color: landing.ink,
              border: `1.5px solid ${landing.line}`,
              backgroundColor: landing.panel,
              padding: '8px 14px',
              borderRadius: '8px',
            }}
          >
            Disability Confident
          </div>
          <p style={{ fontSize: '13px', color: landing.inkMuted, margin: 0, textAlign: 'center' }}>
            Supporting neurodiverse staff in the workplace
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section">
        <FeaturesSection />
      </div>

      {/* Funding and compatibility FAQ */}
      <FundingCompatibilityFAQ />

      {/* Who it's for / Access to Work / Schools */}
      <HomeInfoSections />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Stats Strip */}
      <StatsStrip />

      {/* Final CTA Section */}
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 20px' }}>
        <Reveal>
          <div style={{ backgroundColor: landing.amberTint, borderRadius: '18px', padding: '56px 40px', textAlign: 'center', margin: '70px 0' }}>
            <h2 style={{ fontFamily: landing.fontDisplay, fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 600, marginBottom: '12px', color: landing.ink }}>
              Ready to write with{' '}
              <span
                style={{
                  background: `linear-gradient(120deg, ${landing.amber}66 0%, ${landing.amber}66 100%)`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 0.42em',
                  backgroundPosition: '0 86%',
                  padding: '0 2px',
                }}
              >
                confidence
              </span>
              ?
            </h2>
            <p style={{ color: landing.inkMuted, fontSize: '15.5px', marginBottom: '26px', maxWidth: '480px', margin: '0 auto 26px' }}>
              Join thousands of dyslexic writers who are writing better, faster, and with more confidence.
            </p>
            <button
              type="button"
              onClick={() => router.push('/sign-up')}
              style={{
                background: landing.amber,
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                padding: '14px 32px',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = landing.amberDark)}
              onMouseOut={(e) => (e.currentTarget.style.background = landing.amber)}
            >
              Get Started Free
            </button>
            <div style={{ fontSize: '13px', color: landing.inkMuted, marginTop: '16px' }}>
              No credit card required · 5 free uses per day
            </div>
          </div>
        </Reveal>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${landing.line}`, padding: '40px 20px 30px' }}>
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M6 20 L17 9 L21 13 L10 24 L5 25 Z" stroke={landing.amber} strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M15 11 L19 15" stroke={landing.amber} strokeWidth="1.6" />
            </svg>
            <span style={{ fontFamily: landing.fontDisplay, fontWeight: 700, fontSize: '19px', color: landing.ink }}>DyslexiaWrite</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              ['Pricing', '/pricing'],
              ['Access to Work', '/access-to-work'],
              ['For Schools', '/schools'],
              ['vs TextHelp', '/compare'],
              ['vs Grammarly', '/vs/grammarly'],
              ['vs ClaroRead', '/vs/claroread'],
              ['vs Immersive Reader', '/vs/immersive-reader'],
              ['Privacy', '/privacy'],
            ].map(([label, href]) => (
              <a key={href} href={href} style={{ fontSize: '13px', color: landing.inkFaint, textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
          <span style={{ fontSize: '13px', color: landing.inkFaint }}>© 2026 DyslexiaWrite. Write, simplify, and listen.</span>
        </div>
      </footer>
    </div>
  );
}
