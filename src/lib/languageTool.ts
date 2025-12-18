// LanguageTool API client for grammar and spelling checking

export interface LanguageToolMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: Array<{ value: string }>;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
  type: {
    typeName: string;
  };
}

export interface LanguageToolResponse {
  matches: LanguageToolMatch[];
  language: {
    name: string;
    code: string;
  };
}

export interface GrammarIssue {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  suggestions: string[];
  ruleId: string;
  issueType: string;
  category: string;
  severity: 'error' | 'warning' | 'info';
  isDyslexiaRelevant: boolean;
  dyslexiaHint?: string;
  beforeText?: string;
  affectedText: string;
}

/**
 * Check text for grammar and spelling issues using LanguageTool API
 */
export async function checkGrammar(
  text: string,
  language: string = 'en-US'
): Promise<GrammarIssue[]> {
  if (!text.trim()) {
    return [];
  }

  try {
    // Use public LanguageTool API (you can switch to self-hosted later)
    const url = 'https://api.languagetool.org/v2/check';

    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('language', language);
    formData.append('enabledOnly', 'false');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('LanguageTool API error:', response.status, response.statusText);
      throw new Error(`LanguageTool API error: ${response.status}`);
    }

    const data: LanguageToolResponse = await response.json();

    // Convert to our format and apply dyslexia-specific processing
    const issues = data.matches.map((match) => convertToGrammarIssue(match));

    return issues;
  } catch (error) {
    console.error('Grammar check failed:', error);
    return [];
  }
}

/**
 * Convert LanguageTool match to our GrammarIssue format
 */
function convertToGrammarIssue(match: LanguageToolMatch): GrammarIssue {
  const suggestions = match.replacements
    .slice(0, 5) // Limit to top 5 suggestions
    .map((r) => r.value);

  // Determine severity
  let severity: 'error' | 'warning' | 'info' = 'warning';
  if (match.rule.issueType === 'misspelling') {
    severity = 'error';
  } else if (match.rule.issueType === 'typographical' || match.rule.issueType === 'grammar') {
    severity = 'warning';
  } else {
    severity = 'info';
  }

  const affectedText = match.context.text.substring(
    match.context.offset,
    match.context.offset + match.context.length
  );

  return {
    message: match.message,
    shortMessage: match.shortMessage || match.message,
    offset: match.offset,
    length: match.length,
    suggestions,
    ruleId: match.rule.id,
    issueType: match.rule.issueType,
    category: match.rule.category.name,
    severity,
    isDyslexiaRelevant: false, // Will be set by dyslexia processor
    affectedText,
  };
}

/**
 * Debounce function for grammar checking
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
