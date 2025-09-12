// app/head.tsx  (server component; no "use client")
export default function Head() {
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Dyslexia Writer",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: "https://www.dyslexiawrite.com/",
    description: "Dyslexia-friendly writing app with dictation, text-to-speech, and one-tap simplification.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    screenshot: [
      "https://www.dyslexiawrite.com/og/shot1.jpg",
      "https://www.dyslexiawrite.com/og/shot2.jpg"
    ]
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dyslexia Writer",
    url: "https://www.dyslexiawrite.com/",
    logo: "https://www.dyslexiawrite.com/logo.png"
  };

  // Only include SearchAction if a real /search route exists
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dyslexia Writer",
    url: "https://www.dyslexiawrite.com/",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.dyslexiawrite.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      {/* Remove this <script> if you don't have a /search page yet */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
