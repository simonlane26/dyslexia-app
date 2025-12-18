// Dyslexia-specific grammar processing layer

import { GrammarIssue } from './languageTool';

/**
 * Common homophone confusions that dyslexic writers face
 */
const HOMOPHONES: Record<string, string[]> = {
  their: ['there', "they're"],
  there: ['their', "they're"],
  "they're": ['their', 'there'],
  to: ['too', 'two'],
  too: ['to', 'two'],
  two: ['to', 'too'],
  your: ["you're"],
  "you're": ['your'],
  its: ["it's"],
  "it's": ['its'],
  were: ["we're", 'where'],
  "we're": ['were', 'where'],
  where: ['were', "we're"],
  then: ['than'],
  than: ['then'],
  accept: ['except'],
  except: ['accept'],
  affect: ['effect'],
  effect: ['affect'],
  lose: ['loose'],
  loose: ['lose'],
  hear: ['here'],
  here: ['hear'],
  know: ['no', 'now'],
  no: ['know'],
  write: ['right'],
  right: ['write'],
  past: ['passed'],
  passed: ['past'],
};

/**
 * Common letter reversal patterns
 */
const REVERSAL_PATTERNS = [
  { letters: ['b', 'd'], name: 'b/d confusion' },
  { letters: ['p', 'q'], name: 'p/q confusion' },
  { letters: ['m', 'w'], name: 'm/w confusion' },
  { letters: ['n', 'u'], name: 'n/u confusion' },
];

/**
 * Common transposition patterns (letter swaps)
 */
const TRANSPOSITION_WORDS: Record<string, string> = {
  form: 'from',
  from: 'form',
  was: 'saw',
  saw: 'was',
  no: 'on',
  on: 'no',
  left: 'felt',
  felt: 'left',
};

/**
 * Process grammar issues with dyslexia-specific enhancements
 */
export function processDyslexiaIssues(issues: GrammarIssue[]): GrammarIssue[] {
  return issues.map((issue) => {
    const enhanced = { ...issue };

    // Check for homophone confusion
    const homophoneHint = detectHomophone(issue.affectedText, issue.suggestions);
    if (homophoneHint) {
      enhanced.isDyslexiaRelevant = true;
      enhanced.dyslexiaHint = homophoneHint;
      // Re-rank suggestions to prioritize homophones
      enhanced.suggestions = rankHomophoneSuggestions(
        issue.affectedText,
        issue.suggestions
      );
    }

    // Check for letter reversals
    const reversalHint = detectReversal(issue.affectedText, issue.suggestions);
    if (reversalHint) {
      enhanced.isDyslexiaRelevant = true;
      enhanced.dyslexiaHint = reversalHint;
    }

    // Check for transpositions
    const transpositionHint = detectTransposition(issue.affectedText, issue.suggestions);
    if (transpositionHint) {
      enhanced.isDyslexiaRelevant = true;
      enhanced.dyslexiaHint = transpositionHint;
    }

    // Simplify the error message for clarity
    enhanced.message = simplifyErrorMessage(issue.message);

    // Filter out overly complex suggestions
    enhanced.suggestions = filterComplexSuggestions(issue.suggestions);

    return enhanced;
  });
}

/**
 * Detect homophone confusion
 */
function detectHomophone(word: string, suggestions: string[]): string | undefined {
  const lowerWord = word.toLowerCase();

  // Check if any suggestion is a homophone of the word
  for (const suggestion of suggestions) {
    const lowerSuggestion = suggestion.toLowerCase();

    if (HOMOPHONES[lowerWord]?.includes(lowerSuggestion)) {
      return `💡 Tip: "${lowerWord}" and "${lowerSuggestion}" sound the same but have different meanings.`;
    }

    if (HOMOPHONES[lowerSuggestion]?.includes(lowerWord)) {
      return `💡 Tip: "${lowerWord}" and "${lowerSuggestion}" sound the same but have different meanings.`;
    }
  }

  return undefined;
}

/**
 * Detect letter reversal patterns
 */
