import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  PageBreak, TabStopType, TabStopLeader,
} from 'docx';

export interface PassportData {
  user: {
    name: string;
    organisation: string;
    generatedDate: string;
    periodLabel: string;
    licenceType: string;
  };
  preferences: {
    font: string;
    fontSize: number;
    bgColour: string;
    darkMode: boolean;
    voiceLabel: string;
  };
  usage: {
    activeDays: number;
    totalDays: number;
    featureUsage: { feature: string; label: string; days: number; pct: number }[];
    documentsDecoded: number;
    totalSimplifications: number;
  };
}

const BRAND = '4472C4'; // Word hex (no #)
const LIGHT_GREY = 'F3F4F6';
const MID_GREY = '6B7280';
const DARK = '111827';

function h(text: string, level: HeadingLevel = HeadingLevel.HEADING_2): Paragraph {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 280, after: 120 },
    run: { color: BRAND, bold: true, size: level === HeadingLevel.HEADING_1 ? 36 : 26 },
  });
}

function body(text: string, opts?: { bold?: boolean; color?: string; size?: number }): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text,
      bold: opts?.bold,
      color: opts?.color,
      size: opts?.size ?? 22,
    })],
    spacing: { after: 80 },
  });
}

function rule(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND } },
    spacing: { after: 200 },
    text: '',
  });
}

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}:  `, bold: true, color: BRAND, size: 22 }),
      new TextRun({ text: value, size: 22, color: DARK }),
    ],
    spacing: { after: 80 },
  });
}

function bar(label: string, pct: number, days: number): Paragraph {
  const filled = Math.round(pct / 5); // 0-20 blocks
  const empty = 20 - filled;
  const blocks = '█'.repeat(filled) + '░'.repeat(empty);
  return new Paragraph({
    children: [
      new TextRun({ text: label.padEnd(20, ' '), font: 'Courier New', size: 20 }),
      new TextRun({ text: ` ${blocks} `, font: 'Courier New', size: 18, color: BRAND }),
      new TextRun({ text: `${pct}%  (${days}d)`, size: 18, color: MID_GREY }),
    ],
    spacing: { after: 60 },
  });
}

function statTable(stats: { label: string; value: string; sub: string }[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: stats.map(s =>
          new TableCell({
            width: { size: Math.floor(100 / stats.length), type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: LIGHT_GREY },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            borders: {
              top: { style: BorderStyle.THICK, size: 12, color: BRAND },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: s.value, bold: true, size: 48, color: BRAND })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: s.label, size: 18, bold: true, color: DARK })],
                spacing: { after: 40 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: s.sub, size: 16, color: MID_GREY })],
              }),
            ],
          })
        ),
      }),
    ],
  });
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  simplify: 'AI text simplification — rewrites complex language into plain English',
  readAloud: 'Text-to-speech — reads content aloud using a natural voice',
  coach: 'Writing coach — gives real-time feedback on clarity and structure',
  decoder: 'Document decoder — analyses HR documents, policies, and letters',
  grammarCheck: 'Grammar and tone check — flags unclear or difficult phrasing',
};

const MANAGER_TIPS: Record<string, string> = {
  simplify: 'Send communications in plain English or attach a simplified version.',
  readAloud: 'Allow extra time for reading tasks; audio versions of documents are helpful.',
  coach: 'Written feedback in clear, structured bullet points works best.',
  decoder: 'When issuing policy documents, offer a plain-English summary alongside.',
  grammarCheck: 'Avoid dense, jargon-heavy emails — short paragraphs and headers help.',
};

export async function generatePassportDocx(data: PassportData): Promise<Buffer> {
  const topFeatures = data.usage.featureUsage.slice(0, 3);

  const doc = new Document({
    creator: 'DyslexiaWrite',
    title: `Accessibility Passport — ${data.user.name}`,
    description: 'Generated by DyslexiaWrite',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: DARK } },
      },
    },
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 1080 } } },
      children: [

        // ── COVER ──────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1200, after: 200 },
          children: [new TextRun({ text: 'Accessibility Passport', bold: true, size: 56, color: BRAND })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: data.user.name, size: 36, bold: true, color: DARK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: data.user.organisation, size: 26, color: MID_GREY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: `Generated: ${data.user.generatedDate}`, size: 20, color: MID_GREY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: `Data period: ${data.user.periodLabel}`, size: 20, color: MID_GREY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 2400 },
          children: [new TextRun({ text: `Licence: ${data.user.licenceType}`, size: 20, color: MID_GREY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: 'This document was generated by DyslexiaWrite and belongs to the employee named above. It is shared at their discretion.',
            size: 18, color: MID_GREY, italics: true,
          })],
          spacing: { after: 400 },
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── AT A GLANCE ────────────────────────────────────────
        h('At a glance', HeadingLevel.HEADING_1),
        rule(),
        statTable([
          { label: 'Active days', value: String(data.usage.activeDays), sub: `of ${data.usage.totalDays} days tracked` },
          { label: 'Simplifications', value: String(data.usage.totalSimplifications), sub: 'AI rewrites used' },
          { label: 'Docs decoded', value: String(data.usage.documentsDecoded), sub: 'this period' },
          { label: 'Top tool', value: topFeatures[0]?.label ?? '—', sub: `${topFeatures[0]?.pct ?? 0}% of active days` },
        ]),
        new Paragraph({ text: '', spacing: { after: 320 } }),

        // ── ACCESSIBILITY SETTINGS ─────────────────────────────
        h('Accessibility settings'),
        rule(),
        body('These are the visual and audio settings this person uses in DyslexiaWrite.', { color: MID_GREY }),
        new Paragraph({ text: '', spacing: { after: 120 } }),
        labelValue('Font', data.preferences.font),
        labelValue('Font size', `${data.preferences.fontSize}px`),
        labelValue('Background colour', data.preferences.bgColour),
        labelValue('Dark mode', data.preferences.darkMode ? 'Enabled' : 'Disabled'),
        labelValue('Text-to-speech voice', data.preferences.voiceLabel),
        new Paragraph({ text: '', spacing: { after: 200 } }),

        // ── FEATURE USAGE ──────────────────────────────────────
        h('Feature usage'),
        rule(),
        body('Percentage of active days each tool was used (last 90 days).', { color: MID_GREY }),
        new Paragraph({ text: '', spacing: { after: 140 } }),
        ...data.usage.featureUsage.map(f => bar(f.label, f.pct, f.days)),
        new Paragraph({ text: '', spacing: { after: 200 } }),

        // ── WHAT EACH TOOL DOES ────────────────────────────────
        h('What these tools do'),
        rule(),
        ...data.usage.featureUsage.flatMap(f => [
          body(`${f.label}`, { bold: true }),
          body(FEATURE_DESCRIPTIONS[f.feature] ?? f.feature, { color: MID_GREY }),
          new Paragraph({ text: '', spacing: { after: 80 } }),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── MANAGER QUICK GUIDE ────────────────────────────────
        h('Manager quick guide', HeadingLevel.HEADING_1),
        rule(),
        body(
          `${data.user.name} relies on the following tools most heavily. These practical tips will help you support them effectively.`,
          { color: MID_GREY }
        ),
        new Paragraph({ text: '', spacing: { after: 160 } }),
        ...topFeatures.flatMap(f => [
          body(`${f.label}  (used ${f.pct}% of working days)`, { bold: true, color: BRAND }),
          body(MANAGER_TIPS[f.feature] ?? '', { color: DARK }),
          new Paragraph({ text: '', spacing: { after: 120 } }),
        ]),

        // ── RECOMMENDED ADJUSTMENTS ────────────────────────────
        h('Recommended workplace adjustments'),
        rule(),
        body('Based on the tools used, the following reasonable adjustments may help:', { color: MID_GREY }),
        new Paragraph({ text: '', spacing: { after: 120 } }),
        ...[
          'Provide key documents in Word or editable PDF format so assistive tools can process them.',
          'Allow use of DyslexiaWrite during meetings and for written task completion.',
          'Written briefs and agendas shared in advance help with processing time.',
          'Avoid timed written assessments without reasonable adjustment agreements in place.',
          'Where possible, offer verbal check-ins alongside written feedback.',
        ].map(t => new Paragraph({
          children: [
            new TextRun({ text: '•  ', color: BRAND, bold: true, size: 22 }),
            new TextRun({ text: t, size: 22, color: DARK }),
          ],
          spacing: { after: 80 },
        })),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        // ── FOOTER NOTE ────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: 'Generated by DyslexiaWrite — www.dyslexiawrite.com  |  Dyslexiawrite@gmail.com',
            size: 16, color: MID_GREY, italics: true,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: 'This passport is the property of the employee and is shared only with their consent.',
            size: 16, color: MID_GREY, italics: true,
          })],
        }),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}
