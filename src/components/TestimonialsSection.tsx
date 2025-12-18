'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  theme: any;
  darkMode: boolean;
}

export function TestimonialsSection({ theme, darkMode }: TestimonialsSectionProps) {
  const testimonials = [
    {
      quote:
        "Finally, a writing tool that doesn't make me feel stupid. The grammar check catches my 'there/their' mistakes without explaining passive voice or whatever.",
      author: 'Sarah M.',
      role: 'University Student',
      rating: 5,
    },
    {
      quote:
        "The sentence rewriting feature is a game-changer. I can see 3 ways to say something and just pick the one that sounds right. No more staring at the screen for 10 minutes.",
      author: 'James T.',
      role: 'Marketing Professional',
      rating: 5,
    },
    {
      quote:
        "I love that it asks 'who are you writing for?' before giving tips. Every other tool just throws grammar rules at me. This one actually helps.",
      author: 'Alex K.',
      role: 'Teacher',
      rating: 5,
    },
    {
      quote:
        "The read-aloud feature with sentence highlighting helps me catch mistakes I'd never see. It's like having someone proofread for me.",
      author: 'Maria G.',
      role: 'Content Writer',
      rating: 5,
    },
    {
      quote:
        "I can finally write work emails without anxiety. The 'more confident' rewrite option makes me sound professional without trying to use big words.",
      author: 'David R.',
      role: 'Software Developer',
      rating: 5,
    },
    {
      quote:
        "Best part? It tracks my progress and shows I'm improving. That motivation keeps me writing instead of avoiding it like I used to.",
      author: 'Emma L.',
      role: 'Freelance Writer',
      rating: 5,
    },
  ];

  return (
    <div
      style={{
        padding: '80px 20px',
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: darkMode ? '#374151' : '#fef3c7',
              color: darkMode ? '#fbbf24' : '#f59e0b',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '16px',
            }}
          >
            Testimonials
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
            What Dyslexic Writers Say
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
            Real feedback from writers who understand the struggle—and have found relief.
          </p>
        </div>

        {/* Testimonials grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              style={{
                backgroundColor: darkMode ? '#111827' : '#f9fafb',
                padding: '32px',
                borderRadius: '16px',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = darkMode
                  ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                  : '0 10px 30px rgba(0, 0, 0, 0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Quote icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  opacity: 0.1,
                }}
              >
                <Quote size={48} />
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill="#fbbf24"
                    stroke="#fbbf24"
                    style={{ opacity: 0.9 }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: '16px',
                  color: theme.text,
                  lineHeight: '1.7',
                  marginBottom: '24px',
                  fontStyle: 'italic',
                }}
              >
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '18px',
                  }}
                >
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: theme.text,
                    }}
                  >
                    {testimonial.author}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div
          style={{
            marginTop: '80px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            textAlign: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: '800',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
              }}
            >
              10,000+
            </div>
            <div
              style={{
                fontSize: '16px',
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              Active Writers
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: '800',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
              }}
            >
              4.9/5
            </div>
            <div
              style={{
                fontSize: '16px',
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              Average Rating
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: '800',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
              }}
            >
              500k+
            </div>
            <div
              style={{
                fontSize: '16px',
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              Documents Written
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: '800',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
              }}
            >
              94%
            </div>
            <div
              style={{
                fontSize: '16px',
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              Would Recommend
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