function detectReversal(word: string, suggestions: string[]): string | undefined {
  const lowerWord = word.toLowerCase();

  for (const suggestion of suggestions) {
    const lowerSuggestion = suggestion.toLowerCase();

    // Check if the difference is just a letter reversal
    for (const pattern of REVERSAL_PATTERNS) {
      const [letter1, letter2] = pattern.letters;

      if (
        lowerWord.replace(new RegExp(letter1, 'g'), letter2) === lowerSuggestion ||
        lowerWord.replace(new RegExp(letter2, 'g'), letter1) === lowerSuggestion
      ) {
        return `💡 Tip: Watch out for ${pattern.name} - these letters can look similar.`;
      }
    }
  }

  return undefined;
}

/**
 * Detect letter transpositions
 */
function detectTransposition(word: string, suggestions: string[]): string | undefined {
  const lowerWord = word.toLowerCase();

  // Check known transposition pairs
  if (TRANSPOSITION_WORDS[lowerWord]) {
    const expectedWord = TRANSPOSITION_WORDS[lowerWord];
    if (suggestions.some((s) => s.toLowerCase() === expectedWord)) {
      return `💡 Tip: "${lowerWord}" and "${expectedWord}" are commonly swapped.`;
    }
  }

  // Check if any suggestion is a transposition of the word
  for (const suggestion of suggestions) {
    if (isTransposition(lowerWord, suggestion.toLowerCase())) {
      return `💡 Tip: The letters in "${lowerWord}" might be in the wrong order.`;
    }
  }

  return undefined;
}

/**
 * Check if two words are transpositions of each other
 */
function isTransposition(word1: string, word2: string): boolean {
  if (word1.length !== word2.length || word1.length < 3) return false;

  let diffCount = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      diffCount++;
    }
  }

  // Allow 2 differences (one transposition)
  return diffCount === 2 && word1.split('').sort().join('') === word2.split('').sort().join('');
}

/**
 * Rank suggestions to prioritize homophones
 */
function rankHomophoneSuggestions(word: string, suggestions: string[]): string[] {
  const lowerWord = word.toLowerCase();
  const homophones = HOMOPHONES[lowerWord] || [];

  // Sort: homophones first, then others
  return [...suggestions].sort((a, b) => {
    const aIsHomophone = homophones.includes(a.toLowerCase());
    const bIsHomophone = homophones.includes(b.toLowerCase());

    if (aIsHomophone && !bIsHomophone) return -1;
    if (!aIsHomophone && bIsHomophone) return 1;
    return 0;
  });
}

/**
 * Simplify error messages to be more accessible
 */
function simplifyErrorMessage(message: string): string {
  // Replace grammar jargon with simpler terms
  const simplifications: Record<string, string> = {
    'possible spelling mistake': 'spelling',
    'possible typo': 'typo',
    'incorrect verb form': 'verb form',
    'wrong word': 'word choice',
    'redundant phrase': 'repetition',
    'incorrect preposition': 'preposition',
    'missing punctuation': 'punctuation',
  };

  let simplified = message;
  for (const [complex, simple] of Object.entries(simplifications)) {
    simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
  }

  return simplified;
}

/**
 * Filter out overly complex suggestions
 */
function filterComplexSuggestions(suggestions: string[]): string[] {
  // Remove suggestions that are too long or complex
  return suggestions.filter((suggestion) => {
    // Keep suggestions under 30 characters
    if (suggestion.length > 30) return false;

    // Remove suggestions with too many syllables (rough estimate)
    const syllables = suggestion.split(/[aeiou]/i).length - 1;
    if (syllables > 4) return false;

    return true;
  });
}

/**
 * Calculate readability level of a word (rough estimate)
 */
export function getWordComplexity(word: string): 'simple' | 'medium' | 'complex' {
  const length = word.length;
  const syllables = word.split(/[aeiou]/i).length - 1;

  if (length <= 5 && syllables <= 2) return 'simple';
  if (length <= 10 && syllables <= 3) return 'medium';
  return 'complex';
}
