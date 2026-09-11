'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
} from '@clerk/nextjs';

import Link from 'next/link';
import React, { type CSSProperties } from 'react';
import { Check, Star, Users, School, Sparkles, Volume2, Download, Palette, Briefcase } from 'lucide-react';
import { AccessToWorkGuideOptIn } from '@/components/AccessToWorkGuideOptIn';

/* ---------- Modern Button ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const ModernButton = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  size = 'md',
  className = '',
  style: styleProp,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  size?: ButtonSize;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  const sizeStyles: Record<ButtonSize, CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 24px', fontSize: '16px' },
    lg: { padding: '16px 32px', fontSize: '18px' },
  };

  const variantStyles: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #D98C2B 0%, #B06F1D 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 15px rgba(217, 140, 43, 0.4)',
    },
    secondary: {
      background: '#F4EEDE',
      color: '#2B2A28',
      border: '1px solid #E6DECB',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    success: {
      background: 'linear-gradient(135deg, #2F7A6B 0%, #22594F 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 15px rgba(47, 122, 107, 0.4)',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
    },
    ghost: {
      background: 'transparent',
      color: '#6B6558',
      border: '1px solid #F4EEDE',
      boxShadow: 'none',
    },
  };

  const baseStyle: CSSProperties = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    borderRadius: '12px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    outline: 'none',
    transform: disabled ? 'none' : 'scale(1)',
    ...(styleProp || {}),
  };

  // keep the original shadow to restore on mouse leave
  const originalShadow = (baseStyle.boxShadow as string) || '';

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(217, 140, 43, 0.6)';
      } else if (variant === 'success') {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(47, 122, 107, 0.6)';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1) translateY(0px)';
      e.currentTarget.style.boxShadow = originalShadow;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

/* ---------- Pricing Card ---------- */

// Modern Card Component (fixed typing)
const PricingCard = ({
  children,
  featured = false,
  style = {},
  ...props
}: {
  children: React.ReactNode;
  featured?: boolean;
  style?: Partial<React.CSSProperties>;
  [key: string]: any;
}) => {
  const defaultShadow = featured
    ? '0 20px 60px rgba(217, 140, 43, 0.15)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)';

  const base: React.CSSProperties = {
    background: featured
      ? 'linear-gradient(135deg, rgba(217, 140, 43, 0.05) 0%, rgba(176, 111, 29, 0.05) 100%)'
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: 24,
    boxShadow: defaultShadow,
    border: featured
      ? '2px solid rgba(217, 140, 43, 0.2)'
      : '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative' as React.CSSProperties['position'], // <- narrowed
    overflow: 'hidden',
  };

  // Merge while keeping the React CSS type, so keys like `position` don't widen to `string`
  const cardStyle: React.CSSProperties = {
    ...base,
    ...(style as React.CSSProperties),
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.boxShadow = featured
      ? '0 25px 80px rgba(217, 140, 43, 0.25)'
      : '0 20px 60px rgba(0, 0, 0, 0.15)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0px)';
    e.currentTarget.style.boxShadow = defaultShadow;
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {featured && (
        <div
          style={{
            position: 'absolute' as React.CSSProperties['position'],
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #D98C2B 0%, #B06F1D 100%)',
          }}
        />
      )}
      {children}
    </div>
  );
};


/* ---------- Feature Item ---------- */

const FeatureItem = ({
  icon,
  children,
  highlighted = false,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  highlighted?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      fontWeight: highlighted ? 600 : 400,
    }}
  >
    {icon ? (
      icon
    ) : (
      <Check size={18} style={{ color: highlighted ? '#2F7A6B' : '#6B6558' }} />
    )}
    <span>{children}</span>
  </div>
);

/* ---------- Page ---------- */

