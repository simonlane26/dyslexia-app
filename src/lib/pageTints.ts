// Page background tint options for the writing surface.
//
// Deliberately a small, considered set rather than a free colour picker —
// these track the tints Irlen Syndrome overlay research and dyslexia
// accessibility guidance converge on as actually helpful, plus plain white
// as the neutral default. All six are free; a tinted background is a core
// accessibility affordance, not a Pro upsell.
export interface PageTint {
  name: string;
  value: string;
}

export const PAGE_TINTS: PageTint[] = [
  { name: 'White', value: '#ffffff' },
  { name: 'Pale gray', value: '#f0f0f0' },
  { name: 'Pale cream', value: '#f9f7ed' },
  { name: 'Pale blue', value: '#eef4ff' },
  { name: 'Pale green', value: '#ecfdf5' },
  { name: 'Pale rose', value: '#fff0f5' },
];

export const DEFAULT_PAGE_TINT = '#ffffff';
