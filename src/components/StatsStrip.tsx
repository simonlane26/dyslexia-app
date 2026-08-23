'use client';

import { useEffect, useRef, useState } from 'react';
import { landing } from '@/lib/landingTheme';

interface Stat {
  value: number;
  decimals?: number;
  suffix: string;
  compact?: boolean;
  label: string;
}

const STATS: Stat[] = [
  { value: 10000, suffix: '+', label: 'Active Writers' },
  { value: 4.9, decimals: 1, suffix: '/5', label: 'Average Rating' },
  { value: 500000, suffix: '+', compact: true, label: 'Documents Written' },
  { value: 94, suffix: '%', label: 'Would Recommend' },
];

function formatCompact(n: number) {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return `${Math.round(n)}`;
}

function StatCount({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  const render = (v: number) => {
    if (stat.decimals) return v.toFixed(stat.decimals) + stat.suffix;
    if (stat.compact) return formatCompact(v) + stat.suffix;
    return Math.round(v).toLocaleString() + stat.suffix;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || started) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(stat.value);
      setStarted(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true);
            const start = performance.now();
            const duration = 1100;
            const step = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setDisplay(stat.value * eased);
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} style={{ fontFamily: landing.fontDisplay, fontWeight: 700, fontSize: '36px', color: landing.amberDark }}>
      {render(display)}
    </div>
  );
}

export function StatsStrip() {
  return (
    <div style={{ borderTop: `1px solid ${landing.line}`, borderBottom: `1px solid ${landing.line}`, backgroundColor: landing.bgAlt, padding: '50px 20px' }}>
      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          textAlign: 'center',
        }}
        className="stats-row"
      >
        {STATS.map((stat) => (
          <div key={stat.label}>
            <StatCount stat={stat} />
            <div style={{ fontSize: '13.5px', color: landing.inkMuted, marginTop: '6px' }}>{stat.label}</div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @media (max-width: 900px) {
          .stats-row {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
