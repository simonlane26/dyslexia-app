'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { landing } from '@/lib/landingTheme';

const TEASER_SRC = '/hero-teaser.mp4';
const FULL_SRC = '/hero-promo-full.mp4';
const POSTER_SRC = '/hero-promo-poster.jpg';
const CAPTIONS_SRC = '/hero-promo-captions.vtt';
const MOBILE_BREAKPOINT = '(min-width: 761px)';

function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: name, ...params });
}

export function HeroVideo() {
  // Defaults to the collapsed/mobile rendering (poster image, no video
  // element mounted) until confirmed desktop — avoids ever loading the
  // teaser clip on a phone, and avoids a hydration mismatch.
  const [isDesktop, setIsDesktop] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fullVideoRef = useRef<HTMLVideoElement>(null);
  const hasFiredPlay = useRef(false);
  const hasFired75 = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT);
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const openModal = useCallback(() => {
    hasFiredPlay.current = false;
    hasFired75.current = false;
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    fullVideoRef.current?.pause();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen, closeModal]);

  const handlePlay = useCallback(() => {
    if (hasFiredPlay.current) return;
    hasFiredPlay.current = true;
    trackEvent('video_play', { video_title: 'DyslexiaWrite Promo' });
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = fullVideoRef.current;
    if (!v || !v.duration || hasFired75.current) return;
    if (v.currentTime / v.duration >= 0.75) {
      hasFired75.current = true;
      trackEvent('video_75_watched', { video_title: 'DyslexiaWrite Promo' });
    }
  }, []);

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 20px' }}>
      <button
        type="button"
        onClick={openModal}
        aria-label="Play video: See what Dyslexia Write can do"
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          border: `1px solid ${landing.line}`,
          borderRadius: '14px',
          overflow: 'hidden',
          cursor: 'pointer',
          padding: 0,
          background: '#000',
        }}
      >
        {isDesktop ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={POSTER_SRC}
            style={{ width: '100%', display: 'block', aspectRatio: '16 / 9', objectFit: 'cover' }}
          >
            <source src={TEASER_SRC} type="video/mp4" />
          </video>
        ) : (
          // Collapsed mobile state — only the poster image loads, no video
          // weight at all, until the viewer taps to open the full player.
          <img
            src={POSTER_SRC}
            alt="Dyslexia Write product preview"
            style={{ width: '100%', display: 'block', aspectRatio: '16 / 9', objectFit: 'cover' }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.12)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.94)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={landing.amber}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>

      <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: landing.inkMuted }}>
        See what Dyslexia Write can do
      </p>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dyslexia Write product demo video"
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '960px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close video"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <video
              ref={fullVideoRef}
              controls
              autoPlay
              playsInline
              poster={POSTER_SRC}
              onPlay={handlePlay}
              onTimeUpdate={handleTimeUpdate}
              style={{ width: '100%', borderRadius: '10px', display: 'block', background: '#000' }}
            >
              <source src={FULL_SRC} type="video/mp4" />
              <track kind="captions" src={CAPTIONS_SRC} srcLang="en" label="English" default />
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
