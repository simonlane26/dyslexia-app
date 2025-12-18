# Real-Time Grammar & Spelling Checking

## Overview

DyslexiaWrite now includes real-time grammar and spelling checking powered by LanguageTool, with dyslexia-specific enhancements.

## Features

### 1. **Real-Time Grammar Checking**
- Automatically checks text as you write (2-second debounce)
- Uses LanguageTool public API (can be switched to self-hosted)
- Displays issues with color-coded underlines:
  - **Red wavy**: Spelling errors
  - **Blue wavy**: Grammar warnings
  - **Orange wavy** + yellow highlight: Dyslexia-relevant issues

### 2. **Dyslexia-Specific Processing**
The system includes special detection for common dyslexic writing patterns:

#### Homophone Detection
- Identifies common sound-alike word confusions
- Examples: their/there/they're, to/too/two, your/you're
- Provides simple explanations: "These sound the same but have different meanings"

#### Letter Reversal Detection
- Detects b/d, p/q, m/w, n/u confusions
- Highlights when suggestions differ by reversed letters

#### Transposition Detection
- Identifies letter-swap errors
- Examples: form/from, was/saw, no/on, left/felt

#### Simplified Error Messages
- Replaces grammar jargon with plain language
- Filters out overly complex suggestions
- Prioritizes simpler, shorter words

### 3. **User Interface**

#### Toggle Button
- Click "Grammar ON/OFF" button in the toolbar to enable/disable
- Located next to the Highlight button

#### Interactive Underlines
- Click any underlined word to see:
  - Error message (simplified)
  - Category (spelling, grammar, style, etc.)
  - Dyslexia tip (when relevant)
  - Up to 3 top suggestions

#### Quick Fix Tooltip
- Click a suggestion to apply it instantly
- "Ignore" button to dismiss the issue
- Close button (X) to dismiss tooltip

#### Status Indicators
- "Checking grammar..." appears while analyzing
- Issue count badge shows total problems found
- Position: top-right corner of editor

#### Editing Mode
- Double-click anywhere to switch to regular textarea
- Edit freely, then click away to return to grammar mode
- Grammar check re-runs automatically after changes

## How It Works

### Architecture

```
┌─────────────────┐
│   User Types    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  GrammarCheck Component         │
│  - Debounces input (2s)         │
│  - Triggers grammar check       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  LanguageTool API Client        │
│  - Sends text to LanguageTool   │
│  - Receives grammar matches     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Dyslexia Post-Processor        │
│  - Detects homophones           │
│  - Detects reversals            │
│  - Detects transpositions       │
│  - Simplifies messages          │
│  - Re-ranks suggestions         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  UI Rendering                   │
│  - Colored wavy underlines      │
│  - Orange highlights (dyslexia) │
│  - Interactive tooltips         │
└─────────────────────────────────┘
```

### Files Added

1. **src/lib/languageTool.ts**
   - LanguageTool API client
   - Type definitions
   - Grammar checking function
   - Debounce utility

2. **src/lib/dyslexiaGrammar.ts**
   - Dyslexia-specific detection
   - Homophone dictionary
   - Reversal patterns
   - Transposition detection
   - Message simplification
   - Suggestion filtering & ranking

3. **src/components/GrammarCheck.tsx**
   - Main grammar checking component
   - Underline rendering
   - Tooltip UI
   - Edit mode toggle

### Files Modified

- **src/app/(app)/page.tsx**
  - Added grammar check toggle state
  - Added grammar check toggle button
  - Integrated GrammarCheck component
  - Added `handleApplyGrammarFix` function

## Usage

### For End Users

1. Write text in the editor as normal
2. Click the **"Grammar OFF"** button to enable grammar checking
3. Grammar check runs automatically after you stop typing (2 seconds)
4. Click any underlined word to see suggestions
5. Click a suggestion to apply the fix instantly
6. Double-click anywhere to edit freely
7. Click **"Grammar ON"** to toggle off when not needed

