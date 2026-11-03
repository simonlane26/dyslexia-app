// Guide/blog content — informational articles targeting broad
// dyslexia-writing queries that aren't tied to a buying decision
// (unlike /access-to-work, /schools, /enterprise, /compare, which are
// all bottom-funnel). No CMS/markdown here by design, consistent with
// the rest of the marketing site: each guide is a plain data object,
// rendered by a shared component in guides/[slug]/page.tsx.

export interface GuideSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
  table?: { headers: string[]; rows: string[][] };
}

export interface Guide {
  slug: string;
  title: string;
  // On-page H1 and schema.org headline. Falls back to `title` when omitted —
  // only set this when the SEO <title> and the visible heading should differ.
  h1?: string;
  description: string;
  publishedAt: string; // ISO date
  updatedAt?: string; // ISO date — set when a guide is substantially revised
  readingTime: string;
  author?: { name: string; title: string };
  // Lead-in line above the end-of-guide CTA button — keep it specific to
  // what this guide covers, not a generic "try the tools" line.
  ctaText?: string;
  sections: GuideSection[];
  references?: { label: string; url: string }[];
  // Short FAQ in the exact wording people search — rendered on-page and as
  // FAQPage structured data so answer engines can pick the Q&As up directly.
  faqs?: { q: string; a: string }[];
  // Internal links to bottom-funnel pages, shown as a small block near the
  // end — keeps guides from being a dead end for a reader close to buying.
  relatedLinks?: { label: string; href: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-write-with-dyslexia',
    title: 'How to Write With Dyslexia: Practical Tips and Tools',
    description:
      'Practical, non-clinical strategies for writing with dyslexia — getting ideas down without self-editing, proofreading methods that actually work, and what tools help most.',
    publishedAt: '2026-09-29',
    readingTime: '6 min read',
    ctaText: 'Try dictation and read-back proofreading on your own writing',
    sections: [
      {
        paragraphs: [
          "Dyslexia affects the mechanics of writing — spelling, working memory for sentence structure, proofreading — not intelligence or the quality of your ideas. Most of the strategies that help aren't about trying harder; they're about changing the process so the mechanics stop getting in the way.",
        ],
      },
      {
        heading: 'Get your ideas down before you edit',
        paragraphs: [
          "Trying to spell correctly, structure sentences, and generate ideas all at once is where most writing blocks happen. Write or dictate a rough first pass without stopping to fix anything, then go back and edit as a separate step. Voice dictation is worth trying even if you're a confident typist — speaking removes the spelling barrier entirely while you're still forming the idea.",
        ],
      },
      {
        heading: "Read it back instead of just re-reading it",
        paragraphs: [
          "Silently re-reading your own writing is one of the least reliable ways to catch errors — your brain tends to read what you meant to write, not what's actually on the page. Reading it aloud, or having text-to-speech read it back to you, forces you to process the actual words in order, which catches missing words, repeated words, and sentences that don't quite make sense far more reliably.",
        ],
      },
      {
        heading: 'Use a tool built for dyslexic spelling, not just any spellchecker',
        paragraphs: [
          "Generic spellcheckers are built to catch typos — a swapped letter, a dropped character — by finding words that are visually close to what you typed. Dyslexic spelling errors are often phonetic (writing a word the way it sounds, like 'thort' for 'thought') rather than close to the correct spelling visually, which is exactly the case standard spellcheck handles worst. Tools built specifically around phonetic matching and common dyslexic error patterns — homophones like their/there/they're especially — catch a lot that generic spellcheck misses.",
        ],
      },
      {
        heading: 'Break long sentences into shorter ones',
        paragraphs: [
          'Holding a long sentence\'s full structure in mind while writing it takes working memory, which is often where dyslexia adds friction — leading to run-on sentences or a dropped word partway through. Writing in shorter sentences, then combining a couple if it reads too choppy, is usually easier to get right the first time than trying to build one long sentence correctly from scratch.',
        ],
      },
      {
        heading: "Give yourself extra time, and it's okay to ask for it",
        paragraphs: [
          'If dyslexia is a diagnosed condition, extra time for written work — at school, in exams, or at work — is a standard, reasonable adjustment, not a special favour. Employers in the UK are expected to make reasonable adjustments under the Equality Act 2010, and schools do the same through EHCPs and SEN support. Asking for it directly is usually more effective than trying to work around the problem alone.',
        ],
      },
      {
        heading: 'Where a tool like DyslexiaWrite fits in',
        paragraphs: [
          'DyslexiaWrite is built around several of these strategies directly: voice dictation to get ideas down without typing, text-to-speech read-back with word-level highlighting for proofreading, and phonetic + homophone-aware correction instead of generic spellcheck. There\'s a free tier with no card required if you want to try the approach before deciding whether a dedicated tool is worth it.',
        ],
      },
    ],
  },
  {
    slug: 'best-fonts-for-dyslexia',
    title: 'Best Fonts for Dyslexia: What Actually Helps',
    description:
      'What the research says about fonts for dyslexia: why spacing and size matter more than special "dyslexia fonts", and what\'s worth testing yourself.',
    publishedAt: '2026-09-29',
    updatedAt: '2026-11-03',
    readingTime: '6 min read',
    author: { name: 'Simon Lane', title: 'Founder, DyslexiaWrite' },
    ctaText: 'See your own writing in a dyslexia-friendly font and layout',
    sections: [
      {
        paragraphs: [
          "There's a lot of confident-sounding advice online about the single best font for dyslexia. The honest picture is more mixed: formatting choices genuinely help, but the research on dedicated \"dyslexia fonts\" specifically is weaker than most people assume, and what helps varies from person to person. Here's what's actually well-supported, and where the evidence runs out.",
        ],
      },
      {
        heading: 'Fonts commonly recommended for dyslexia',
        paragraphs: [
          "There's no single scientifically-proven \"best\" font, but a short list of plain, evenly-spaced sans-serif fonts comes up consistently in UK accessibility guidance, including from the British Dyslexia Association: Arial, Verdana, Tahoma, Comic Sans, Century Gothic, and Trebuchet MS. None of these were designed specifically for dyslexia — they're just clear, widely-available sans-serif fonts with letters that stay easy to tell apart at a glance. Comic Sans sits on most of these lists for a specific reason: its letters are less uniform than a typeface like Arial, which can make easily-confused pairs like b/d slightly easier to distinguish, even though it isn't to everyone's taste.",
        ],
      },
      {
        heading: 'Sans-serif, and avoid anything too decorative',
        paragraphs: [
          "Sans-serif fonts (no small strokes at the ends of letters) are generally easier to read on screen than serif fonts, and this holds for most readers, not just dyslexic ones. The bigger win is simply avoiding decorative or overly stylised fonts — anything that makes individual letters harder to distinguish at a glance works against you regardless of dyslexia.",
        ],
      },
      {
        heading: 'Increase line spacing and letter spacing',
        paragraphs: [
          "This has some of the strongest evidence behind it. Extra space between lines (1.5x line height or more) and slightly increased letter spacing reduces visual crowding — where nearby letters and lines interfere with each other as the eye tracks across text. This is often a bigger practical improvement than font choice alone — a 2016 study found that a specially-designed dyslexia font's apparent reading-speed benefit came from its spacing, not its letter shapes, and the advantage disappeared once a standard font was given the same spacing (Marinus et al., 2016 — see Sources).",
        ],
      },
      {
        heading: 'Avoid justified text and pure white backgrounds',
        paragraphs: [
          'Justified text (stretched to align both edges) creates uneven gaps between words that can disrupt reading flow — left-aligned (ragged-right) text is easier to track. A very high-contrast pure white background can also cause visual glare for some readers; a soft off-white or light tint background is often more comfortable, though this varies by person and is worth testing rather than assuming.',
        ],
      },
      {
        heading: 'What about OpenDyslexic and other "dyslexia fonts"?',
        paragraphs: [
          "OpenDyslexic and similar fonts weight the bottom of each letter to try to prevent letters being read upside down or flipped. It's a reasonable idea, but the research evidence is genuinely mixed. The most rigorous controlled study to date — a 2016 alternating-treatment study with primary-school children with dyslexia — found no improvement in reading speed or accuracy with OpenDyslexic compared to Arial or Times New Roman (Wery & Diliberto, 2016 — see Sources); a few smaller studies report modest gains, but with too few participants to generalise from. Meanwhile, some readers report a strong personal preference for it anyway, independent of measured performance.",
          "The honest takeaway: it's worth trying since it's low-cost and some people do prefer it, but treat it as a personal preference to test, not a guaranteed fix — spacing, size, and contrast matter more consistently across the research.",
        ],
      },
      {
        heading: 'Font size and line length',
        paragraphs: [
          "Larger text (18px+ for body text) reduces strain generally. Shorter line lengths — roughly 50-75 characters per line — are easier to track than very wide columns of text, since the eye has less distance to travel back to the start of the next line.",
        ],
      },
      {
        heading: 'Where a tool like DyslexiaWrite fits in',
        paragraphs: [
          "DyslexiaWrite's reading modes let you adjust font, size, spacing, and colour tint directly, and switch between a Supported mode (reading ruler, colour tint, extra spacing) and a cleaner mode once you know what works for you — since, as above, the right formatting genuinely is personal rather than one-size-fits-all.",
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the best font for dyslexia?',
        a: "There's no single proven best font. Plain, evenly-spaced sans-serif fonts — Arial, Verdana, Tahoma, Comic Sans, Century Gothic, and Trebuchet MS all come up consistently in UK accessibility guidance — are a safe default. Spacing, size, and avoiding justified text make more measurable difference than which of these you pick.",
      },
      {
        q: 'Does OpenDyslexic actually help with dyslexia?',
        a: "The evidence is mixed and leans negative for reading speed and accuracy specifically. The best-controlled study to date (Wery & Diliberto, 2016) found no benefit over Arial or Times New Roman for primary-school children with dyslexia. Some people do prefer it subjectively, so it's worth testing for yourself, but don't expect it to outperform a standard sans-serif font with good spacing.",
      },
      {
        q: 'Is Comic Sans good for dyslexia?',
        a: "It's one of the fonts commonly recommended in UK dyslexia-friendly style guidance, partly because its irregular letterforms make easily-confused pairs like b/d a little more distinct. It's not backed by the same kind of rigorous reading-speed research as spacing is, but it's a reasonable, low-cost option to try.",
      },
      {
        q: 'What font size is best for dyslexia?',
        a: '18px or larger for body text is a sensible default, paired with line height of 1.5 or more and shorter line lengths (roughly 50-75 characters per line) — these consistently show more benefit in the research than font choice on its own.',
      },
    ],
    relatedLinks: [
      { label: 'Is DyslexiaWrite funded through Access to Work?', href: '/access-to-work' },
      { label: 'How DyslexiaWrite compares to Microsoft Immersive Reader', href: '/vs/immersive-reader' },
      { label: 'Full feature and pricing comparison', href: '/compare' },
    ],
    references: [
      { label: 'Marinus et al. (2016) — A special font for people with dyslexia: does it work and, if so, why? (Dyslexia journal)', url: 'https://doi.org/10.1002/dys.1527' },
      { label: 'Wery & Diliberto (2016) — The effect of a specialized dyslexia font, OpenDyslexic, on reading rate and accuracy (Annals of Dyslexia)', url: 'https://doi.org/10.1007/s11881-016-0127-1' },
      { label: 'British Dyslexia Association — resources and style guidance', url: 'https://www.bdadyslexia.org.uk/resources' },
    ],
  },
  {
    slug: 'dyslexia-writing-mistakes-spellcheckers-miss',
    title: 'Common Dyslexia Spelling Mistakes (and What Actually Helps)',
    h1: 'Common Dyslexia Spelling Mistakes: Causes and What Helps',
    description:
      'The spelling mistakes dyslexia causes most often, including homophones, reversals and phonetic spellings that spellcheck misses, and what actually helps.',
    publishedAt: '2026-09-29',
    updatedAt: '2026-11-03',
    ctaText: 'Check your own writing for these exact patterns',
    readingTime: '8 min read',
    author: { name: 'Simon Lane', title: 'Founder, DyslexiaWrite' },
    sections: [
      {
        paragraphs: [
          "Dyslexia writing is hard for reasons that have nothing to do with effort or intelligence. The difficulty sits in how the brain processes phonology (the sounds within words), working memory (holding information in mind while using it), and sequencing — not in understanding or forming ideas. The British Dyslexia Association describes dyslexia as primarily affecting accurate and fluent word reading and spelling, with phonological processing, verbal memory and processing speed commonly affected alongside it.",
        ],
      },
      {
        heading: 'Common dyslexia spelling mistakes at a glance',
        paragraphs: [
          "Most dyslexic spelling errors don't look like typos — they're real, correctly-spelled words used in the wrong place, or non-words close enough to several real words that spellcheck guesses wrong. That's why a document can sail through spellcheck with no red underlines and still contain several genuine mistakes:",
        ],
        table: {
          headers: ['Mistake type', 'Example', 'Why spellcheck misses it'],
          rows: [
            ['Homophone', 'their → there', 'Both are real, correctly-spelled words — nothing to flag'],
            ['Letter reversal (real word)', 'was → saw', '"saw" is a different real word, not a misspelling'],
            ['Letter reversal (real word)', 'form → from', '"form" is a different real word, not a misspelling'],
            ['Letter transposition', 'becuase → because', 'Not a real word, so spellcheck flags it — but can suggest the wrong fix if several words are a similar distance away'],
          ],
        },
      },
      {
        heading: 'Homophones',
        paragraphs: [
          "Words that sound identical but mean different things — their/there/they're, your/you're, its/it's, to/too/two, then/than, were/we're — are spelled correctly as words, just the wrong one for the context. Since each is a real, correctly-spelled word, generic spellcheck has nothing to flag. This is one of the single most common dyslexic writing errors and one of the easiest for a human proofreader — or a tool built to check word-in-context, not just word-in-dictionary — to catch.",
        ],
      },
      {
        heading: 'Phonetic spelling',
        paragraphs: [
          "Writing a word the way it sounds rather than how it's conventionally spelled — 'thort' for 'thought', 'nite' for 'night' — is common with dyslexia because English spelling is often inconsistent with pronunciation. Basic spellcheck usually catches these since they're visually distant from the correct spelling, but it can suggest the wrong correction if several real words are a similar edit-distance away, so it's still worth a second look rather than trusting the first suggestion.",
        ],
      },
      {
        heading: 'Letter reversals and transpositions',
        paragraphs: [
          "Reversing similar-looking letters (b/d, p/q) or swapping the order of letters within a word produces two different kinds of mistake. Some swaps land on a different real word — 'form' instead of 'from', 'was' instead of 'saw' — which spellcheck has no reason to flag since the result is correctly spelled. Others produce a non-word, like 'becuase' for 'because' (the 'a' and 'u' swapped) — spellcheck does catch these, but can suggest the wrong fix. 'Recieve' for 'receive' is a similar adjacent-letter swap, and also the classic \"i before e except after c\" rule — it's not a phonetic error (the two spellings sound identical), it's a memorised convention that's easy to get backwards.",
        ],
      },
      {
        heading: 'Missing or duplicated small words',
        paragraphs: [
          "Small function words — a, the, of, to, is — are easy to drop or double up while writing, especially in longer sentences where working memory is doing more of the load-bearing. Because the sentence often still parses without them, or reads slightly awkwardly rather than being obviously wrong, this is one of the errors reading text aloud catches far more reliably than reading it silently.",
        ],
      },
      {
        heading: 'Why writing is hard with dyslexia',
        paragraphs: [
          "Spelling, working memory and letter formation are separate skills, and dyslexia can affect each one differently from person to person. Spelling difficulty often comes from weaker phonological processing — the link between a sound and the letters that represent it is less automatic, so spelling has to be worked out consciously rather than recalled instantly. Working memory difficulty shows up mid-sentence: holding a sentence's planned structure in mind while also spelling each word and tracking what's already been written takes more conscious effort, which is why sentences can run on, lose their thread, or drop a word partway through. None of this reflects how good the underlying idea is — it's a production bottleneck between the idea and the page.",
        ],
      },
      {
        heading: 'Handwriting',
        paragraphs: [
          "Handwriting adds a layer that discussions of dyslexia and writing often skip: physically forming letters is a sequencing and motor-planning task in its own right, on top of spelling and sentence structure. For many dyslexic writers, handwriting is slower and more effortful than typing, because typing removes one layer of that sequencing — selecting a whole letter with one keystroke rather than planning and executing its shape by hand. That's a reasonable, common reason to prefer typing or voice dictation for anything beyond a quick note, and it's a legitimate adjustment to ask for at school or work rather than something to push through unaided.",
        ],
      },
      {
        heading: 'Working memory and writing',
        paragraphs: [
          "Working memory is the mental workspace used to hold a sentence's structure, the word choices made so far, and where the sentence is going, all at once, while also handling spelling and phrasing. For a sentence of any length, that's a lot to hold simultaneously, and dyslexia often means less of that workspace is available for planning because more of it is taken up by decoding spelling as you go. In practice, this is why writing in shorter sentences, or dictating a rough version before editing, tends to work better than trying to build a long, complex sentence correctly in one pass — it reduces how much has to be held in mind at once.",
        ],
      },
      {
        heading: 'Strategies for study',
        paragraphs: [
          "If dyslexia affects studying, a few adjustments consistently help more than trying to write under the same conditions as everyone else:",
        ],
        list: [
          "Extra time in exams and coursework deadlines, arranged through your school, college or university's support services — this is a standard, recognised adjustment, not a special favour.",
          'Reading your own writing aloud, or using text-to-speech, instead of silently re-reading it — your eyes tend to skip errors your ears catch.',
          'Getting ideas down by talking them through or dictating a rough draft first, then editing as a separate pass, rather than trying to get spelling, structure and ideas right in one go.',
          "In UK higher education, the Disabled Students' Allowance (DSA) can fund specialist software, equipment and support — it's worth checking eligibility through your university's disability service even if you've never used formal support before.",
        ],
      },
      {
        heading: 'Strategies for the workplace',
        paragraphs: [
          'The same difficulties show up at work — emails, reports, meeting notes — and employers in England, Scotland and Wales have a legal duty to help: under the Equality Act 2010, they must make reasonable adjustments for employees with a disability, which dyslexia can qualify as. (Northern Ireland has its own, broadly similar disability discrimination law rather than the Equality Act 2010.) In practice that can mean extra time on written tasks, permission to use assistive software, or written instructions instead of verbal-only ones.',
          'Access to Work, a UK government grant, can fund assistive software and equipment directly for employed and self-employed adults — often at little or no cost to you or your employer. Asking HR or your manager directly, rather than working around the problem alone, is usually the more effective route.',
        ],
      },
      {
        heading: 'Where a tool like DyslexiaWrite fits in',
        paragraphs: [
          "DyslexiaWrite is built around each of these specifically: phonetic and homophone-aware spelling correction instead of generic spellcheck, text-to-speech read-back with word-level highlighting for proofreading by ear, voice dictation so typing and spelling aren't blocking you from getting ideas down, and sentence rewriting that shortens and clarifies without changing your meaning. There's a free tier with no card required, and UK employees and the self-employed may be able to get it funded through Access to Work.",
        ],
      },
    ],
    faqs: [
      {
        q: 'Does spellcheck catch dyslexic spelling mistakes?',
        a: "Only some of them. Homophones (their/there) and reversals that land on another real word (form/from, was/saw) are invisible to spellcheck since both results are correctly-spelled words — there's nothing to flag. Phonetic misspellings and other non-words (thort, becuase) are usually caught, but spellcheck can suggest the wrong fix if several real words are a similar edit-distance away.",
      },
      {
        q: 'What are the most common dyslexia spelling mistakes?',
        a: 'Four patterns cover most of them: homophones used in the wrong context, phonetic spelling (writing a word the way it sounds), letter reversals and transpositions that either land on another real word or produce a non-word, and missing or duplicated small function words in longer sentences.',
      },
      {
        q: 'Is dyslexia just bad spelling?',
        a: "No. Dyslexia affects how the brain processes phonology, working memory and sequencing — spelling is one visible symptom, not the condition itself. It has nothing to do with effort or intelligence, and the same person can be a strong thinker or communicator while finding spelling and sentence-level writing mechanics genuinely harder than most people.",
      },
      {
        q: 'Can Access to Work pay for spelling and writing software?',
        a: 'Yes. Access to Work, a UK government grant, can fund assistive writing software like DyslexiaWrite in full for employed and self-employed adults in England, Scotland and Wales.',
      },
    ],
    relatedLinks: [
      { label: 'Is DyslexiaWrite funded through Access to Work?', href: '/access-to-work' },
      { label: 'How DyslexiaWrite compares to Grammarly', href: '/vs/grammarly' },
      { label: 'How DyslexiaWrite compares to ClaroRead', href: '/vs/claroread' },
    ],
    references: [
      { label: 'British Dyslexia Association — What is dyslexia?', url: 'https://www.bdadyslexia.org.uk/dyslexia' },
      { label: 'NHS — Dyslexia in adults', url: 'https://www.nhs.uk/conditions/dyslexia-in-adults/' },
      { label: 'Equality Act 2010 (legislation.gov.uk)', url: 'https://www.legislation.gov.uk/ukpga/2010/15/contents' },
      { label: 'Disability Discrimination Act 1995 — Northern Ireland (legislation.gov.uk)', url: 'https://www.legislation.gov.uk/ukpga/1995/50/contents' },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
