'use client';

import { ModernButton } from '@/components/ModernButton';
import { FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
  ShadingType,
  SectionType,
} from 'docx';

type Props = {
  text: string;
  simplifiedText?: string;
  filename?: string;
  bgColor?: string;   // optional: tint body similar to editor
  fontFamily?: string;
  fontSize?: number;  // px
  /** Gate the feature (e.g., isSignedIn && isPro) */
  enabled?: boolean;
  /** Optional custom CTA when disabled */
  onUpgradeAction?: () => void;
};

// --- helpers ---
function hexToDocxFill(hex?: string) {
  if (!hex) return undefined;
  const h = hex.replace('#', '').trim();
  return h.length === 3 ? h.split('').map((c) => c + c).join('') : h.toUpperCase();
}
function pxToHalfPoints(px?: number) {
  if (!px) return undefined;
  return Math.round(px * 1.5); // px -> pt (0.75) -> half-points (*2) ≈ *1.5
}
function paragraphsFromText(
  content: string,
  opts: { bgFill?: string; fontFamily?: string; runSize?: number }
) {
  const lines = content.split(/\r?\n/);
  return lines.map(
    (line) =>
      new Paragraph({
        shading: opts.bgFill
          ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.bgFill }
          : undefined,
        children: [
          new TextRun({
            text: line || ' ',
            font: opts.fontFamily,
            size: opts.runSize,
            color: '000000',
          }),
        ],
      })
  );
}

export function ExportDOCXButton({
  text,
  simplifiedText,
  filename = 'DyslexiaWriter.docx',
  bgColor,
  fontFamily = 'Lexend',
  fontSize = 18,
  enabled = true,
  onUpgradeAction,
}: Props) {
  // 🔒 If not enabled, render a CTA-style button that cannot export
  if (!enabled) {
    return (
      <ModernButton
        onClick={onUpgradeAction ?? (() => alert('Upgrade to Pro to export to Word!'))}
        variant="secondary"
        className="opacity-70"
        type="button"
      >
        <FileText size={16} /> Export Word (Pro)
      </ModernButton>
    );
  }

  const onExport = async () => {
    const now = new Date();
    const runSize = pxToHalfPoints(fontSize);
    const bgFill = hexToDocxFill(bgColor);

    const children: Paragraph[] = [
      new Paragraph({
        text: 'Dyslexia Writer Export',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Exported: ${now.toLocaleString()}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
    ];

    if (text?.trim()) {
      children.push(
        new Paragraph({ text: 'Original Text', heading: HeadingLevel.HEADING_2 }),
        ...paragraphsFromText(text, { bgFill, fontFamily, runSize }),
        new Paragraph({ text: '' })
      );
    }

    if (simplifiedText?.trim()) {
      children.push(
        new Paragraph({ text: 'Simplified Text', heading: HeadingLevel.HEADING_2 }),
        ...paragraphsFromText(simplifiedText, { bgFill, fontFamily, runSize }),
        new Paragraph({ text: '' })
      );
    }

    const doc = new Document({
      creator: 'Dyslexia Writer',
      title: 'Dyslexia Writer Export',
      description: 'Exported from Dyslexia Writer',
      sections: [
        {
          properties: {
            type: SectionType.CONTINUOUS,
            page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } }, // 0.5"
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  };

  return (
    <ModernButton onClick={onExport} variant="secondary" type="button">
      <FileText size={16} /> Export Word
    </ModernButton>
  );
}

