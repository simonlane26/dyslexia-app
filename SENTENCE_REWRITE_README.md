# Sentence Rewrite Feature - Implementation Guide

## Overview

The Sentence Rewrite feature allows users to select any sentence in their document and get 3 AI-powered alternative versions with one-click application. This is a **high-priority dyslexia-friendly feature** that helps users improve their writing without needing to understand grammar rules.

## How It Works

### User Flow

1. **Select text** - User highlights a sentence or phrase in the editor
2. **Click "Rewrite"** - User clicks the Rewrite button in the toolbar
3. **View alternatives** - Modal shows 3 labeled alternatives (e.g., "Simpler", "More confident", "More formal")
4. **Apply instantly** - User clicks "Apply" on their preferred alternative
5. **Text replaced** - The selected text is replaced with the new version

### Example

**Original sentence:**
```
"The implementation of the new system will potentially facilitate improved operational efficiency."
```

**Alternatives shown:**
- ✨ **Simpler**: "The new system will make operations more efficient."
- 💪 **More confident**: "The new system will improve operational efficiency."
- 👔 **More formal**: "The new system implementation will enhance operational efficiency."

## Architecture

### Files Created

1. **`src/app/api/coach/rewrite-sentence/route.ts`**
   - API endpoint for generating sentence alternatives
   - Uses OpenAI/OpenRouter with gpt-4o-mini
   - Returns 3 alternatives in structured JSON format

2. **`src/components/SentenceRewriteModal.tsx`**
   - Modal UI component for displaying alternatives
   - Shows loading, error, and success states
   - Handles "Apply" button clicks

### Files Modified

1. **`src/app/(app)/page.tsx`**
   - Added "Rewrite" button to toolbar
   - Added text selection detection
   - Added state management for modal
   - Added ref to textarea for selection API

## Technical Details

### API Endpoint

**URL:** `/api/coach/rewrite-sentence`

**Method:** `POST`

**Request Body:**
```json
{
  "sentence": "The selected sentence to rewrite",
  "intent": {
    "audience": "friend" | "teacher" | "boss" | "general",
    "purpose": "inform" | "persuade" | "explain" | "story",
    "tone": "casual" | "neutral" | "formal"
  }
}
```

**Response:**
```json
{
  "alternatives": [
    {
      "label": "Simpler",
      "icon": "✨",
      "text": "The rewritten sentence",
      "explanation": "Brief reason why this version is better"
    },
    {
      "label": "More confident",
      "icon": "💪",
      "text": "Another rewritten sentence",
      "explanation": "Another brief explanation"
    },
    {
      "label": "Clearer",
      "icon": "💡",
      "text": "Yet another rewritten sentence",
      "explanation": "Yet another brief explanation"
    }
  ]
}
```

### Label Types

The AI can choose from these label types:
- **Simpler** ✨ - Uses easier words, shorter structure
- **More confident** 💪 - Removes hedging words (maybe, might, sort of)
- **More formal** 👔 - Professional language
- **Clearer** 💡 - Makes the meaning more obvious
- **Shorter** ⚡ - Cuts unnecessary words

### Intent-Aware Rewriting

The rewrite API respects the user's writing intent (if previously set via CoachIntentModal):
- Writing for a **friend** → casual, warm alternatives
- Writing for a **teacher** → clear, organized alternatives
- Writing for a **boss** → professional, direct alternatives
- Writing for **anyone** → easy-to-understand alternatives

## Integration Points

### Toolbar Button

Located in: `src/app/(app)/page.tsx:1326-1334`

```tsx
<ModernButton
  variant="secondary"
  onClick={handleRewriteSentence}
  size="sm"
  title="Select text and click to rewrite it"
>
  <Edit3 size={16} />
  Rewrite
</ModernButton>
```

### Selection Detection

Located in: `src/app/(app)/page.tsx:946-969`

```tsx
const handleRewriteSentence = () => {
  if (!textareaRef.current) return;

  const textarea = textareaRef.current;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // If no selection, show toast
  if (start === end) {
    toast.info('Select a sentence first to rewrite it!');
    return;
  }

  const selected = text.substring(start, end).trim();
  setSelectedSentence(selected);
  setSelectedRange({ start, end });
  setShowRewriteModal(true);
};
```

### Text Replacement

