'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle, Info, Lightbulb, X } from 'lucide-react';
import { checkGrammar, GrammarIssue, debounce } from '@/lib/languageTool';
import { processDyslexiaIssues } from '@/lib/dyslexiaGrammar';
import { ModernButton } from './ModernButton';

interface GrammarCheckProps {
  text: string;
  onTextChange: (text: string) => void;
  onApplyFix: (offset: number, length: number, replacement: string) => void;
  enabled: boolean;
  theme: any;
  fontSize: number;
  fontFamily: string;
  bgColor: string;
  editorTextColor: string;
  darkMode: boolean;
  highContrast: boolean;
}

interface GrammarTooltip {
  issue: GrammarIssue;
  position: { top: number; left: number };
}

export function GrammarCheck({
  text,
  onTextChange,
  onApplyFix,
  enabled,
  theme,
  fontSize,
  fontFamily,
  bgColor,
  editorTextColor,
  darkMode,
  highContrast,
}: GrammarCheckProps) {
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [checking, setChecking] = useState(false);
  const [tooltip, setTooltip] = useState<GrammarTooltip | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [checkCount, setCheckCount] = useState(0);

  // Debounced grammar check
  const performCheck = useCallback(
    debounce(async (textToCheck: string) => {
      if (!textToCheck.trim() || !enabled) {
        setIssues([]);
        return;
      }

      setChecking(true);
      try {
        const rawIssues = await checkGrammar(textToCheck);
        const processedIssues = processDyslexiaIssues(rawIssues);
        setIssues(processedIssues);
        setCheckCount((prev) => prev + 1);
      } catch (error) {
        console.error('Grammar check failed:', error);
      } finally {
        setChecking(false);
      }
    }, 2000), // 2 second debounce
    [enabled]
  );

  // Trigger check when text changes
  useEffect(() => {
    if (enabled) {
      performCheck(text);
    } else {
      setIssues([]);
    }
  }, [text, enabled, performCheck]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIssueClick = (issue: GrammarIssue, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();

    // Calculate position to keep tooltip visible
    // Use fixed positioning so it stays in viewport
    let top = rect.bottom + 8;
    let left = rect.left;

    // If tooltip would go off bottom of screen, show it above the text instead
    const tooltipHeight = 300; // Estimated height
    if (top + tooltipHeight > window.innerHeight) {
      top = rect.top - tooltipHeight - 8;
    }

    // If tooltip would go off right side, move it left
    const tooltipWidth = 350; // Estimated width
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 20;
    }

    // Keep at least 10px from left edge
    if (left < 10) {
      left = 10;
    }

    setTooltip({
      issue,
      position: { top, left },
    });
  };

  const handleApplyFix = (replacement: string) => {
    if (tooltip) {
      onApplyFix(tooltip.issue.offset, tooltip.issue.length, replacement);
      setTooltip(null);
    }
  };

  const handleIgnore = () => {
    if (tooltip) {
      // Remove this issue from the list
      setIssues((prev) =>
        prev.filter((i) => i.offset !== tooltip.issue.offset)
      );
      setTooltip(null);
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Status indicator */}
      {checking && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: '6px',
            fontSize: '12px',
            color: theme.primary,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          Checking grammar...
        </div>
      )}

      {/* Summary badge */}
      {!checking && issues.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            fontSize: '12px',
            color: theme.danger,
            zIndex: 10,
          }}
        >
          <AlertCircle size={14} />
          {issues.length} issue{issues.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Render text with underlines (click underlined text to see fixes) */}
      <GrammarHighlightedText
        text={text}
        issues={issues}
        onIssueClick={handleIssueClick}
        onTextChange={onTextChange}
        fontSize={fontSize}
        fontFamily={fontFamily}
        bgColor={bgColor}
        editorTextColor={editorTextColor}
        darkMode={darkMode}
        highContrast={highContrast}
        theme={theme}
      />

      {/* Tooltip */}
      {tooltip && (
        <GrammarTooltip
          issue={tooltip.issue}
          position={tooltip.position}
          onApplyFix={handleApplyFix}
          onIgnore={handleIgnore}
          onClose={() => setTooltip(null)}
          theme={theme}
          darkMode={darkMode}
        />
      )}

      {/* Add keyframe animation */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// Component to render text with grammar issue underlines
function GrammarHighlightedText({
  text,
  issues,
  onIssueClick,
  onTextChange,
  fontSize,
  fontFamily,
  bgColor,
  editorTextColor,
  darkMode,
  highContrast,
  theme,
}: {
  text: string;
  issues: GrammarIssue[];
  onIssueClick: (issue: GrammarIssue, event: React.MouseEvent) => void;
  onTextChange: (text: string) => void;
  fontSize: number;
  fontFamily: string;
  bgColor: string;
  editorTextColor: string;
  darkMode: boolean;
  highContrast: boolean;
  theme: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Sort issues by offset to render in order
  const sortedIssues = [...issues].sort((a, b) => a.offset - b.offset);

  // Build segments of text with and without issues
  const segments: Array<{ text: string; issue?: GrammarIssue }> = [];
  let currentOffset = 0;

  for (const issue of sortedIssues) {
    // Add text before this issue
    if (issue.offset > currentOffset) {
      segments.push({
        text: text.substring(currentOffset, issue.offset),
      });
    }

    // Add the issue segment
    segments.push({
      text: text.substring(issue.offset, issue.offset + issue.length),
      issue,
    });

    currentOffset = issue.offset + issue.length;
  }

  // Add remaining text
  if (currentOffset < text.length) {
    segments.push({
      text: text.substring(currentOffset),
    });
  }

  const getUnderlineColor = (severity: string, isDyslexia: boolean) => {
    if (isDyslexia) return '#f59e0b'; // Orange for dyslexia-relevant
    if (severity === 'error') return '#ef4444'; // Red for errors
    if (severity === 'warning') return '#3b82f6'; // Blue for warnings
    return '#6b7280'; // Gray for info
  };

  // Toggle to edit mode
  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        autoFocus
        placeholder="Start writing here..."
        className="w-full p-4 transition-all duration-200 resize-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        style={{
          backgroundColor: darkMode ? '#374151' : bgColor,
          fontFamily,
          fontSize: `${fontSize}px`,
          color: editorTextColor,
          caretColor: editorTextColor,
          border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
          minHeight: '60vh',
          maxHeight: '70vh',
          lineHeight: '1.6',
        }}
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      style={{
        backgroundColor: darkMode ? '#374151' : bgColor,
        fontFamily,
        fontSize: `${fontSize}px`,
        color: editorTextColor,
        border: `2px solid ${darkMode ? '#6b7280' : highContrast ? '#000000' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '16px',
        minHeight: '60vh',
        maxHeight: '70vh',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        lineHeight: '1.6',
        cursor: 'text',
      }}
      title="Double-click to edit text"
    >
      {segments.map((segment, index) =>
        segment.issue ? (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onIssueClick(segment.issue!, e);
            }}
            style={{
              position: 'relative',
              textDecoration: 'underline',
              textDecorationStyle: 'wavy',
              textDecorationColor: getUnderlineColor(
                segment.issue.severity,
                segment.issue.isDyslexiaRelevant
              ),
              textDecorationThickness: '2px',
              cursor: 'pointer',
              backgroundColor: segment.issue.isDyslexiaRelevant
                ? 'rgba(245, 158, 11, 0.1)'
                : undefined,
            }}
            title={segment.issue.shortMessage}
          >
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </div>
  );
}

// Tooltip component for grammar issues
function GrammarTooltip({
  issue,
  position,
  onApplyFix,
  onIgnore,
  onClose,
  theme,
  darkMode,
}: {
  issue: GrammarIssue;
  position: { top: number; left: number };
  onApplyFix: (replacement: string) => void;
  onIgnore: () => void;
  onClose: () => void;
  theme: any;
  darkMode: boolean;
}) {
  const getSeverityIcon = (severity: string) => {
    if (severity === 'error') return <AlertCircle size={16} color="#ef4444" />;
    if (severity === 'warning') return <Info size={16} color="#3b82f6" />;
    return <CheckCircle size={16} color="#6b7280" />;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        border: `2px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        maxWidth: '350px',
        minWidth: '300px',
        zIndex: 10000,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          {getSeverityIcon(issue.severity)}
          <div>
            <div
              style={{
                fontWeight: '600',
                fontSize: '14px',
                color: theme.text,
                marginBottom: '4px',
              }}
            >
              {issue.shortMessage}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              {issue.category}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: theme.text,
            opacity: 0.6,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Dyslexia hint */}
      {issue.isDyslexiaRelevant && issue.dyslexiaHint && (
        <div
          style={{
            padding: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span
            style={{
              fontSize: '13px',
              color: theme.text,
              lineHeight: '1.4',
            }}
          >
            {issue.dyslexiaHint}
          </span>
        </div>
      )}

      {/* Message */}
      <div
        style={{
          fontSize: '13px',
          color: theme.text,
          lineHeight: '1.5',
          marginBottom: '12px',
        }}
      >
        {issue.message}
      </div>

      {/* Suggestions */}
      {issue.suggestions.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: darkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '8px',
            }}
          >
            Suggestions:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {issue.suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onApplyFix(suggestion)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: theme.text,
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb';
                  e.currentTarget.style.borderColor = theme.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6';
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                → {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <ModernButton onClick={onIgnore} variant="secondary" size="sm">
          Ignore
        </ModernButton>
      </div>
    </div>
  );
}
