'use client';

import Link from 'next/link';
import { landing } from '@/lib/landingTheme';
import { Reveal } from './Reveal';

export function DyslexiaWritingSection() {
  return (
    <div style={{ padding: '60px 20px', backgroundColor: landing.bg }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <Reveal>
          <h2
            style={{
              fontFamily: landing.fontDisplay,
              fontSize: 'clamp(24px, 3.6vw, 30px)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '20px',
              color: landing.ink,
            }}
          >
            Dyslexia writing
          </h2>
          <p style={{ fontSize: '16px', color: landing.inkMuted, lineHeight: 1.75, marginBottom: '16px' }}>
            Dyslexia writing is hard for reasons that have nothing to do with effort or intelligence — it
            comes down to how the brain handles phonology, working memory and sequencing while putting
            words on a page. That shows up as spelling that follows sound rather than convention, letters
            and whole words swapped or dropped mid-sentence, and losing the thread of what you meant to say
            while you're still forming it. Standard spellcheckers are built to catch typos, not these
            patterns, so dyslexic writing often gets flagged as careless when it isn't.
          </p>
          <p style={{ fontSize: '16px', color: landing.inkMuted, lineHeight: 1.75, marginBottom: 0 }}>
            Dyslexia Write is built around those patterns specifically: it catches phonetic misspellings and
            real-word errors that regular spellcheck misses, and helps you simplify and rewrite sentences
            without losing what you meant to say. Read more in our guide to{' '}
            <Link href="/guides/dyslexia-writing-mistakes-spellcheckers-miss" style={{ color: landing.amberDark, fontWeight: 600 }}>
              dyslexia writing
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </div>
  );
}
