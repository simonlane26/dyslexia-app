// Schema.org structured data — shared across marketing pages

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'DyslexiaWrite',
  url: 'https://www.dyslexiawrite.com',
  description:
    'AI-powered writing and reading support platform designed for dyslexic users.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.dyslexiawrite.com/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DyslexiaWrite',
  legalName: 'IgnisTech Ltd',
  url: 'https://www.dyslexiawrite.com',
  logo: 'https://www.dyslexiawrite.com/LogoNew.png',
  description:
    'IgnisTech Ltd develops DyslexiaWrite, an AI-powered assistive technology platform for dyslexic users, based in the UK.',
  foundingDate: '2024',
  foundingLocation: { '@type': 'Place', addressCountry: 'GB' },
  sameAs: ['https://twitter.com/dyslexiawriter'],
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
  name: 'DyslexiaWrite',
  url: 'https://www.dyslexiawrite.com',
  description:
    'AI-powered writing and reading support platform designed for dyslexic users. Provides text simplification, text-to-speech, document decoding, Chrome extension, and reading mode progression tracking.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web, Chrome Extension, PWA',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'GBP',
      description: 'Free tier with daily usage limits',
    },
    {
      '@type': 'Offer',
      name: 'Pro (Individual)',
      price: '6.99',
      priceCurrency: 'GBP',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        billingDuration: 'P1M',
      },
    },
    {
      '@type': 'Offer',
      name: 'Schools Starter',
      price: '300',
      priceCurrency: 'GBP',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        billingDuration: 'P1Y',
      },
      eligibleQuantity: { '@type': 'QuantitativeValue', maxValue: 30 },
    },
    {
      '@type': 'Offer',
      name: 'Workplace Business',
      price: '95',
      priceCurrency: 'GBP',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        billingDuration: 'P1Y',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1,
          unitText: 'user',
        },
      },
    },
    {
      '@type': 'Offer',
      name: 'Access to Work Licence',
      price: '120',
      priceCurrency: 'GBP',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        billingDuration: 'P1Y',
      },
      description: 'UK Government Access to Work scheme compatible — typically 100% funded by DWP',
    },
  ],
  creator: {
    '@type': 'Organization',
    name: 'IgnisTech Ltd',
    url: 'https://www.dyslexiawrite.com',
  },
  featureList: [
    'AI-powered text simplification and rewriting',
    'Text-to-speech with word-level karaoke highlighting',
    'Document Decoder for explaining complex documents in plain language',
    'Chrome browser extension for email and web support',
    'Three reading modes: Supported, Guided, and Clean',
    'Voice dictation',
    'Accessibility Passport generation',
    'SENCO class dashboard with progress tracking',
    'Equality Act Compliance Pack for enterprise',
    'Access to Work compatible',
    'Story Mode with AI-generated personalised stories',
    'Meeting Survival Kit and Lesson Capture',
    'Spaced repetition vocabulary builder',
  ],
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: ['student', 'teacher'],
    audienceType: 'Dyslexic users, neurodiverse individuals, schools, employers',
  },
  isAccessibleForFree: true,
  inLanguage: ['en-GB'],
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the best assistive technology for dyslexia in the UK?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most widely used dyslexia assistive technology tools in the UK include DyslexiaWrite, TextHelp Read&Write, and Claro Software. DyslexiaWrite offers AI-powered text simplification, document decoding, reading mode progression tracking, and an Accessibility Passport — features not found in most competitors — at a significantly lower price point. For Access to Work-funded employees and school SENCO teams requiring evidence of progression, DyslexiaWrite is a strong option.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does dyslexia software cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dyslexia software varies widely in price. DyslexiaWrite starts at £6.99/month for individuals, £300/year for schools (up to 30 students), and £95/user/year for workplaces. An Access to Work licence is available at £120/year — typically 100% funded by DWP. TextHelp Read&Write costs approximately £145–200/user/year, making DyslexiaWrite around 70–80% cheaper.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a cheaper alternative to TextHelp Read&Write?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. DyslexiaWrite is a direct alternative to TextHelp Read&Write at approximately 70–80% lower cost. It offers comparable text-to-speech, grammar checking, and voice dictation, plus additional features TextHelp does not include: AI document decoding, reading mode progression tracking for SENCO evidence, an Accessibility Passport, and an Equality Act Compliance Pack for employers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Access to Work fund dyslexia software?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. The UK Government's Access to Work scheme can fund assistive technology for employees with dyslexia or other disabilities. DyslexiaWrite offers a dedicated Access to Work licence at £120/year, which is typically 100% funded by the Department for Work and Pensions (DWP). Your employer or Access to Work assessor can include it in your support package.",
      },
    },
    {
      '@type': 'Question',
      name: 'What assistive technology do schools use for dyslexic students?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'UK schools commonly use TextHelp Read&Write, Claro Software, or DyslexiaWrite for dyslexic students. DyslexiaWrite is designed specifically for school use with a SENCO class dashboard, reading mode progression tracking that generates evidence for EHCPs, vocabulary growth reporting, and auto-generated termly reports. School plans start at £300/year for up to 30 students and DyslexiaWrite is a registered Incensu education supplier.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does DyslexiaWrite work on mobile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. DyslexiaWrite is a web-based PWA (Progressive Web App) that works on any device with a modern browser, including iOS and Android smartphones and tablets. The core writing, reading, and simplification tools are fully functional on mobile. A Chrome browser extension is also available for desktop use on email, Slack, and web pages.',
      },
    },
    {
      '@type': 'Question',
      name: "What's the difference between DyslexiaWrite and Read&Write?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Both tools offer text-to-speech, grammar checking, and voice dictation. DyslexiaWrite adds AI document decoding (explaining any uploaded document in plain language), reading mode progression tracking for SENCO evidence, an Accessibility Passport, Story Mode for children, and a Meeting Survival Kit. TextHelp Read&Write has a longer track record, broader language support, and specialist maths features. DyslexiaWrite is 70–80% cheaper.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is DyslexiaWrite?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DyslexiaWrite is a UK-based AI-powered assistive technology platform for dyslexic users. It provides writing support (grammar checking, AI rewriting, voice dictation), reading assistance (text-to-speech with word-level highlighting, three reading modes), and document comprehension tools (document decoding, text simplification). It is developed by IgnisTech Ltd and available at dyslexiawrite.com.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is DyslexiaWrite free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DyslexiaWrite has a free tier with daily usage limits — no credit card required. The Pro plan at £6.99/month gives unlimited access to all individual features. Schools and workplaces have separate annual plans. An Access to Work licence at £120/year is available for UK employees and is typically 100% funded by DWP.',
      },
    },
    {
      '@type': 'Question',
      name: 'What reading modes does DyslexiaWrite offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DyslexiaWrite offers three reading modes: Supported (adds a reading ruler, colour tint, and increased line spacing), Guided (focuses on one sentence at a time with a spotlight), and Clean (removes all distractions for confident readers). Progression through these modes is tracked over time and can be used as SENCO evidence for EHCPs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can DyslexiaWrite decode documents and letters?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. DyslexiaWrite's Document Decoder allows users to upload or photograph any document — a letter, form, contract, or policy — and receive a plain-English explanation instantly. This is particularly useful for legal documents, NHS letters, or workplace communications that use complex language.",
      },
    },
    {
      '@type': 'Question',
      name: 'What evidence does DyslexiaWrite provide for EHCP and SEN reports?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DyslexiaWrite tracks reading mode progression over time — from Supported to Guided to Clean — and generates reports showing vocabulary growth and writing session data. These can be used by SENCOs as objective evidence for EHCP reviews and Annual Reviews. The school dashboard provides anonymised, aggregate data per student without storing any content.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does DyslexiaWrite have a Chrome extension?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. DyslexiaWrite offers a Chrome browser extension that brings text simplification and reading support to any website — including email, Slack, Google Docs, and web pages. Users can highlight text and simplify it, or have it read aloud, without leaving the page they are on.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can employers provide DyslexiaWrite as a reasonable adjustment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. DyslexiaWrite is designed for workplace use and counts as an assistive technology reasonable adjustment under the Equality Act 2010. The Workplace plan includes an Equality Act Compliance Pack (Reasonable Adjustment Policy template, adjustment records, and a neurodiversity awareness guide) to help HR and line managers implement support properly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is an Accessibility Passport?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "DyslexiaWrite's Accessibility Passport is a personal accessibility profile generated from the user's usage data — their preferred reading mode, font size, TTS voice, and vocabulary. It can be shared with employers or educational institutions to communicate support needs clearly, without the user having to explain them from scratch each time.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is DyslexiaWrite GDPR compliant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. DyslexiaWrite is GDPR compliant with UK data hosting (Supabase EU region). No user-written content is stored on servers or used to train AI models. School usage data is anonymised and limited to aggregate metrics (word counts, session counts, reading mode). A Data Processing Agreement is available for enterprise and school customers.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does DyslexiaWrite help in meetings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "DyslexiaWrite's Meeting Survival Kit provides an AI briefing in plain English before a meeting, captures a live simplified transcript in real time, then automatically generates a summary with decisions, action items, and a draft follow-up email. It uses the device's microphone and the Web Speech API — no external recording software needed.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is DyslexiaWrite Story Mode?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Story Mode is a feature for children that generates personalised AI stories based on a chosen theme and reading level. Stories include warmup vocabulary words before reading, karaoke-style word highlighting as the story is read aloud, and a tap-to-decode vocabulary lookup. Free users get one AI-generated story per week; Pro users get unlimited stories.',
      },
    },
  ],
};
