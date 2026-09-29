import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES, getGuideBySlug } from '@/lib/guides-data';
import { guideArticleSchema } from '@/app/schema';
import { landing } from '@/lib/landingTheme';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | Dyslexia Write Guides`,
    description: guide.description,
    alternates: { canonical: `https://www.dyslexiawrite.com/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `https://www.dyslexiawrite.com/guides/${guide.slug}`,
      type: 'article',
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const otherGuides = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <div style={{ minHeight: '100vh', background: landing.bg }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideArticleSchema(guide)) }}
      />

      <article style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 20px 40px' }}>
        <Link href="/guides" style={{ fontSize: '13px', fontWeight: 600, color: landing.amberDark, textDecoration: 'none' }}>
          ← All guides
        </Link>

        <h1
          style={{
            fontFamily: landing.fontDisplay,
            fontSize: 'clamp(28px, 4.5vw, 38px)',
            fontWeight: 600,
            color: landing.ink,
            margin: '18px 0 10px',
            lineHeight: 1.25,
          }}
        >
          {guide.title}
        </h1>
        <div style={{ fontSize: '13px', color: landing.inkFaint, marginBottom: '40px' }}>
          {new Date(guide.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}
          {guide.readingTime}
        </div>

        {guide.sections.map((section, i) => (
          <section key={i} style={{ marginBottom: '30px' }}>
            {section.heading && (
              <h2 style={{ fontFamily: landing.fontDisplay, fontSize: '22px', fontWeight: 600, color: landing.ink, marginBottom: '12px' }}>
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((p, j) => (
              <p key={j} style={{ fontSize: '16px', color: landing.ink, lineHeight: 1.75, marginBottom: '14px' }}>
                {p}
              </p>
            ))}
            {section.list && (
              <ul style={{ paddingLeft: '22px', margin: '0 0 14px' }}>
                {section.list.map((item, k) => (
                  <li key={k} style={{ fontSize: '16px', color: landing.ink, lineHeight: 1.75, marginBottom: '6px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div
          style={{
            marginTop: '48px',
            padding: '28px 30px',
            borderRadius: '16px',
            backgroundColor: landing.amberTint,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '15px', color: landing.ink, marginBottom: '16px', fontWeight: 600 }}>
            Want to try the tools mentioned here?
          </p>
          <Link
            href="/sign-up"
            style={{
              display: 'inline-block',
              padding: '12px 26px',
              borderRadius: '24px',
              background: landing.amber,
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            Start free — no card needed
          </Link>
        </div>

        {otherGuides.length > 0 && (
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: `1px solid ${landing.line}` }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: landing.inkFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              More guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {otherGuides.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} style={{ fontSize: '15px', fontWeight: 600, color: landing.ink, textDecoration: 'none' }}>
                  {g.title} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
