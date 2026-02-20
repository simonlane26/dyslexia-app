export interface CopyMap {
  aiCoachLabel: string;
  aiCoachButton: string;
  simplifyLabel: string;
  simplifyPanelLabel: string;
  grammarLabel: string;
  accessibilityLabel: string;
  grammarIssueLabel: string;
  grammarSuggestionCta: string;
  coachBadgeHigh: string;
  coachBadgeMedium: string;
}

export const DEFAULT_COPY: CopyMap = {
  aiCoachLabel: 'AI Writing Coach',
  aiCoachButton: 'Writing Coach',
  simplifyLabel: 'Simplify',
  simplifyPanelLabel: 'Simplified Text',
  grammarLabel: 'Grammar',
  accessibilityLabel: 'Advanced accessibility tools',
  grammarIssueLabel: 'issue',
  grammarSuggestionCta: 'Apply fix',
  coachBadgeHigh: 'Quick win',
  coachBadgeMedium: 'Worth trying',
};

export const SCHOOL_COPY: CopyMap = {
  aiCoachLabel: 'Writing Helper',
  aiCoachButton: 'Writing Helper',
  simplifyLabel: 'Make Simpler',
  simplifyPanelLabel: 'Easier Version',
  grammarLabel: 'Writing Tips',
  accessibilityLabel: 'Reading helpers',
  grammarIssueLabel: 'tip',
  grammarSuggestionCta: 'Use this',
  coachBadgeHigh: 'Try this!',
  coachBadgeMedium: 'Good idea',
};

export function getCopy(isSchoolMode: boolean): CopyMap {
  return isSchoolMode ? SCHOOL_COPY : DEFAULT_COPY;
}
