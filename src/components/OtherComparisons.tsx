import Link from 'next/link';

const COMPARISONS = [
  { slug: 'texthelp', label: 'Dyslexia Write vs TextHelp Read&Write', href: '/compare' },
  { slug: 'grammarly', label: 'Dyslexia Write vs Grammarly', href: '/vs/grammarly' },
  { slug: 'claroread', label: 'Dyslexia Write vs ClaroRead', href: '/vs/claroread' },
  { slug: 'immersive-reader', label: 'Dyslexia Write vs Microsoft Immersive Reader', href: '/vs/immersive-reader' },
] as const;

export function OtherComparisons({ current }: { current: (typeof COMPARISONS)[number]['slug'] }) {
  const others = COMPARISONS.filter((c) => c.slug !== current);

  return (
    <div style={{ textAlign: 'center', paddingTop: 8 }}>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Other comparisons</p>
      <div style={{ display: 'flex', gap: '6px 18px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {others.map((c) => (
          <Link key={c.slug} href={c.href} style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
