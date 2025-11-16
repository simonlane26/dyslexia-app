// src/components/DocumentManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Upload, Search, X, Clock } from 'lucide-react';
import { ModernButton } from './ModernButton';
import {
  getLocalDocuments,
  deleteLocalDocument,
  exportDocumentsJSON,
  importDocumentsJSON,
  Document,
} from '@/lib/documentStorage';
import { useToast } from './ToastContainer';

interface DocumentManagerProps {
  onLoadDocument: (doc: Document) => void;
  onNewDocument: () => void;
  currentDocId: string | null;
  theme: any;
}

export function DocumentManager({
  onLoadDocument,
  onNewDocument,
  currentDocId,
  theme,
}: DocumentManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  const loadDocuments = () => {
    const docs = getLocalDocuments();
    setDocuments(docs);
  };

  // Load documents on mount to show correct count
  useEffect(() => {
    loadDocuments();
  }, []);

  // Reload when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteLocalDocument(id);
      loadDocuments();
      toast.success('Document deleted');
    }
  };

  const handleExport = () => {
    try {
      const json = exportDocumentsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dyslexia-writer-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Documents exported');
    } catch (error) {
      toast.error('Failed to export documents');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const count = importDocumentsJSON(text);
        loadDocuments();
        toast.success(`Imported ${count} document(s)`);
      } catch (error) {
        toast.error('Failed to import: Invalid file format');
      }
    };
    input.click();
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) {
    return (
      <ModernButton
        variant="secondary"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <FileText size={18} />
        My Documents ({documents.length})
      </ModernButton>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          backgroundColor: theme.bg,
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: 0 }}>
            My Documents
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: theme.text,
              opacity: 0.7,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <ModernButton variant="primary" size="sm" onClick={onNewDocument}>
            <Plus size={16} />
            New Document
          </ModernButton>
          <ModernButton variant="secondary" size="sm" onClick={handleExport}>
            <Download size={16} />
            Export All
          </ModernButton>
          <ModernButton variant="secondary" size="sm" onClick={handleImport}>
            <Upload size={16} />
            Import
          </ModernButton>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.text,
                opacity: 0.5,
              }}
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                color: theme.text,
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        {/* Document List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
          }}
        >
          {filteredDocs.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: theme.text,
                opacity: 0.6,
              }}
            >
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>{searchQuery ? 'No documents found' : 'No documents yet'}</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                {searchQuery ? 'Try a different search' : 'Create your first document to get started'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${doc.id === currentDocId ? theme.primary : theme.border}`,
                    backgroundColor: doc.id === currentDocId ? `${theme.primary}10` : theme.surface,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    onLoadDocument(doc);
                    setIsOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    if (doc.id !== currentDocId) {
                      e.currentTarget.style.borderColor = theme.secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (doc.id !== currentDocId) {
                      e.currentTarget.style.borderColor = theme.border;
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <FileText size={20} style={{ color: theme.primary, flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: theme.text,
                          margin: 0,
                          marginBottom: '4px',
                        }}
                      >
                        {doc.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: theme.text,
                          opacity: 0.7,
                          margin: 0,
                          marginBottom: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {doc.content.substring(0, 100)}
                        {doc.content.length > 100 ? '...' : ''}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '12px',
                          color: theme.text,
                          opacity: 0.5,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {formatDate(doc.updatedAt)}
                        </span>
                        <span>{doc.content.split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id, doc.title);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: theme.danger,
                        opacity: 0.7,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
