'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';

import Link from 'next/link';
import React from 'react';
import { Check, Star, Users, School, Sparkles, Volume2, Download, Palette } from 'lucide-react';

// Modern Button Component
const ModernButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  size = 'md',
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}) => {
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 24px', fontSize: '16px' },
    lg: { padding: '16px 32px', fontSize: '18px' }
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
    },
    secondary: {
      background: '#f1f5f9',
      color: '#334155',
      border: '1px solid #cbd5e1',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
    },
    ghost: {
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
    }
  };

  const baseStyle = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    borderRadius: '12px',
    fontWeight: '600',
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
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.6)';
      } else if (variant === 'success') {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.6)';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1) translateY(0px)';
      e.currentTarget.style.boxShadow = baseStyle.boxShadow;
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

// Modern Card Component
const PricingCard = ({ 
  children, 
  featured = false,
  style = {}, 
  ...props 
}: {
  children: React.ReactNode;
  featured?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  const cardStyle = {
    background: featured 
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)' 
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    boxShadow: featured 
      ? '0 20px 60px rgba(59, 130, 246, 0.15)' 
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: featured 
      ? '2px solid rgba(59, 130, 246, 0.2)' 
      : '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    overflow: 'hidden',
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.boxShadow = featured 
      ? '0 25px 80px rgba(59, 130, 246, 0.25)' 
      : '0 20px 60px rgba(0, 0, 0, 0.15)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0px)';
    e.currentTarget.style.boxShadow = cardStyle.boxShadow;
  };

  return (
    <div 
      style={cardStyle} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {featured && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
        }} />
      )}
      {children}
    </div>
  );
};

// Feature Item Component
const FeatureItem = ({ 
  icon, 
  children, 
  highlighted = false 
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  highlighted?: boolean;
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    fontWeight: highlighted ? '600' : '400'
  }}>
    {icon ? icon : <Check size={18} style={{ color: highlighted ? '#10b981' : '#6b7280' }} />}
    <span>{children}</span>
  </div>
);
export default function ModernPricingPage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  const handleGetPro = async (planType: string) => {
    console.log("Selected plan:", planType);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planType }), // 👈 send only the plan key
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Stripe Checkout redirect
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Checkout failed:", error);
      alert("Checkout failed: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      fontFamily: "'Lexend', sans-serif",
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>✍️</span>
            </div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              Dyslexia Writer
            </h1>
          </div>
          <p style={{
            fontSize: '1.25rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Choose the perfect plan for your writing journey. From individual learners to entire schools.
          </p>
        </div>

        {/* Individual Plans */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
            justifyContent: 'center'
          }}>
            <Users size={24} style={{ color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              For Individuals
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {/* Free Plan */}
            <PricingCard>
              <div style={{ padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '8px'
                  }}>
                    Free
                  </h3>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: '#3b82f6',
                    marginBottom: '4px'
                  }}>
                   {"£"}0
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>per month</div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <FeatureItem>5 simplifications per day</FeatureItem>
                  <FeatureItem icon={<Volume2 size={18} style={{ color: '#6b7280' }} />}>
                    Rachel voice only
                  </FeatureItem>
                  <FeatureItem>Basic writing tools</FeatureItem>
                  <FeatureItem>Dyslexia-friendly fonts</FeatureItem>
                </div>

                <ModernButton
                  variant="ghost"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={() => window.location.href = '/sign-up'}
                >
                  Start Free
                </ModernButton>
              </div>
            </PricingCard>

{/* Pro Monthly */}
<PricingCard featured={true}>
  <div style={{ padding: '32px' }}>
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <Star size={12} />
      Most Popular
    </div>

    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '8px'
      }}>
        Pro Monthly
      </h3>
      <div style={{
        fontSize: '3rem',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '4px'
      }}>
       {"£"}6.99
      </div>
      <div style={{ color: '#64748b', fontSize: '14px' }}>per month</div>
    </div>

    <div style={{ marginBottom: '32px' }}>
      <FeatureItem highlighted icon={<Sparkles size={18} style={{ color: '#10b981' }} />}>
        Unlimited Simplifications
      </FeatureItem>
      <FeatureItem highlighted icon={<Volume2 size={18} style={{ color: '#10b981' }} />}>
        All voices (MollY, Liam, etc.)
      </FeatureItem>
      <FeatureItem highlighted icon={<Download size={18} style={{ color: '#10b981' }} />}>
        Export as MP3
      </FeatureItem>
      <FeatureItem highlighted icon={<Palette size={18} style={{ color: '#10b981' }} />}>
        Font & color tools
      </FeatureItem>
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
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Save 30%
                </div>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '8px'
                  }}>
                    Pro Annual
                  </h3>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: '#3b82f6',
                    marginBottom: '4px'
                  }}>
                   {"£"}50
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>per year</div>
                  <div style={{ 
                    color: '#10b981', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    marginTop: '4px' 
                  }}>
                    (£4.17/month)
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <FeatureItem highlighted icon={<Sparkles size={18} style={{ color: '#10b981' }} />}>
                    Unlimited simplification
                  </FeatureItem>
                  <FeatureItem highlighted icon={<Volume2 size={18} style={{ color: '#10b981' }} />}>
                    All voices (Molly, Liam, etc.)
                  </FeatureItem>
                  <FeatureItem highlighted icon={<Download size={18} style={{ color: '#10b981' }} />}>
                    Export as MP3
                  </FeatureItem>
                  <FeatureItem highlighted icon={<Palette size={18} style={{ color: '#10b981' }} />}>
                    Font & color tools
                  </FeatureItem>
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
         <ModernButton
           variant="primary"
           size="lg"
           style={{ width: "100%" }}
         >
           Sign in to upgrade
         </ModernButton>
       </SignInButton>
     </SignedOut>
  </div>