export default function PricingClient() {
  const handleGetPro = async (planType: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).error || response.statusText);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      alert('Checkout failed: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #FBF7EF 0%, #F4EEDE 50%, #F4EEDE 100%)',
        fontFamily: "var(--font-body), 'Atkinson Hyperlegible', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, #D98C2B 0%, #B06F1D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '20px' }}>✍️</span>
            </div>
            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 700,
                fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
                color: '#2B2A28',
                margin: 0,
              }}
            >
              Dyslexia Write
            </h1>
          </div>
          <p
            style={{
              fontSize: '1.25rem',
              color: '#6B6558',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Choose the perfect plan for your writing journey. From individual
            learners to entire schools.
          </p>
        </div>

        {/* Individual Plans */}
        <div style={{ marginBottom: '80px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
              justifyContent: 'center',
            }}
          >
            <Users size={24} style={{ color: '#D98C2B' }} />
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
                color: '#2B2A28',
                margin: 0,
              }}
            >
              For Individuals
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px',
              maxWidth: '1000px',
              margin: '0 auto',
            }}
          >
            {/* Free Plan */}
            <PricingCard>
              <div style={{ padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
                      color: '#2B2A28',
                      marginBottom: '8px',
                    }}
                  >
                    Free
                  </h3>
                  <div
                    style={{
                      fontSize: '3rem',
                      fontWeight: 800,
                      color: '#D98C2B',
                      marginBottom: '4px',
                    }}
                  >
                    £0
                  </div>
                  <div style={{ color: '#6B6558', fontSize: '14px' }}>
                    per month
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <FeatureItem>5 simplifications per day</FeatureItem>
                  <FeatureItem>3 inline rewrites per day (Simpler only)</FeatureItem>
                  <FeatureItem>3 saved documents</FeatureItem>
                  <FeatureItem
                    icon={
                      <Volume2 size={18} style={{ color: '#6B6558' }} />
                    }
                  >
                    Read Aloud — Rachelle voice
                  </FeatureItem>
                  <FeatureItem>Clean reading mode</FeatureItem>
                  <FeatureItem>Tap-to-decode vocabulary</FeatureItem>
                  <FeatureItem>Dyslexia-friendly fonts &amp; colours</FeatureItem>
                  <FeatureItem>Keyboard shortcuts</FeatureItem>
                </div>

                <ModernButton
                  variant="ghost"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={() => (window.location.href = '/sign-up')}
                >
                  Start Free
                </ModernButton>
              </div>
            </PricingCard>

            {/* Pro Monthly */}
            <PricingCard featured>
              <div style={{ padding: '32px' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background:
                      'linear-gradient(135deg, #2F7A6B 0%, #22594F 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Star size={12} />
                  Most Popular
                </div>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
                      color: '#2B2A28',
                      marginBottom: '8px',
                    }}
                  >
                    Pro Monthly
                  </h3>
                  <div
                    style={{
                      fontSize: '3rem',
                      fontWeight: 800,
                      background:
                        'linear-gradient(135deg, #D98C2B 0%, #B06F1D 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: '4px',
                    }}
                  >
                    £6.99
                  </div>
                  <div style={{ color: '#6B6558', fontSize: '14px' }}>
                    per month
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <FeatureItem
                    highlighted
                    icon={<Sparkles size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    Unlimited simplifications &amp; rewrites
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Sparkles size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    All rewrite modes (Simpler, Clearer, More confident)
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Sparkles size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    AI Writing Coach &amp; Mentor
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Volume2 size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    All voices (Molly, Liam, Elli &amp; more)
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Palette size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    Guided &amp; Supported reading modes
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Download size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    Export as MP3, PDF, DOC
                  </FeatureItem>
                  <FeatureItem highlighted>Unlimited saved documents</FeatureItem>
                  <FeatureItem highlighted>Chrome extension</FeatureItem>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 180,
                    left: 20,
                  }}
                  className="px-3 py-1 text-xs font-semibold text-white rounded-full bg-emerald-600"
                >
                  1st Month 75% Off! - Use Code Trial25
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Then £6.99 / month. Cancel anytime.
                </div>

                <ModernButton
                  variant="primary"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={() => handleGetPro('pro_monthly')}
                >
                  Get Pro Monthly
                </ModernButton>
              </div>
            </PricingCard>

            {/* Pro Annual */}
            <PricingCard>
              <div style={{ padding: '32px' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background:
                      'linear-gradient(135deg, #D98C2B 0%, #B06F1D 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Save 30%
                </div>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
                      color: '#2B2A28',
                      marginBottom: '8px',
                    }}
                  >
                    Pro Annual
                  </h3>
                  <div
                    style={{
                      fontSize: '3rem',
                      fontWeight: 800,
                      color: '#D98C2B',
                      marginBottom: '4px',
                    }}
                  >
                    £50
                  </div>
                  <div style={{ color: '#6B6558', fontSize: '14px' }}>
                    per year
                  </div>
                  <div
                    style={{
                      color: '#2F7A6B',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginTop: '4px',
                    }}
                  >
                    (£4.17/month)
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <FeatureItem
                    highlighted
                    icon={<Sparkles size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    Unlimited simplifications &amp; rewrites
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Sparkles size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    All rewrite modes (Simpler, Clearer, More confident)
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Sparkles size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    AI Writing Coach &amp; Mentor
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Volume2 size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    All voices (Molly, Liam, Elli &amp; more)
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Palette size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    Guided &amp; Supported reading modes
                  </FeatureItem>
                  <FeatureItem
                    highlighted
                    icon={<Download size={18} style={{ color: '#2F7A6B' }} />}
                  >
                    Export as MP3, PDF, DOC
                  </FeatureItem>
                  <FeatureItem highlighted>Unlimited saved documents</FeatureItem>
                  <FeatureItem highlighted>Chrome extension</FeatureItem>
                </div>

                <SignedIn>
                  <ModernButton
                    variant="success"
                    size="lg"
                    style={{ width: '100%' }}
                    onClick={() => handleGetPro('pro_annual')}
                  >
                    Get Pro Annual
                  </ModernButton>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <ModernButton variant="primary" size="lg" style={{ width: '100%' }}>
                      Sign in to upgrade
                    </ModernButton>
                  </SignInButton>
                </SignedOut>
              </div>
            </PricingCard>
          </div>
        </div>

        {/* Workplace Plans */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', justifyContent: 'center' }}>
            <Briefcase size={24} style={{ color: '#B06F1D' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: "var(--font-display), 'Fraunces', Georgia, serif", color: '#2B2A28', margin: 0 }}>
              For Workplaces
            </h2>
          </div>
          <p style={{ textAlign: 'center', color: '#6B6558', fontSize: '14px', marginBottom: '40px' }}>
            Access to Work eligible — employees can claim the full cost through DWP
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Starter */}
            <PricingCard>
              <div style={{ padding: '32px', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "var(--font-display), 'Fraunces', Georgia, serif", color: '#2B2A28', marginBottom: '4px' }}>Starter</h3>
                  <div style={{ color: '#6B6558', fontSize: '13px', marginBottom: '12px' }}>Individual employees</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2F7A6B', marginBottom: '2px' }}>£120</div>
                  <div style={{ color: '#6B6558', fontSize: '13px' }}>per user / year</div>
                  <div style={{ color: '#9C9686', fontSize: '11px', fontStyle: 'italic', marginTop: '2px' }}>£10/month per user · 1–5 users</div>
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <FeatureItem highlighted>Full Pro features per user</FeatureItem>
                  <FeatureItem>Chrome extension included</FeatureItem>
                  <FeatureItem>All ElevenLabs voices</FeatureItem>
                  <FeatureItem>Usage reports per employee</FeatureItem>
                  <FeatureItem>Email &amp; chat support</FeatureItem>
                  <FeatureItem highlighted>Access to Work eligible</FeatureItem>
                </div>
                <ModernButton
                  variant="secondary"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={() => (window.location.href = '/enterprise#inquiry')}
                >
                  Get a quote
                </ModernButton>
              </div>
            </PricingCard>

            {/* Business */}
            <PricingCard featured>
              <div style={{ padding: '32px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'linear-gradient(135deg, #B65C4A 0%, #94493A 100%)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                  Most Popular
                </div>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "var(--font-display), 'Fraunces', Georgia, serif", color: '#2B2A28', marginBottom: '4px' }}>Business</h3>
                  <div style={{ color: '#6B6558', fontSize: '13px', marginBottom: '12px' }}>Teams and departments</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#B65C4A', marginBottom: '2px' }}>£95</div>
                  <div style={{ color: '#6B6558', fontSize: '13px' }}>per user / year</div>
                  <div style={{ color: '#9C9686', fontSize: '11px', fontStyle: 'italic', marginTop: '2px' }}>£7.92/month per user · 6–50 users</div>
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <FeatureItem highlighted>Everything in Starter</FeatureItem>
                  <FeatureItem highlighted>Admin dashboard</FeatureItem>
                  <FeatureItem>Bulk user management</FeatureItem>
                  <FeatureItem>Usage analytics for HR</FeatureItem>
                  <FeatureItem>SSO integration</FeatureItem>
                  <FeatureItem>Onboarding session included</FeatureItem>
                  <FeatureItem>Priority support</FeatureItem>
                </div>
                <ModernButton
                  variant="primary"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={() => (window.location.href = '/enterprise#inquiry')}
                >
                  Talk to sales
                </ModernButton>
              </div>
            </PricingCard>

            {/* Enterprise */}
            <PricingCard>
              <div style={{ padding: '32px', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "var(--font-display), 'Fraunces', Georgia, serif", color: '#2B2A28', marginBottom: '4px' }}>Enterprise</h3>
                  <div style={{ color: '#6B6558', fontSize: '13px', marginBottom: '12px' }}>Organisation-wide</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#B06F1D', marginBottom: '2px' }}>Custom</div>
                  <div style={{ color: '#6B6558', fontSize: '13px' }}>volume pricing</div>
                  <div style={{ color: '#9C9686', fontSize: '11px', fontStyle: 'italic', marginTop: '2px' }}>From £60/user/year at scale · 50+ users</div>
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <FeatureItem highlighted>Everything in Business</FeatureItem>
                  <FeatureItem highlighted>Unlimited users</FeatureItem>
                  <FeatureItem>Accessibility passport reports</FeatureItem>
                  <FeatureItem>Custom branding</FeatureItem>
                  <FeatureItem>API access</FeatureItem>
                  <FeatureItem>Dedicated account manager</FeatureItem>
                  <FeatureItem>Equality Act compliance pack</FeatureItem>
                  <FeatureItem>Quarterly impact reports</FeatureItem>
                </div>
                <ModernButton
                  variant="secondary"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={() => (window.location.href = '/enterprise#inquiry')}
                >
                  Contact us
                </ModernButton>
              </div>
            </PricingCard>
          </div>

          {/* Comparison + Access to Work note */}
          <div style={{ maxWidth: '1000px', margin: '32px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#F4EEDE', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#2B2A28', marginBottom: '12px' }}>How we compare to TextHelp Read&amp;Write</div>
              {[
                { label: 'TextHelp single licence (3yr)', value: '£378–500/user/year', highlight: false },
                { label: 'DyslexiaWrite Starter', value: '£120/user/year', highlight: false },
                { label: 'DyslexiaWrite Business', value: '£95/user/year', highlight: false },
                { label: 'Your saving vs TextHelp', value: '68–81% cheaper', highlight: true },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #E6DECB' }}>
                  <span style={{ color: '#6B6558' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.highlight ? '#2F7A6B' : '#2B2A28' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#E4F0EC', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#22594F', marginBottom: '8px' }}>Access to Work funding</div>
              <div style={{ fontSize: '12px', color: '#2F7A6B', lineHeight: 1.6 }}>
                DyslexiaWrite is eligible for Access to Work funding. Employees can claim the full licence cost through the DWP scheme — meaning the employer pays nothing. We provide all documentation needed for the application.
              </div>
            </div>
          </div>
        </div>

        {/* School Plans */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
              justifyContent: 'center',
            }}
          >
            <School size={24} style={{ color: '#2F7A6B' }} />
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
                color: '#2B2A28',
                margin: 0,
              }}
            >
              For Schools
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
              maxWidth: '1000px',
              margin: '0 auto',
            }}
          >
            {[
              {
                name: 'Starter',
                range: '1–30 students',
                price: '£300',
                id: 'school_starter',
                description: 'Perfect for small classrooms',
              },
              {
                name: 'Mid',
                range: '31–150 students',
                price: '£2,000',
                id: 'school_mid',
                description: 'Great for medium schools',
              },
              {
                name: 'Full',
                range: '151–500 students',
                price: '£5,000',
                id: 'school_full',
                description: 'Complete school solution',
              },
            ].map((plan) => (
              <PricingCard key={plan.id}>
                <div style={{ padding: '32px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h3
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
                        color: '#2B2A28',
                        marginBottom: '4px',
                      }}
                    >
                      {plan.name}
                    </h3>
                    <div
                      style={{
                        color: '#6B6558',
                        fontSize: '14px',
                        marginBottom: '12px',
                      }}
                    >
                      {plan.description}
                    </div>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        color: '#2F7A6B',
                        marginBottom: '4px',
                      }}
                    >
                      {plan.price}
                    </div>
                    <div style={{ color: '#6B6558', fontSize: '14px' }}>
                      per year
                    </div>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <FeatureItem highlighted>Up to {plan.range}</FeatureItem>
                    <FeatureItem>Teacher Dashboard</FeatureItem>
                    <FeatureItem>School Mode — child-safe copy</FeatureItem>
                    <FeatureItem>No grades, no red marks</FeatureItem>
                    <FeatureItem>EU data hosting (GDPR)</FeatureItem>
                    <FeatureItem>No student writing stored</FeatureItem>
                    <FeatureItem>Priority Support</FeatureItem>
                  </div>

                  <SignedIn>
                    <ModernButton
                      variant="success"
                      size="lg"
                      style={{ width: '100%' }}
                      onClick={() => handleGetPro(plan.id)}
                    >
                      Get {plan.name} Plan
                    </ModernButton>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <ModernButton variant="primary" size="lg" style={{ width: '100%' }}>
                        Sign in to get started
                      </ModernButton>
                    </SignInButton>
                  </SignedOut>

                  <p style={{ textAlign: 'center', fontSize: '12px', color: '#9C9686', marginTop: '12px' }}>
                    <Link href="/schools-privacy" style={{ color: '#2F7A6B', textDecoration: 'underline' }}>
                      Schools privacy policy
                    </Link>
                    {' · '}GDPR compliant
                  </p>
                </div>
              </PricingCard>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '80px',
            padding: '40px',
            background:
              'linear-gradient(135deg, rgba(217, 140, 43, 0.05) 0%, rgba(176, 111, 29, 0.05) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(217, 140, 43, 0.1)',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
              color: '#2B2A28',
              marginBottom: '12px',
            }}
          >
            Questions about our plans?
          </h3>
          <p
            style={{
              color: '#6B6558',
              marginBottom: '24px',
            }}
          >
            We're here to help you find the perfect solution for your needs.
          </p>
          <ModernButton
            variant="ghost"
            onClick={() =>
              (window.location.href = 'mailto:support@dyslexiawriter.com')
            }
          >
            Contact Support
          </ModernButton>
        </div>

        {/* VAT notice */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '16px',
            color: '#6B6558',
            fontSize: '12px',
          }}
        >
          All prices are subject to VAT.
        </p>
      </div>

      {/* Second door: not ready to buy today, mid Access to Work funding */}
      <AccessToWorkGuideOptIn source="pricing" />
    </div>
  );
}
