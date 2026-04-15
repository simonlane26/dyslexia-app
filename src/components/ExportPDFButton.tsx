'use client';

import { jsPDF } from 'jspdf';
import { useUser } from '@clerk/nextjs';
import { ModernButton } from './ModernButton';
import { addExportRecord } from '@/lib/exportHistory';
import { Download } from 'lucide-react';

interface ExportPDFButtonProps {
  text: string;
  isPro: boolean;
  simplifiedText?: string;
  documentTitle?: string;
  documentId?: string;
}

export function ExportPDFButton({ text, isPro, simplifiedText, documentTitle, documentId }: ExportPDFButtonProps) {
  const { user } = useUser();

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const usableWidth = pageWidth - margin * 2;
    const lineHeight = 7;

    function addSection(title: string | null, content: string, startY: number): number {
      let y = startY;

      if (title) {
        if (y + 10 > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      }

      const lines = doc.splitTextToSize(content, usableWidth) as string[];
      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += lineHeight;
      }
      return y + 6;
    }

    const now = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Dyslexia Write — ${now}`, margin, margin);
    doc.setTextColor(0);

    let y = margin + 10;
    y = addSection(simplifiedText ? 'Original Text' : null, text, y);
    if (simplifiedText) {
      y = addSection('Simplified Text', simplifiedText, y + 4);
    }

    doc.save(`${documentTitle || 'writing'}.pdf`);

    // Track export
    try {
      addExportRecord({
        documentId,
        documentTitle: documentTitle || 'Untitled Document',
        exportType: 'pdf',
        wordCount: text.trim().split(/\s+/).filter(w => w.length > 0).length,
        userId: user?.id,
      });
    } catch (error) {
      console.error('Failed to track export:', error);
    }
  };

  return isPro ? (
    <ModernButton
      onClick={exportPDF}
      variant="secondary"
      size="sm"
    >
      <Download size={16} /> PDF
    </ModernButton>
  ) : (
    <ModernButton
      onClick={() => alert('Upgrade to Pro to export as PDF!')}
      variant="secondary"
      size="sm"
      disabled
    >
      <Download size={16} /> PDF (Pro)
    </ModernButton>
  );
}

