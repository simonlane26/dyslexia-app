export type UserType = 'adult' | 'young' | 'parent';
export type RiskLevel = 'low' | 'moderate' | 'high';

export interface ScreenerQuestion {
  domain: string;
  text: string;
  help: string;
}

export interface DomainResult {
  name: string;
  score: number;
  max: number;
  pct: number;
}

export interface ScreenerResult {
  totalScore: number;
  maxScore: number;
  pct: number;
  level: RiskLevel;
  domains: DomainResult[];
}

export const SCALE_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: 'Rarely', value: 1 },
  { label: 'Sometimes', value: 2 },
  { label: 'Often', value: 3 },
  { label: 'Always', value: 4 },
] as const;

export const SCREENER_QUESTIONS: ScreenerQuestion[] = [
  // Domain 1: Reading and Writing
  {
    domain: 'Reading and writing',
    text: 'Do you find reading slow or tiring, even when the subject interests you?',
    help: 'This includes any kind of reading — books, emails, web pages, or text messages. Think about whether reading feels like more effort for you than it seems to be for others.',
  },
  {
    domain: 'Reading and writing',
    text: "Do you often re-read sentences or paragraphs because the meaning didn't stick the first time?",
    help: "This is about comprehension, not speed. You might read the words correctly but realise at the end of a paragraph that you can't remember what it said.",
  },
  {
    domain: 'Reading and writing',
    text: "Do you struggle with spelling, particularly words you've seen many times before?",
    help: "Common patterns include mixing up similar-sounding words (their/there/they're), phonetic spelling (becuase, definately), or forgetting how to spell words you've used hundreds of times.",
  },
  {
    domain: 'Reading and writing',
    text: 'Does writing take you much longer than you feel it should?',
    help: "Think about everyday writing — emails, messages, filling in forms. Do you spend much more time than other people seem to? Do you ask others to check your writing?",
  },

  // Domain 2: Sound Processing
  {
    domain: 'Sound processing',
    text: "Do you find it hard to think of the right word when speaking, even when you know what you mean?",
    help: "This is sometimes called 'tip of the tongue' — you know the concept but the word won't come. You might say 'that thing' or 'you know what I mean' frequently.",
  },
  {
    domain: 'Sound processing',
    text: 'Do you mix up similar-sounding words or get them in the wrong order?',
    help: "For example, saying 'pacific' instead of 'specific', or 'aminal' instead of 'animal'. This also includes mixing up the order of sounds in longer words.",
  },
  {
    domain: 'Sound processing',
    text: 'Do you find it difficult to follow spoken instructions with several steps?',
    help: "For example, if someone says 'Go to the kitchen, get the red bowl from the top shelf, fill it with water, and bring it here' — do you need them to repeat it or break it down?",
  },
  {
    domain: 'Sound processing',
    text: 'Do you find it hard to learn the words to songs, or to remember names of people and places?',
    help: 'This is about verbal memory — how well your brain holds onto words and names. You might meet someone, hear their name clearly, and forget it within minutes.',
  },

  // Domain 3: Memory and Concentration
  {
    domain: 'Memory and concentration',
    text: 'Do you forget things you were told just minutes ago?',
    help: "This isn't about forgetting where you left your keys last week — it's about short-term verbal memory. Someone tells you a phone number or a meeting time, and it slips away almost immediately.",
  },
  {
    domain: 'Memory and concentration',
    text: 'Do you lose your place when reading, or skip lines without noticing?',
    help: "Your eyes might jump to the wrong line, or you might reach the end of a page and realise you've been reading the same paragraph twice. This is very common in dyslexia.",
  },
  {
    domain: 'Memory and concentration',
    text: "Do you find it hard to concentrate on reading when there's background noise?",
    help: 'Some people can read in a noisy café. Others need complete silence because any background sound makes it impossible to process the text. Think about where you fall on that scale.',
  },
  {
    domain: 'Memory and concentration',
    text: 'Do you struggle to take notes while listening to someone speak?',
    help: 'This is about doing two verbal tasks at once — listening and writing. Many dyslexic people find this extremely difficult because both tasks compete for the same working memory resources.',
  },

  // Domain 4: Organisation and Daily Life
  {
    domain: 'Organisation and daily life',
    text: 'Do you confuse left and right, or struggle with directions?',
    help: 'This might show up as needing to think carefully about which is left and which is right, struggling with map reading, or finding navigation directions hard to follow.',
  },
  {
    domain: 'Organisation and daily life',
    text: 'Do you find forms, timetables, and spreadsheets confusing or overwhelming?',
    help: 'Structured documents with rows and columns can be difficult if your visual processing works differently. You might fill in the wrong box, misread a timetable, or avoid spreadsheets entirely.',
  },
  {
    domain: 'Organisation and daily life',
    text: 'Do you find it hard to organise your thoughts into a logical written order?',
    help: "You might know what you want to say but struggle to structure it. Ideas come out jumbled, or you write the same point twice, or the order doesn't flow logically.",
  },
  {
    domain: 'Organisation and daily life',
    text: "Do you often misread numbers, dates, or similar-looking words?",
    help: "For example, reading 1396 as 1369, confusing June and July, or misreading 'trail' as 'trial'. These visual processing slips are common in dyslexia.",
  },

  // Domain 5: Personal History
  {
    domain: 'Personal history',
    text: 'Did you struggle with reading or writing at school, compared to your classmates?',
    help: 'Think back to primary and secondary school. Were you in the lower reading group? Did teachers comment on your spelling? Did you avoid reading aloud in class?',
  },
  {
    domain: 'Personal history',
    text: 'Does anyone in your family have dyslexia, or struggle significantly with reading and writing?',
    help: "Dyslexia has a strong genetic component. If a parent, sibling, aunt, uncle, or grandparent has dyslexia — or struggled with reading and writing even without a formal diagnosis — that's relevant.",
  },
  {
    domain: 'Personal history',
    text: 'Do you feel anxious or frustrated when you have to read or write under time pressure?',
    help: 'Think about exams, timed forms, reading menus when others are waiting, or being asked to spell something in front of people. Does it trigger anxiety beyond normal nervousness?',
  },
  {
    domain: 'Personal history',
    text: "Do you feel your reading and writing ability doesn't reflect your overall intelligence?",
    help: "Many dyslexic people are highly capable in conversation, problem-solving, and creative thinking — but feel held back by written communication. There's a gap between what they know and what they can put on paper.",
  },
];

export const DOMAINS = [
  { name: 'Reading and writing', start: 0, end: 3 },
  { name: 'Sound processing', start: 4, end: 7 },
  { name: 'Memory and concentration', start: 8, end: 11 },
  { name: 'Organisation', start: 12, end: 15 },
  { name: 'Personal history', start: 16, end: 19 },
] as const;

export function calculateResults(answers: number[]): ScreenerResult {
  const maxPerDomain = 16;
  const maxScore = 80;

  const domains: DomainResult[] = DOMAINS.map((d) => {
    let score = 0;
    for (let i = d.start; i <= d.end; i++) {
      score += answers[i] >= 0 ? answers[i] : 0;
    }
    const pct = Math.round((score / maxPerDomain) * 100);
    return { name: d.name, score, max: maxPerDomain, pct };
  });

  const totalScore = domains.reduce((sum, d) => sum + d.score, 0);
  const pct = Math.round((totalScore / maxScore) * 100);

  let level: RiskLevel = 'low';
  if (pct >= 60) level = 'high';
  else if (pct >= 30) level = 'moderate';

  return { totalScore, maxScore, pct, level, domains };
}
