// src/lib/documentStorage.ts
export interface Document {
  id: string;
  title: string;
  content: string;
  simplifiedContent?: string;
  createdAt: number;
  updatedAt: number;
  userId?: string;
  readingProgress?: number; // percentage (0-100)
  lastReadPosition?: number; // character position
  lastReadAt?: number; // timestamp
}

const STORAGE_KEY = 'dyslexia-documents';
const CURRENT_DOC_KEY = 'dyslexia-current-document-id';
const MAX_LOCAL_DOCS = 50; // Prevent localStorage overflow

/**
 * Get all documents from localStorage
 */
export function getLocalDocuments(): Document[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const docs = JSON.parse(stored) as Document[];
    return docs.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Failed to load documents from localStorage:', error);
    return [];
  }
}

/**
 * Save document to localStorage
 */
export function saveLocalDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Document {
  if (typeof window === 'undefined') throw new Error('Cannot save in SSR');

  const docs = getLocalDocuments();
  const now = Date.now();

  let document: Document;

  if (doc.id) {
    // Update existing
    const index = docs.findIndex(d => d.id === doc.id);
    document = {
      ...doc,
      id: doc.id,
      createdAt: index >= 0 ? docs[index].createdAt : now,
      updatedAt: now,
    } as Document;

    if (index >= 0) {
      docs[index] = document;
    } else {
      docs.unshift(document);
    }
  } else {
    // Create new
    document = {
      ...doc,
      id: generateDocId(),
      createdAt: now,
      updatedAt: now,
    } as Document;
    docs.unshift(document);
  }

  // Limit storage size
  const trimmedDocs = docs.slice(0, MAX_LOCAL_DOCS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedDocs));
    return document;
  } catch (error) {
    console.error('Failed to save document:', error);
    throw new Error('Failed to save document. Storage may be full.');
  }
}

/**
 * Delete document from localStorage
 */
export function deleteLocalDocument(id: string): void {
  if (typeof window === 'undefined') return;

  const docs = getLocalDocuments();
  const filtered = docs.filter(d => d.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Clear current doc if it was deleted
    if (getCurrentDocumentId() === id) {
      setCurrentDocumentId(null);
    }
  } catch (error) {
    console.error('Failed to delete document:', error);
  }
}

/**
 * Get document by ID
 */
export function getLocalDocument(id: string): Document | null {
  const docs = getLocalDocuments();
  return docs.find(d => d.id === id) || null;
}

/**
 * Get/Set current document ID
 */
export function getCurrentDocumentId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_DOC_KEY);
}

export function setCurrentDocumentId(id: string | null): void {
  if (typeof window === 'undefined') return;

  if (id) {
    localStorage.setItem(CURRENT_DOC_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_DOC_KEY);
  }
}

/**
 * Generate unique document ID
 */
function generateDocId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export all documents as JSON (for backup)
 */
export function exportDocumentsJSON(): string {
  const docs = getLocalDocuments();
  return JSON.stringify(docs, null, 2);
}

/**
 * Import documents from JSON
 */
export function importDocumentsJSON(json: string): number {
  try {
    const imported = JSON.parse(json) as Document[];
    if (!Array.isArray(imported)) throw new Error('Invalid format');

    const existing = getLocalDocuments();
    const merged = [...imported, ...existing];

    // Deduplicate by ID
    const unique = Array.from(
      new Map(merged.map(d => [d.id, d])).values()
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique.slice(0, MAX_LOCAL_DOCS)));
    return imported.length;
  } catch (error) {
    console.error('Failed to import documents:', error);
    throw new Error('Invalid document format');
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; total: number; percentage: number } {
  if (typeof window === 'undefined') return { used: 0, total: 0, percentage: 0 };

  const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
  let used = 0;

  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
  } catch {}

  return {
    used,
    total,
    percentage: Math.round((used / total) * 100),
  };
}
