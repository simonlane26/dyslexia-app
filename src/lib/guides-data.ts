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
  sections: GuideSection[];
  references?: { label: string; url: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-write-with-dyslexia',
    title: 'How to Write With Dyslexia: Practical Tips and Tools',
    description:
      'Practical, non-clinical strategies for writing with dyslexia — getting ideas down without self-editing, proofreading methods that actually work, and what tools help most.',
    publishedAt: '2026-09-29',
    readingTime: '6 min read',
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
    title: 'Best Fonts and Text Formatting for Dyslexia',
    description:
      'What actually helps with dyslexia-friendly formatting — font choice, spacing, size, and contrast — including what the evidence on "dyslexia fonts" like OpenDyslexic really shows.',
    publishedAt: '2026-09-29',
    readingTime: '5 min read',
    sections: [
      {
        paragraphs: [
          "There's a lot of confident-sounding advice online about the single best font for dyslexia. The honest picture is more mixed: formatting choices genuinely help, but the research on dedicated \"dyslexia fonts\" specifically is weaker than most people assume, and what helps varies from person to person. Here's what's actually well-supported, and where the evidence runs out.",
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
          "This has some of the strongest evidence behind it. Extra space between lines (1.5x line height or more) and slightly increased letter spacing reduces visual crowding — where nearby letters and lines interfere with each other as the eye tracks across text. This is often a bigger practical improvement than font choice alone.",
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
          "OpenDyslexic and similar fonts weight the bottom of each letter to try to prevent letters being read upside down or flipped. It's a reasonable idea, but the research evidence is genuinely mixed — several controlled studies have found no reading-speed or accuracy benefit over a standard sans-serif font once spacing is controlled for, while some readers report a strong personal preference for it anyway. The honest takeaway: it's worth trying since it's low-cost and some people do prefer it, but treat it as a personal preference to test, not a guaranteed fix — spacing, size, and contrast matter more consistently across the research.",
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
  },
  {
    slug: 'dyslexia-writing-mistakes-spellcheckers-miss',
    title: "Dyslexia Writing: Why It's Hard and What Actually Helps",
    h1: 'Dyslexia Writing: The Mistakes, the Causes and What Helps',
    description:
      'Dyslexia writing explained: why spelling, homophones and sentences go wrong, what helps at work and study, and which tools earn their place.',
    publishedAt: '2026-09-29',
    updatedAt: '2026-10-19',
    readingTime: '8 min read',
    author: { name: 'Simon Lane', title: 'Founder, DyslexiaWrite' },
    sections: [
      {
        paragraphs: [
          "Dyslexia writing is hard for reasons that have nothing to do with effort or intelligence. The difficulty sits in how the brain processes phonology (the sounds within words), working memory (holding information in mind while using it), and sequencing — not in understanding or forming ideas. The British Dyslexia Association describes dyslexia as primarily affecting accurate and fluent word reading and spelling, with phonological processing, verbal memory and processing speed commonly affected alongside it. For writing specifically, that shows up in several distinct ways: how words sound versus how they're conventionally spelled, how a sentence's structure gets held in mind while it's being built, and — for handwriting — how letters get physically formed on the page.",
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
        heading: 'Spelling: the mistakes spellcheckers miss',
        paragraphs: [
          "Spelling is the part of dyslexic writing most people already associate with the condition — but even here, the specific patterns are often missed by standard spellcheckers, which are built around one assumption: that a misspelled word will look visually close to the correct one. Most dyslexic spelling errors don't work that way, which is why a document can sail through spellcheck with no red underlines and still contain several real mistakes.",
        ],
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
          "Writing a word the way it sounds rather than how it's conventionally spelled — 'becuase', 'thort', 'recieve' — is common with dyslexia because English spelling is often inconsistent with pronunciation. Basic spellcheck usually catches these since they're visually distant from the correct spelling, but it can suggest the wrong correction if several real words are a similar edit-distance away, so it's still worth a second look rather than trusting the first suggestion.",
        ],
      },
      {
        heading: 'Letter reversals and transpositions',
        paragraphs: [
          "Reversing similar-looking letters (b/d, p/q) or swapping the order of letters within a word ('form' instead of 'from', 'was' instead of 'saw') produces a different real word in many cases — which, like homophones, spellcheck has no reason to flag since the result is correctly spelled. These are worth specifically watching for when proofreading short, common words rather than assuming spellcheck has them covered.",
        ],
      },
      {
        heading: 'Missing or duplicated small words',
        paragraphs: [
          "Small function words — a, the, of, to, is — are easy to drop or double up while writing, especially in longer sentences where working memory is doing more of the load-bearing. Because the sentence often still parses without them, or reads slightly awkwardly rather than being obviously wrong, this is one of the errors reading text aloud catches far more reliably than reading it silently.",
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
          'The same difficulties show up at work — emails, reports, meeting notes — and UK employers have a legal duty to help. Under the Equality Act 2010, employers must make reasonable adjustments for employees with a disability, which dyslexia can qualify as. In practice that can mean extra time on written tasks, permission to use assistive software, or written instructions instead of verbal-only ones.',
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
    references: [
      { label: 'British Dyslexia Association — What is dyslexia?', url: 'https://www.bdadyslexia.org.uk/dyslexia' },
      { label: 'NHS — Dyslexia in adults', url: 'https://www.nhs.uk/conditions/dyslexia-in-adults/' },
      { label: 'Equality Act 2010 (legislation.gov.uk)', url: 'https://www.legislation.gov.uk/ukpga/2010/15/contents' },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
