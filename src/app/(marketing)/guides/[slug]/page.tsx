import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES, getGuideBySlug } from '@/lib/guides-data';
import { guideArticleSchema, guideFaqSchema } from '@/app/schema';
import { landing } from '@/lib/landingTheme';
import { Footer } from '@/components/Footer';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | DyslexiaWrite Guides`,
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
      {guide.faqs && guide.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(guideFaqSchema(guide.faqs)) }}
        />
      )}

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
          {guide.h1 ?? guide.title}
        </h1>
        <div style={{ fontSize: '13px', color: landing.inkFaint, marginBottom: '40px' }}>
          {guide.author && (
            <>
              By {guide.author.name}, {guide.author.title}
              {' · '}
            </>
          )}
          {guide.updatedAt
            ? `Updated ${new Date(guide.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : new Date(guide.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
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
            {section.table && (
              <div style={{ overflowX: 'auto', margin: '18px 0 14px', borderRadius: '10px', border: `1px solid ${landing.line}` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                  <thead>
                    <tr>
                      {section.table.headers.map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '10px 14px',
                            fontWeight: 700,
                            color: landing.ink,
                            backgroundColor: landing.bgAlt,
                            borderBottom: `1px solid ${landing.line}`,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            style={{
                              padding: '10px 14px',
                              color: landing.inkMuted,
                              lineHeight: 1.6,
                              borderBottom: ri < section.table!.rows.length - 1 ? `1px solid ${landing.line}` : 'none',
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {guide.faqs && guide.faqs.length > 0 && (
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ fontFamily: landing.fontDisplay, fontSize: '22px', fontWeight: 600, color: landing.ink, marginBottom: '16px' }}>
              Frequently asked questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {guide.faqs.map((f) => (
                <div key={f.q}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: landing.ink, marginBottom: '6px' }}>{f.q}</h3>
                  <p style={{ fontSize: '15px', color: landing.inkMuted, lineHeight: 1.7, margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

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
            {guide.ctaText ?? 'Want to try the tools mentioned here?'}
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

        {guide.references && guide.references.length > 0 && (
          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: `1px solid ${landing.line}` }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: landing.inkFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Sources
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {guide.references.map((ref) => (
                <li key={ref.url} style={{ fontSize: '14px', marginBottom: '6px' }}>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ color: landing.amberDark }}>
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {guide.relatedLinks && guide.relatedLinks.length > 0 && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${landing.line}` }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: landing.inkFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              You might also find useful
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {guide.relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{ fontSize: '14.5px', fontWeight: 600, color: landing.teal, textDecoration: 'none' }}>
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

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

      <Footer />
    </div>
  );
}