Located in: `src/app/(app)/page.tsx:971-984`

```tsx
const handleApplyRewrite = (newSentence: string) => {
  if (!selectedRange) return;

  const before = text.substring(0, selectedRange.start);
  const after = text.substring(selectedRange.end);
  const newText = before + newSentence + after;
  setText(newText);
  toast.success('Applied rewrite!');

  // Clear selection
  setSelectedRange(null);
  setSelectedSentence('');
};
```

## State Management

### New State Variables

```tsx
// Sentence rewriting
const [showRewriteModal, setShowRewriteModal] = useState(false);
const [selectedSentence, setSelectedSentence] = useState('');
const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
const [currentIntentForRewrite, setCurrentIntentForRewrite] = useState<CoachIntent | null>(null);
const textareaRef = useRef<HTMLTextAreaElement>(null);
```

### State Flow

```
User selects text
    ↓
User clicks "Rewrite" button
    ↓
handleRewriteSentence() called
    ↓
selectedSentence & selectedRange stored
    ↓
showRewriteModal set to true
    ↓
SentenceRewriteModal opens
    ↓
Modal fetches alternatives from API
    ↓
User clicks "Apply" on an alternative
    ↓
handleApplyRewrite() called
    ↓
Text replaced, modal closed
```

## UI/UX Features

### Modal Design

- **Loading state** - Shows spinner while generating alternatives
- **Error state** - Shows error message with "Try Again" button
- **Success state** - Shows 3 alternatives with Apply buttons
- **Applied state** - Shows green checkmark when user applies an alternative
- **Auto-close** - Modal closes 800ms after applying (so user sees checkmark)

### Accessibility

- Dark mode support
- Theme-aware colors
- Keyboard accessible (Escape to close)
- Clear visual feedback
- Tooltip on Rewrite button

### Mobile-Friendly

- Responsive modal width
- Touch-friendly button sizes
- Scrollable content area
- Proper viewport handling

## Dyslexia-Friendly Design

### Plain Language Labels

Instead of:
- ❌ "Active voice" (grammar jargon)
- ❌ "Reduce complexity" (abstract)
- ❌ "Improve conciseness" (technical)

We use:
- ✅ "Simpler" (concrete)
- ✅ "More confident" (actionable)
- ✅ "Clearer" (understandable)

### Visual Icons

Each alternative has an emoji icon:
- ✨ Simpler
- 💪 More confident
- 👔 More formal
- 💡 Clearer
- ⚡ Shorter

### One-Click Application

No need to:
- Copy/paste text
- Manually edit
- Remember the suggestion

Just click "Apply" and it's done!

### Encouraging Explanations

Each alternative includes a brief explanation:
- "This version uses everyday words"
- "This sounds more certain and direct"
- "This cuts out extra words"

## Testing Checklist

- [x] API endpoint returns valid JSON
- [x] API handles missing sentence gracefully
- [x] API respects intent context
- [x] Modal opens when clicking Rewrite button
- [x] Modal shows toast if no text selected
- [x] Modal fetches alternatives on open
- [x] Modal shows loading spinner
- [x] Modal displays 3 alternatives
- [x] Apply button replaces text correctly
- [x] Modal shows checkmark after applying
- [x] Modal closes after short delay
- [x] Text selection range is preserved
- [x] Dark mode styling works
- [x] Mobile layout is responsive
- [x] Keyboard shortcuts work (Escape to close)

## Performance Considerations

### API Response Time

- Average: ~2-3 seconds
- Uses gpt-4o-mini (fast & cheap)
- Shows loading spinner during generation
- Timeout: 25 seconds

### Caching

Currently no caching, but could add:
- Cache recent rewrites in localStorage
- Cache by sentence hash
- Cache for 1 hour

### Rate Limiting

Currently no rate limiting, but should add:
- Free users: 10 rewrites/day
- Pro users: Unlimited rewrites
- Track count in localStorage or database

## Future Enhancements

### Priority 1: Multiple Selection Modes

Allow users to:
- Select entire paragraph
- Select multiple sentences
- Auto-select sentence under cursor (double-click)

### Priority 2: Compare Side-by-Side

Show before/after comparison:
```
Original:     "The implementation will facilitate..."
Rewritten:    "The new system will make..."
              ↑ 5 words shorter, easier to read
```

### Priority 3: Rewrite History

