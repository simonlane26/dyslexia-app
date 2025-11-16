// src/lib/exportHistory.ts
export interface ExportRecord {
  id: string;
  documentId?: string;
  documentTitle: string;
  exportType: 'pdf' | 'docx' | 'mp3';
  timestamp: number;
  wordCount: number;
  userId?: string;
}

const EXPORT_HISTORY_KEY = 'dyslexia-export-history';
const MAX_EXPORT_RECORDS = 100;

/**
 * Get all export records from localStorage
 */
export function getExportHistory(): ExportRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(EXPORT_HISTORY_KEY);
    if (!stored) return [];

    const records = JSON.parse(stored) as ExportRecord[];
    return records.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load export history:', error);
    return [];
  }
}

/**
 * Add an export record
 */
export function addExportRecord(
  record: Omit<ExportRecord, 'id' | 'timestamp'>
): ExportRecord {
  if (typeof window === 'undefined') throw new Error('Cannot save in SSR');

  const records = getExportHistory();
  const newRecord: ExportRecord = {
    ...record,
    id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  records.unshift(newRecord);

  // Limit storage size
  const trimmedRecords = records.slice(0, MAX_EXPORT_RECORDS);

  try {
    localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(trimmedRecords));
    return newRecord;
  } catch (error) {
    console.error('Failed to save export record:', error);
    throw new Error('Failed to save export history');
  }
}

/**
 * Get export statistics
 */
export function getExportStats(): {
  totalExports: number;
  byType: { pdf: number; docx: number; mp3: number };
  last7Days: number;
  last30Days: number;
} {
  const records = getExportHistory();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return {
    totalExports: records.length,
    byType: {
      pdf: records.filter((r) => r.exportType === 'pdf').length,
      docx: records.filter((r) => r.exportType === 'docx').length,
      mp3: records.filter((r) => r.exportType === 'mp3').length,
    },
    last7Days: records.filter((r) => now - r.timestamp < 7 * day).length,
    last30Days: records.filter((r) => now - r.timestamp < 30 * day).length,
  };
}

/**
 * Clear export history
 */
export function clearExportHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXPORT_HISTORY_KEY);
}

/**
 * Get recent exports (last N)
 */
export function getRecentExports(count: number = 5): ExportRecord[] {
  return getExportHistory().slice(0, count);
}