</PricingCard>
          </div>
        </div>

        {/* School Plans */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
            justifyContent: 'center'
          }}>
            <School size={24} style={{ color: '#10b981' }} />
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              For Schools
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {[
              { 
                name: 'Starter', 
                range: '1–30 students', 
                price: '£300', 
                id: 'school_starter',
                description: 'Perfect for small classrooms'
              },
              { 
                name: 'Mid', 
                range: '31–150 students', 
                price: '£2,000', 
                id: 'school_mid',
                description: 'Great for medium schools'
              },
              { 
                name: 'Full', 
                range: '151–500 students', 
                price: '£5,000', 
                id: 'school_full',
                description: 'Complete school solution'
              },
            ].map((plan, index) => (
              <PricingCard key={plan.id}>
                <div style={{ padding: '32px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}>
                      {plan.name}
                    </h3>
                    <div style={{
                      color: '#64748b',
                      fontSize: '14px',
                      marginBottom: '12px'
                    }}>
                      {plan.description}
                    </div>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: '#10b981',
                      marginBottom: '4px'
                    }}>
                      {plan.price}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>per year</div>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <FeatureItem highlighted>Up to {plan.range}</FeatureItem>
                    <FeatureItem>Teacher Dashboard</FeatureItem>
                    <FeatureItem>Class Roster Import</FeatureItem>
                    <FeatureItem>Usage Reports</FeatureItem>
                    <FeatureItem>Priority Support</FeatureItem>
                  </div>

                  <ModernButton
                    variant="success"
                    size="lg"
                    style={{ width: '100%' }}
                    onClick={() => handleGetPro(plan.id)}
                  >
                    Get {plan.name} Plan
                  </ModernButton>
                </div>
              </PricingCard>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{
          textAlign: 'center',
          marginTop: '80px',
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '12px'
          }}>
            Questions about our plans?
          </h3>
          <p style={{
            color: '#64748b',
            marginBottom: '24px'
          }}>
            We're here to help you find the perfect solution for your needs.
          </p>
          <ModernButton
            variant="ghost"
            onClick={() => window.location.href = 'mailto:support@dyslexiawriter.com'}
          >
            Contact Support
          </ModernButton>
        </div>
      </div>
    </div>
  );
}
