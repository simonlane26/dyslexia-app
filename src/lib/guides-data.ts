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
  description: string;
  publishedAt: string; // ISO date
  readingTime: string;
  sections: GuideSection[];
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
    title: 'Common Dyslexia Writing Mistakes Spellcheckers Miss',
    description:
      "Why standard spellcheck misses so many dyslexic writing errors, and the specific patterns — homophones, phonetic spelling, letter reversals — it's worth checking for by hand.",
    publishedAt: '2026-09-29',
    readingTime: '5 min read',
    sections: [
      {
        paragraphs: [
          "Standard spellcheckers are built around one assumption: that a misspelled word will look visually close to the correct one — a swapped letter, a missing character. Most dyslexic writing errors don't work that way, which is why a document can sail through spellcheck with no red underlines and still contain several real mistakes.",
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
        heading: 'Why this matters for choosing a tool',
        paragraphs: [
          "If a writing tool's grammar and spelling check is built on the same generic assumptions as a basic spellchecker — flagging what's visually close to a dictionary word — it will miss most of the above by design, not by accident. DyslexiaWrite's correction is built specifically around these patterns: homophones in context, phonetic matching, and plain-language explanations of what changed and why, rather than grammar jargon.",
        ],
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