### For Developers

#### Switch to Self-Hosted LanguageTool

Edit `src/lib/languageTool.ts`:

```typescript
// Change this line:
const url = 'https://api.languagetool.org/v2/check';

// To your Docker instance:
const url = 'http://localhost:8010/v2/check';
```

Then run LanguageTool in Docker:

```bash
docker run -d -p 8010:8010 erikvl87/languagetool
```

#### Adjust Debounce Time

Edit `src/components/GrammarCheck.tsx`:

```typescript
const performCheck = useCallback(
  debounce(async (textToCheck: string) => {
    // ...
  }, 2000), // Change from 2000ms to your preferred delay
  [enabled]
);
```

#### Add More Homophones

Edit `src/lib/dyslexiaGrammar.ts`:

```typescript
const HOMOPHONES: Record<string, string[]> = {
  their: ['there', "they're"],
  // Add your own:
  new: ['knew', 'gnu'],
  // ...
};
```

#### Customize Underline Colors

Edit `src/components/GrammarCheck.tsx`:

```typescript
const getUnderlineColor = (severity: string, isDyslexia: boolean) => {
  if (isDyslexia) return '#f59e0b'; // Orange for dyslexia
  if (severity === 'error') return '#ef4444'; // Red
  if (severity === 'warning') return '#3b82f6'; // Blue
  return '#6b7280'; // Gray
};
```

## Limitations & Future Improvements

### Current Limitations
1. LanguageTool public API has rate limits (20 requests/minute)
2. Only checks text in English (en-US by default)
3. Editing mode requires double-click (not discoverable)
4. Grammar check doesn't work with sentence highlighting mode

### Planned Improvements
1. **Rate Limiting UI**: Show warning when approaching API limits
2. **Offline Mode**: Cache common grammar rules for offline use
3. **Custom Dictionary**: Let users add words to ignore list
4. **Pro Feature**: Self-hosted LanguageTool for unlimited checks
5. **Multi-Language**: Support for other languages (Spanish, French, etc.)
6. **Accessibility**: Keyboard shortcuts for navigating issues
7. **Statistics**: Track most common errors for each user
8. **Learning Mode**: Explain grammar rules when clicked

## Performance

- **Debounce**: 2 seconds after typing stops
- **API Call**: ~500ms average response time
- **Processing**: <50ms for dyslexia post-processing
- **Total Latency**: ~2.5 seconds from last keystroke to underlines

## Privacy

- Text is sent to LanguageTool public API (https://languagetool.org)
- No text is stored on LanguageTool servers
- Consider self-hosting for sensitive documents
- See LanguageTool privacy policy: https://languagetool.org/legal/privacy

## API Costs

### Public API (Current)
- **Free**: 20 requests/minute
- **No registration required**
- Good for: Testing, low-volume use

### Self-Hosted (Recommended for Production)
- **Cost**: Free (runs on your server)
- **Setup**: Docker container (500MB RAM)
- **Unlimited**: No rate limits
- Good for: Production, high-volume use

### Premium LanguageTool API
- **Paid**: $19/month for 150,000 requests
- **Enterprise**: Custom pricing
- Good for: Commercial apps with high volume

## Testing

Try these examples to see dyslexia-specific features:

1. **Homophone confusion**:
   - Type: "Their going to the store"
   - Should suggest: "They're"
   - Dyslexia tip: "These sound the same but have different meanings"

2. **Letter reversal**:
   - Type: "The bog ran fast" (dog → bog, b/d)
   - Should detect: b/d confusion

3. **Transposition**:
   - Type: "I need to from a plan" (form → from)
   - Should suggest: "form"
   - Dyslexia tip: "These letters are commonly swapped"

4. **Spelling**:
   - Type: "The cat was runing"
   - Should suggest: "running"

## Support

For issues or questions:
- GitHub: [Your repo]
- Email: [Your email]
- Docs: This file

## License

This feature is part of DyslexiaWrite. See main LICENSE file.
