/**
 * One-time script: generates the PDF guide emailed to Access to Work funding
 * guide opt-in leads (the "Waiting on Access to Work funding?" section on
 * the homepage, pricing page, and /access-to-work-guide).
 *
 * Usage:
 *   node scripts/generate-access-to-work-guide-pdf.mjs
 *
 * Output: /public/guides/access-to-work-funding-guide.pdf
 *
 * Re-run this any time the copy below changes — the PDF is a committed
 * static asset, not generated at request time. Timeframe figures should be
 * re-checked against current DWP-reported processing times before editing;
 * as of Sept 2026 the scheme's own target is 25 working days but reported
 * average waits and backlogs run far longer — see the 2026 update on
 * /access-to-work for the sourcing note. Avoid quoting a single precise
 * week-count, since it goes stale fast; describe the target vs. the
 * backlog instead.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'guides');
const OUT_FILE = path.join(OUT_DIR, 'access-to-work-funding-guide.pdf');

// ---- palette (matches the marketing site's landingTheme.ts) ----
const INK = rgb(0.169, 0.165, 0.157); // #2B2A28
const MUTED = rgb(0.420, 0.396, 0.345); // #6B6558
const TEAL = rgb(0.184, 0.478, 0.420); // #2F7A6B
const AMBER = rgb(0.851, 0.549, 0.165); // #D98C2B
const CREAM = rgb(0.984, 0.969, 0.937); // #FBF7EF
const LINE = rgb(0.902, 0.871, 0.796); // #E6DECB

const PAGE_SIZE = [595.28, 841.89]; // A4
const MARGIN = 50;

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
  pdf.setTitle('Access to Work funding guide — DyslexiaWrite');
  pdf.setAuthor('DyslexiaWrite Ltd');

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  let page = pdf.addPage(PAGE_SIZE);
  let { width, height } = page.getSize();
  const contentWidth = width - MARGIN * 2;
  let y;

  function newPage() {
    page = pdf.addPage(PAGE_SIZE);
    ({ width, height } = page.getSize());
    y = height - MARGIN;
    return y;
  }

  function ensureSpace(needed) {
    if (y - needed < MARGIN) newPage();
  }

  function heading(text, size = 16) {
    ensureSpace(size + 16);
    page.drawText(text, { x: MARGIN, y, size, font: helvBold, color: TEAL });
    y -= size + 10;
  }

  function subheading(text) {
    ensureSpace(28);
    page.drawText(text, { x: MARGIN, y, size: 12.5, font: helvBold, color: INK });
    y -= 16;
  }

  function paragraph(text, opts = {}) {
    const size = opts.size ?? 10.5;
    const lineHeight = opts.lineHeight ?? 13.5;
    ensureSpace(lineHeight * 3);
    y = drawWrappedText(page, {
      text, x: MARGIN, y, font: opts.font ?? helv, size, color: opts.color ?? MUTED,
      maxWidth: contentWidth, lineHeight,
    });
    y -= opts.gap ?? 10;
  }

  function bullet(text) {
    ensureSpace(28);
    page.drawCircle({ x: MARGIN + 4, y: y - 4, size: 2.4, color: TEAL });
    y = drawWrappedText(page, {
      text, x: MARGIN + 14, y, font: helv, size: 10.5, color: MUTED,
      maxWidth: contentWidth - 14, lineHeight: 13.5,
    });
    y -= 6;
  }

  function quoteBox(label, quote) {
    ensureSpace(70);
    const boxTop = y;
    const boxHeight = 62;
    page.drawRectangle({ x: MARGIN, y: boxTop - boxHeight, width: contentWidth, height: boxHeight, color: CREAM });
    y -= 15;
    page.drawText(label, { x: MARGIN + 14, y, size: 10, font: helvBold, color: INK });
    y -= 15;
    drawWrappedText(page, {
      text: quote, x: MARGIN + 14, y, font: helvOblique, size: 9.5, color: MUTED,
      maxWidth: contentWidth - 28, lineHeight: 12,
    });
    y = boxTop - boxHeight - 16;
  }

  // ---- Cover / header ----
  y = height - MARGIN;
  const headerHeight = 58;
  page.drawRectangle({ x: 0, y: height - headerHeight, width, height: headerHeight, color: CREAM });
  page.drawText('DyslexiaWrite', { x: MARGIN, y: height - 24, size: 12.5, font: helvBold, color: TEAL });
  page.drawText('dyslexiawrite.com', { x: MARGIN, y: height - 40, size: 9.5, font: helv, color: MUTED });
  y = height - headerHeight - 34;

  page.drawText('Access to Work', { x: MARGIN, y, size: 24, font: helvBold, color: INK });
  y -= 28;
  page.drawText('A funding guide for assistive writing software', { x: MARGIN, y, size: 14, font: helv, color: MUTED });
  y -= 26;
  paragraph(
    "Access to Work is a UK government scheme that pays for assistive technology — including software like Dyslexia Write — for employed and self-employed people whose disability or health condition affects their work. This guide walks through the application, the wording that helps your case, a funding request template, and what to expect while you wait.",
    { gap: 16 }
  );

  // ---- Section: the honest timeline ----
  heading('1. The honest timeline');
  paragraph(
    "Access to Work's own target is to decide within 25 working days of a complete application. In practice, current DWP-reported figures show average decision times running well beyond that target, and applicants have reported waits of several months during periods of high demand — the scheme has publicly acknowledged a case backlog it is working through.",
    { gap: 8 }
  );
  paragraph(
    "This isn't a reflection of your application — it's the scheme's processing capacity. The practical takeaway: apply as early as possible, keep a record of your reference number and submission date, and don't assume something's wrong if you haven't heard back within a few weeks.",
    { gap: 14 }
  );

  // ---- Section: step by step ----
  heading('2. The application, step by step');
  subheading('Step 1 — Apply to Access to Work');
  paragraph(
    "Apply online at GOV.UK or call the Access to Work helpline on 0800 121 7479. You'll need your National Insurance number and a short description of how dyslexia (or another condition) affects your work. If you're employed, you'll also need a workplace contact who can confirm you work there.",
    { gap: 4 }
  );
  bullet('When asked what support you need, be specific: "assistive technology software for dyslexia, specifically Dyslexia Write" — a named product is faster to process than a general request.');
  y -= 4;

  subheading('Step 2 — Workplace needs assessment');
  paragraph(
    "If your case is approved for assessment, the DWP arranges a workplace needs assessment — usually a phone or video call, typically 30–60 minutes, with an independent assessor. They'll ask about your role, the tasks you find difficult, and what's already helped.",
    { gap: 4 }
  );
  bullet('If you have already tried Dyslexia Write (the free tier works for this), say so — assessors are more likely to recommend a tool you have hands-on experience with, rather than guess at what might help.');
  y -= 4;

  subheading('Step 3 — Recommendation and approval');
  paragraph(
    "The assessor writes a report recommending specific tools. If assistive software is recommended, the DWP approves a grant covering the cost. For software like Dyslexia Write, Access to Work typically covers the full cost.",
    { gap: 4 }
  );
  bullet('The recommendation is guidance, not a binding requirement. If the assessor suggests a different product but you prefer Dyslexia Write, you can request it instead — you have the right to choose the tool that works best for you.');
  y -= 4;

  subheading('Step 4 — Claim your licence');
  paragraph(
    "Once your grant is approved, contact us with your Access to Work reference number. We set up your account the same day and invoice the DWP directly — you don't handle payment or paperwork.",
    { gap: 14 }
  );

  // ---- Section: funding request template ----
  heading('3. Funding request template');
  paragraph(
    "Use this if you need to put your request in writing — to an employer, a SENCO, or as supporting notes for your Access to Work assessor. Adjust the bracketed sections for your situation.",
    { gap: 8 }
  );
  quoteBox(
    'For an employer or Access to Work assessor:',
    '"I have dyslexia, which affects [specific tasks — e.g. writing emails and reports, reading long documents]. I\'d like to request funding for Dyslexia Write, an assistive writing and reading tool, through [Access to Work / our workplace adjustments budget]. I have already tried it and found it helped with [specific benefit]. Could we look at getting this funded?"'
  );
  quoteBox(
    'For a SENCO or school/university disability service:',
    '"I have dyslexia and I\'m finding [specific challenge — e.g. keeping up with reading load, structuring written coursework] difficult. Could we look at an access arrangements assessment, and whether assistive software like Dyslexia Write could be funded through the school/college SEN budget or Disabled Students\' Allowance?"'
  );

  // ---- Section: while you wait ----
  heading('4. While you wait');
  paragraph(
    "You don't need to wait for approval to start building the habit. Dyslexia Write's free tier gives you real, unlimited use of the core writing support — so you can genuinely say \"I've already tried it and it helps\" when the assessment call happens, which is exactly the kind of concrete evidence assessors respond well to.",
    { gap: 8 }
  );
  bullet("Keep a note of your application date and reference number somewhere you won't lose it.");
  bullet("If you haven't heard anything after a few weeks, it's reasonable to call the Access to Work helpline and ask for a status update quoting your reference number.");
  bullet("If your circumstances change (new job, role change, condition worsening), you can update the DWP directly — it won't restart your case from scratch in most circumstances.");
  y -= 6;

  // ---- Footer ----
  ensureSpace(50);
  page.drawLine({ start: { x: MARGIN, y }, end: { x: width - MARGIN, y }, thickness: 1, color: LINE });
  y -= 16;
  page.drawText(
    'DyslexiaWrite — AI-powered writing and reading support, built for how dyslexic people think.',
    { x: MARGIN, y, size: 8.5, font: helv, color: MUTED }
  );
  y -= 13;
  page.drawText('Start free at dyslexiawrite.com  ·  Full walkthrough at dyslexiawrite.com/access-to-work', { x: MARGIN, y, size: 8.5, font: helvBold, color: TEAL });
  y -= 13;
  page.drawText('This guide is general information, not official DWP guidance — always confirm current process details at gov.uk/access-to-work.', { x: MARGIN, y, size: 7.5, font: helvOblique, color: MUTED });

  const bytes = await pdf.save();
  fs.writeFileSync(OUT_FILE, bytes);
  console.log(`Wrote ${OUT_FILE} (${(bytes.length / 1024).toFixed(1)} KB), ${pdf.getPageCount()} page(s), final y=${y.toFixed(1)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
