// Schema.org structured data for SEO
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dyslexia Writer',
  url: 'https://www.dyslexiawrite.com',
  description:
    'AI-powered writing tools designed specifically for dyslexic writers. Features include grammar checking, sentence rewriting, reading guides, and writing coaching.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.dyslexiawrite.com/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dyslexia Writer Ltd',
  url: 'https://www.dyslexiawrite.com',
  logo: 'https://www.dyslexiawrite.com/logo.png',
  description:
    'Dyslexia Writer Ltd provides AI-powered writing assistance tools specifically designed for people with dyslexia.',
  foundingDate: '2024',
  sameAs: [
    // Add your social media profiles here
    // 'https://twitter.com/dyslexiawriter',
    // 'https://www.facebook.com/dyslexiawriter',
    // 'https://www.linkedin.com/company/dyslexiawriter',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@dyslexiawrite.com',
    availableLanguage: ['English'],
  },
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Dyslexia Writer',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Writing Assistant',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
    availability: 'https://schema.org/InStock',
    description: 'Free plan available with premium Pro features',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '256',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Real-time grammar checking for dyslexia',
    'AI-powered sentence rewriting',
    'Reading Guide with Line Focus, Sentence Spotlight, and Reading Ruler',
    'Intent-first Writing Coach',
    'Voice dictation',
    'Text-to-speech',
    'Smart text simplification',
    'Progress tracking',
  ],
  screenshot: 'https://www.dyslexiawrite.com/screenshot.png',
  softwareVersion: '2.0',
  releaseNotes: 'Added Reading Guide feature with multiple visual guidance modes',
  datePublished: '2024-01-01',
  url: 'https://www.dyslexiawrite.com',
  author: {
    '@type': 'Organization',
    name: 'Dyslexia Writer Ltd',
  },
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Dyslexia Writer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dyslexia Writer is a free, AI-powered writing app specifically designed for people with dyslexia. It includes grammar checking, sentence rewriting, reading guides, and writing coaching features to help you write with confidence.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Dyslexia Writer free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Dyslexia Writer offers a free plan with 5 uses per day. Pro features like Reading Guide and unlimited AI suggestions are available with a paid subscription.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Reading Guide feature?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Reading Guide is a Pro feature that reduces visual noise while writing. It offers three modes: Line Focus (highlights current line), Sentence Spotlight (highlights current sentence), and Reading Ruler (a horizontal guide that follows your cursor).',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Dyslexia Writer work on mobile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Dyslexia Writer is a web-based application that works on any device with a modern web browser, including smartphones, tablets, and computers.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI sentence rewriting work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Select any sentence in your text and click the Rewrite button. The AI will provide 3 alternatives labeled as Simpler, More Confident, or Clearer. Click Apply to instantly replace your sentence with the chosen alternative.',
      },
    },
  ],
};
