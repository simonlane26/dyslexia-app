'use client';

import { jsPDF } from 'jspdf';
import { useUser } from '@clerk/nextjs';
import { ModernButton } from './ModernButton';

interface ExportPDFButtonProps {
  text: string;
  simplifiedText?: string;
}

export function ExportPDFButton({ text, simplifiedText }: ExportPDFButtonProps) {
  const { user } = useUser();
  const isPro = user?.publicMetadata?.isPro === true;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(text, 10, 10);
    if (simplifiedText) doc.text(simplifiedText, 10, 50);
    doc.save('writing.pdf');
  };

  return isPro ? (
    <ModernButton
      onClick={exportPDF}
      className="text-white transition-all shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105"
    >
      📄 Export PDF
    </ModernButton>
  ) : (
    <ModernButton
      onClick={() => alert('Upgrade to Pro to export as PDF!')}
      className="text-gray-500 bg-gray-200 cursor-not-allowed opacity-70"
      disabled
    >
      📄 Export PDF (Pro Only)
    </ModernButton>
  );
}

