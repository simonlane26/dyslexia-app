'use client';

import { jsPDF } from 'jspdf';
import { useUser } from '@clerk/nextjs';
import { ModernButton } from './ModernButton';
import { addExportRecord } from '@/lib/exportHistory';
import { Download } from 'lucide-react';

interface ExportPDFButtonProps {
  text: string;
  simplifiedText?: string;
  documentTitle?: string;
  documentId?: string;
}

export function ExportPDFButton({ text, simplifiedText, documentTitle, documentId }: ExportPDFButtonProps) {
  const { user } = useUser();
  // TEMPORARY: Always enable for testing
  const isPro = true; // user?.publicMetadata?.isPro === true;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(text, 10, 10);
    if (simplifiedText) doc.text(simplifiedText, 10, 50);
    doc.save('writing.pdf');

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

