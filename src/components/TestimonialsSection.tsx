'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { landing } from '@/lib/landingTheme';
import { Reveal } from './Reveal';

const AVATAR_COLORS = [landing.amber, landing.teal, landing.rose];

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Finally, a writing tool that doesn't make me feel stupid. The grammar check catches my 'there/their' mistakes without explaining passive voice or whatever.",
      author: 'Sarah M.',
      role: 'University Student',
    },
    {
      quote:
        'The sentence rewriting feature is a game-changer. I can see 3 ways to say something and just pick the one that sounds right. No more staring at the screen for 10 minutes.',
      author: 'James T.',
      role: 'Marketing Professional',
    },
    {
      quote:
        "I love that it asks 'who are you writing for?' before giving tips. Every other tool just throws grammar rules at me. This one actually helps.",
      author: 'Alex K.',
      role: 'Teacher',
    },
    {
      quote:
        "The read-aloud feature with sentence highlighting helps me catch mistakes I'd never see. It's like having someone proofread for me.",
      author: 'Maria G.',
      role: 'Content Writer',
    },
    {
      quote:
        "I can finally write work emails without anxiety. The 'more confident' rewrite option makes me sound professional without trying to use big words.",
      author: 'David R.',
      role: 'Software Developer',
    },
    {
      quote:
        "Best part? It tracks my progress and shows I'm improving. That motivation keeps me writing instead of avoiding it like I used to.",
      author: 'Emma L.',
      role: 'Freelance Writer',
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
              Testimonials
            </div>
            <h2 style={{ fontFamily: landing.fontDisplay, fontSize: 'clamp(26px, 4vw, 32px)', fontWeight: 600, marginBottom: '14px', color: landing.ink }}>
              What Dyslexic Writers Say
            </h2>
            <p style={{ color: landing.inkMuted, fontSize: '15.5px', maxWidth: '520px', margin: '0 auto' }}>
              Real feedback from writers who understand the struggle — and have found relief.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', margin: '32px 0' }}>
          {testimonials.map((testimonial, index) => (
            <Reveal key={index}>
              <div
                style={{
                  backgroundColor: landing.panel,
                  padding: '24px',
                  borderRadius: '12px',
                  border: `1px solid ${landing.line}`,
                  position: 'relative',
                  height: '100%',
                }}
              >
                <div style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.12, color: landing.ink }}>
                  <Quote size={40} />
                </div>

                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={landing.amber} stroke={landing.amber} />
                  ))}
                </div>

                <p
                  style={{
                    fontFamily: landing.fontDisplay,
                    fontSize: '15.5px',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    marginBottom: '18px',
                    color: landing.ink,
                  }}
                >
                  &quot;{testimonial.quote}&quot;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: `1px solid ${landing.line}`, paddingTop: '14px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '14px',
                      fontFamily: landing.fontDisplay,
                      backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                    }}
                  >
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: landing.ink }}>{testimonial.author}</div>
                    <div style={{ fontSize: '12px', color: landing.inkMuted }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