Track and display:
- Recent rewrites
- Most-used alternative types
- Writing improvement over time

### Priority 4: Custom Labels

Let users add custom rewrite goals:
- "More friendly"
- "More technical"
- "More persuasive"
- "More concise"

### Priority 5: Batch Rewriting

Allow users to:
- Select all long sentences
- Rewrite all at once
- Review and apply selectively

## Integration with Other Features

### Works With Grammar Check

User can:
1. Enable Grammar Check to see underlined issues
2. Click underlined text to select it
3. Click Rewrite button
4. Choose from alternatives

### Works With Writing Coach

User can:
1. Get tips from Writing Coach
2. Select suggested sentence
3. Click Rewrite button
4. See alternatives that match the tip's intent

### Works With Intent Modal

User can:
1. Set writing intent (audience/purpose/tone)
2. Select sentence
3. Click Rewrite
4. Get alternatives tailored to intent

## Error Handling

### No Selection

```
User clicks Rewrite with no selection
→ Toast: "Select a sentence first to rewrite it!"
```

### API Error

```
API returns error
→ Modal shows: "Could not generate alternatives"
→ Shows "Try Again" button
```

### Network Error

```
Network request fails
→ Modal shows: "Network error. Please check your connection."
→ Shows "Try Again" button
```

### Empty Response

```
API returns empty alternatives array
→ Modal shows: "No alternatives returned. Please try again."
```

## Security Considerations

### Input Validation

- Sentence length: Max 500 characters
- Strip HTML/script tags
- Sanitize user input before API call

### API Key Protection

- Keys stored in .env.local (server-side only)
- Never exposed to client
- Uses server-side route handler

### Rate Limiting

Should add:
- Per-user rate limits
- IP-based rate limits for anonymous users
- Throttling for repeated requests

## Deployment Notes

### Environment Variables

Required:
```bash
OPENAI_API_KEY=sk-...
# OR
OPENROUTER_API_KEY=sk-or-...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Build Process

No special steps required:
```bash
npm run build
npm start
```

### Vercel Deployment

Works out of the box:
- API routes automatically deployed
- Environment variables set in dashboard
- No additional configuration needed

## Troubleshooting

### Modal doesn't open

**Check:**
- Is text selected?
- Is textareaRef properly attached?
- Are there console errors?

**Fix:**
- Ensure textarea has ref={textareaRef}
- Check browser console for errors

### API returns error

**Check:**
- Are API keys set in .env.local?
- Did you restart dev server after adding keys?
- Is NEXT_PUBLIC_SITE_URL set (for OpenRouter)?

**Fix:**
- Add keys to .env.local
- Run `npm run dev` again

### Alternatives don't apply

**Check:**
- Is selectedRange stored correctly?
- Does handleApplyRewrite run?
- Are there console errors?

**Fix:**
- Verify selectedRange in React DevTools
- Add console.log to debug

### Styling looks broken

**Check:**
- Is theme object passed correctly?
- Is darkMode boolean passed?

**Fix:**
- Check parent component props
- Verify theme structure

## Competitive Advantages

### vs. Grammarly

- **Grammarly**: Shows one suggestion at a time, uses grammar jargon
- **DyslexiaWrite**: Shows 3 labeled alternatives, plain language

### vs. ChatGPT

- **ChatGPT**: Requires copy/paste, full context switch
- **DyslexiaWrite**: Inline rewriting, stays in flow

### vs. Microsoft Word

- **Word**: Basic synonym suggestions only
- **DyslexiaWrite**: Full sentence rewrites with intent awareness

## Key Metrics to Track

1. **Usage Rate**: How many users use the Rewrite feature?
2. **Application Rate**: What % of shown alternatives are applied?
3. **Preferred Labels**: Which labels are most popular? (Simpler, Clearer, etc.)
4. **Time to Apply**: How long from opening modal to applying?
5. **Error Rate**: How often do API calls fail?

## Success Criteria

- ✅ 60%+ of active users try the Rewrite feature
- ✅ 80%+ of rewrites are applied (not dismissed)
- ✅ Average API response time < 3 seconds
- ✅ Error rate < 5%
- ✅ Positive user feedback on usability

---

**Last Updated:** December 2024
**Status:** ✅ Fully Implemented
**Next Steps:** User testing and feedback collection
