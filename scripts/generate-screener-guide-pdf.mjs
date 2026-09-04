/**
 * One-time script: generates the 1-page PDF guide emailed to Free Screener
 * leads ("5 writing workarounds... and how to ask your employer or school
 * to fund assistive tech").
 *
 * Usage:
 *   node scripts/generate-screener-guide-pdf.mjs
 *
 * Output: /public/guides/5-dyslexia-writing-workarounds.pdf
 *
 * Re-run this any time the copy below changes — the PDF is a committed
 * static asset, not generated at request time. The script logs the final
 * y-cursor; keep it comfortably above 0 (page bottom) or tighten spacing.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'guides');
const OUT_FILE = path.join(OUT_DIR, '5-dyslexia-writing-workarounds.pdf');

// ---- palette (matches the screener's warm cream/teal/amber identity) ----
const INK = rgb(0.173, 0.173, 0.165); // #2C2C2A
const MUTED = rgb(0.533, 0.529, 0.502); // #888780
const TEAL = rgb(0.114, 0.620, 0.459); // #1D9E75
const AMBER = rgb(0.729, 0.459, 0.090); // #BA7517
const CREAM = rgb(0.992, 0.965, 0.890); // #FDF6E3
const LINE = rgb(0.910, 0.902, 0.871); // #E8E6DE

const WORKAROUNDS = [
  {
    title: 'Talk it, then type it',
    body: 'Use voice dictation for a first draft instead of typing from a blank page. Getting ideas down without the friction of spelling and typing removes the biggest barrier — you can tidy the wording once it exists.',
  },
  {
    title: 'Read it back to yourself',
    body: "Run finished writing through text-to-speech before you send it. Dyslexic readers often don't 'hear' their own mistakes when reading silently — hearing the words out loud catches what your eyes skip past.",
  },
  {
    title: 'Simplify before you send',
    body: 'Run a plain-English pass over anything important — an email, a report, a form. Shorter sentences and simpler words are faster to write, faster to read, and much easier to proofread.',
  },
  {
    title: 'Keep a personal phrase bank',
    body: "Save the openers, sign-offs, and stock sentences you reuse often so you're never rebuilding the same sentence structure from a blank page.",
  },
  {
    title: 'Use a checker built for dyslexia',
    body: "Standard spellcheckers miss the errors dyslexic writers make most — reversed letters and homophones like their/there or form/from. A dyslexia-aware checker catches what a generic one won't.",
  },
];

function drawWrappedText(page, { text, x, y, font, size, color, maxWidth, lineHeight }) {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, size, font, color });
      cursorY -= lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cursorY, size, font, color });
    cursorY -= lineHeight;
  }
  return cursorY;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const pdf = await PDFDocument.create();
  pdf.setTitle('5 writing workarounds that help most adults with dyslexia');
  pdf.setAuthor('DyslexiaWrite Ltd');

  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - margin * 2;

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Header band
  const headerHeight = 58;
  page.drawRectangle({ x: 0, y: height - headerHeight, width, height: headerHeight, color: CREAM });
  page.drawText('DyslexiaWrite', { x: margin, y: height - 24, size: 12.5, font: helvBold, color: TEAL });
  page.drawText('dyslexiawrite.com', { x: margin, y: height - 40, size: 9.5, font: helv, color: MUTED });

  let y = height - headerHeight - 34;
  page.drawText('5 writing workarounds that help', { x: margin, y, size: 21, font: helvBold, color: INK });
  y -= 26;
  page.drawText('most adults with dyslexia', { x: margin, y, size: 21, font: helvBold, color: INK });
  y -= 20;
  y = drawWrappedText(page, {
    text: 'None of these need a diagnosis first. Start with whichever one solves the problem you hit most often.',
    x: margin, y, font: helvOblique, size: 11, color: MUTED, maxWidth: contentWidth, lineHeight: 14,
  });
  y -= 8;

  WORKAROUNDS.forEach((item, i) => {
    page.drawCircle({ x: margin + 9, y: y - 5, size: 9, color: TEAL });
    page.drawText(String(i + 1), {
      x: margin + (i + 1 < 10 ? 6 : 3), y: y - 9, size: 10, font: helvBold, color: rgb(1, 1, 1),
    });
    page.drawText(item.title, { x: margin + 26, y, size: 13, font: helvBold, color: INK });
    y -= 15;
    y = drawWrappedText(page, {
      text: item.body, x: margin + 26, y, font: helv, size: 10, color: MUTED,
      maxWidth: contentWidth - 26, lineHeight: 12.5,
    });
    y -= 9;
  });

  // Divider
  y -= 2;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: LINE });
  y -= 20;

  page.drawText('How to ask your employer or school to fund assistive tech', {
    x: margin, y, size: 14, font: helvBold, color: AMBER,
  });
  y -= 18;

  page.drawText('If you’re working', { x: margin, y, size: 11.5, font: helvBold, color: INK });
  y -= 14;
  y = drawWrappedText(page, {
    text: "In the UK, the government’s Access to Work scheme funds assessments, software, and equipment for employees with dyslexia — typically the full cost, and it doesn’t require a diagnosis to start a claim. Tell your line manager or HR; it’s a grant, not special treatment, and it won’t affect sick pay or your record.",
    x: margin, y, font: helv, size: 10, color: MUTED, maxWidth: contentWidth, lineHeight: 12.5,
  });
  y -= 12;

  page.drawText('If you’re at school or college', { x: margin, y, size: 11.5, font: helvBold, color: INK });
  y -= 14;
  y = drawWrappedText(page, {
    text: 'Ask to speak to the SENCO about an access arrangements assessment — it can unlock extra time, a reader or scribe, and assistive software for exams and coursework. Schools hold discretionary SEN budgets for exactly this, and can apply for extra funding if needs are higher.',
    x: margin, y, font: helv, size: 10, color: MUTED, maxWidth: contentWidth, lineHeight: 12.5,
  });
  y -= 16;

  const boxTop = y;
  const boxHeight = 56;
  page.drawRectangle({ x: margin, y: boxTop - boxHeight, width: contentWidth, height: boxHeight, color: CREAM });
  y -= 15;
  page.drawText('A script to open the conversation:', { x: margin + 14, y, size: 10, font: helvBold, color: INK });
  y -= 14;
  drawWrappedText(page, {
    text: '“I think I’d write faster and more confidently with some assistive software — can we look at funding it through [Access to Work / the SEN budget]?”',
    x: margin + 14, y, font: helvOblique, size: 9.5, color: MUTED, maxWidth: contentWidth - 28, lineHeight: 12,
  });
  y = boxTop - boxHeight - 16;

  // Footer — positioned relative to wherever the content flow ended, so it
  // never collides with the box above even if the copy changes length.
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: LINE });
  y -= 14;
  page.drawText(
    'DyslexiaWrite — AI-powered writing and reading support, built for how dyslexic people think.',
    { x: margin, y, size: 8.5, font: helv, color: MUTED }
  );
  y -= 13;
  page.drawText('Start free at dyslexiawrite.com', { x: margin, y, size: 8.5, font: helvBold, color: TEAL });

  if (y < 20) {
    console.warn(`⚠ Content is tight: final y=${y.toFixed(1)}. Consider trimming copy further.`);
  }

  const bytes = await pdf.save();
  fs.writeFileSync(OUT_FILE, bytes);
  console.log(`Wrote ${OUT_FILE} (${(bytes.length / 1024).toFixed(1)} KB), final y=${y.toFixed(1)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
