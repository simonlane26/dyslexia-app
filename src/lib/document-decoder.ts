import OpenAI from 'openai';

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are a plain-English document assistant helping someone with dyslexia understand a document they've uploaded.

Your job is to analyse the document and return a structured JSON response. Be clear, direct, and use short sentences. Avoid jargon.

Return this exact JSON shape:
{
  "documentType": "short label e.g. Council Tax Bill, NHS Letter, Employment Contract",
  "summary": "2-3 plain-English sentences explaining what this document is and what it means for the person",
  "keyFacts": [
    { "label": "short label", "value": "the value exactly as it appears" }
  ],
  "actionsRequired": ["any steps the person needs to take, or empty array if none"],
  "suggestedQuestions": ["3 follow-up questions the person might want to ask about this document"]
}

Rules:
- keyFacts should include dates, amounts, deadlines, reference numbers, names — anything important
- Never invent information not in the document
- Keep summary to 2-3 sentences maximum
- actionsRequired: only include genuine required actions, not optional ones
- suggestedQuestions: make them specific to this document, not generic
- Always respond in the same language as the document`;

export interface DecoderAnalysis {
  documentType: string;
  summary: string;
  keyFacts: { label: string; value: string }[];
  actionsRequired: string[];
  suggestedQuestions: string[];
}

export async function analyseDocument(text: string): Promise<DecoderAnalysis> {
  const trimmed = text.slice(0, 12000); // stay within token budget
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Here is the document text:\n\n${trimmed}\n\nAnalyse this document.` },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1500,
  });

  try {
    return JSON.parse(response.choices[0]?.message?.content || '{}') as DecoderAnalysis;
  } catch {
    return {
      documentType: 'Document',
      summary: 'Could not analyse this document automatically.',
      keyFacts: [],
      actionsRequired: [],
      suggestedQuestions: [],
    };
  }
}

export const DECODER_CHAT_SYSTEM = (documentText: string) =>
  `You are a plain-English document assistant helping someone with dyslexia understand a specific document.

Here is the full document text:
---
${documentText.slice(0, 12000)}
---

Answer questions about this document clearly and simply. Use short sentences. If the answer isn't in the document, say so — never guess. If the person needs to take action, say what it is clearly.`;
