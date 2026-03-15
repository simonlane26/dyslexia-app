// src/components/WritingTemplates.tsx
'use client';

import { useState } from 'react';
import { FileText, Mail, BookOpen, MessageSquare, X, Sparkles } from 'lucide-react';
import { ModernButton } from './ModernButton';
import { useT } from '@/lib/i18n';

type Category = 'essay' | 'letter' | 'story' | 'other';

const TEMPLATE_DEFS = [
  {
    id: 'essay-5paragraph',
    nameKey: 'templates.essay5p.name' as const,
    descKey: 'templates.essay5p.desc' as const,
    icon: <FileText size={20} />,
    category: 'essay' as Category,
    content: `Introduction
Write your opening paragraph here. Introduce your topic and state your main argument or thesis.

Body Paragraph 1
First main point supporting your thesis. Include evidence and examples.

Body Paragraph 2
Second main point supporting your thesis. Include evidence and examples.

Body Paragraph 3
Third main point supporting your thesis. Include evidence and examples.

Conclusion
Summarize your main points and restate your thesis in a new way. End with a strong closing statement.`,
  },
  {
    id: 'letter-formal',
    nameKey: 'templates.formal.name' as const,
    descKey: 'templates.formal.desc' as const,
    icon: <Mail size={20} />,
    category: 'letter' as Category,
    content: `[Your Name]
[Your Address]
[City, Postal Code]
[Email]
[Date]

[Recipient Name]
[Company/Organization]
[Address]
[City, Postal Code]

Dear [Recipient Name],

[Opening paragraph: State your purpose clearly]

[Middle paragraph: Provide details, explanations, or requests]

[Closing paragraph: Summarize and indicate next steps]

Yours sincerely,
[Your Name]`,
  },
  {
    id: 'letter-complaint',
    nameKey: 'templates.complaint.name' as const,
    descKey: 'templates.complaint.desc' as const,
    icon: <MessageSquare size={20} />,
    category: 'letter' as Category,
    content: `[Your Name]
[Your Address]
[Email]
[Date]

[Company Name]
[Company Address]

Dear Sir/Madam,

I am writing to express my concern regarding [describe the issue].

On [date], I [describe what happened in detail]. This has caused [explain the impact].

I would appreciate it if you could [state what you want them to do]. I look forward to hearing from you within [timeframe].

Thank you for your attention to this matter.

Yours faithfully,
[Your Name]`,
  },
  {
    id: 'story-structure',
    nameKey: 'templates.story.name' as const,
    descKey: 'templates.story.desc' as const,
    icon: <BookOpen size={20} />,
    category: 'story' as Category,
    content: `Title: [Your Story Title]

Beginning (Setup)
Introduce your main character(s), setting, and the normal world. What is life like before the adventure begins?

Middle (Conflict)
What problem or challenge does your character face? What happens as they try to solve it? Add exciting details and action!

End (Resolution)
How does your character solve the problem? What do they learn? How has their world changed?

The End`,
  },
  {
    id: 'email-professional',
    nameKey: 'templates.email.name' as const,
    descKey: 'templates.email.desc' as const,
    icon: <Mail size={20} />,
    category: 'letter' as Category,
    content: `Subject: [Clear subject line]

Dear [Name],

I hope this email finds you well.

[First paragraph: State your purpose]

[Second paragraph: Provide details or ask questions]

[Final paragraph: Call to action or next steps]

Best regards,
[Your Name]
[Your Title/Position]`,
  },
  {
    id: 'thank-you',
    nameKey: 'templates.thankYou.name' as const,
    descKey: 'templates.thankYou.desc' as const,
    icon: <Sparkles size={20} />,
    category: 'letter' as Category,
    content: `Dear [Name],

I wanted to take a moment to thank you for [what they did].

[Explain how their action helped you or made a difference]

I truly appreciate your [kindness/support/help/etc.], and I'm grateful to have [you/your support/etc.].

Thank you again.

Warm regards,
[Your Name]`,
  },
] as const;

interface WritingTemplatesProps {
  onSelectTemplate: (content: string) => void;
  theme: any;
}

export function WritingTemplates({ onSelectTemplate, theme }: WritingTemplatesProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all',    labelKey: 'templates.cat.all'     as const },
    { id: 'essay',  labelKey: 'templates.cat.essays'  as const },
    { id: 'letter', labelKey: 'templates.cat.letters' as const },
    { id: 'story',  labelKey: 'templates.cat.stories' as const },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATE_DEFS
    : TEMPLATE_DEFS.filter(tmpl => tmpl.category === selectedCategory);

  if (!isOpen) {
    return (
      <ModernButton variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
        <FileText size={16} />
        {t('templates.button')}
      </ModernButton>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
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
          maxWidth: '900px',
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
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: 0 }}>
              {t('templates.title')}
            </h2>
            <p style={{ fontSize: '14px', color: theme.text, opacity: 0.7, margin: '4px 0 0 0' }}>
              {t('templates.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            title="Close"
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: theme.text, opacity: 0.7 }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Category Filter */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${selectedCategory === cat.id ? theme.primary : theme.border}`,
                backgroundColor: selectedCategory === cat.id ? `${theme.primary}15` : 'transparent',
                color: selectedCategory === cat.id ? theme.primary : theme.text,
                fontSize: '14px',
                fontWeight: selectedCategory === cat.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => { onSelectTemplate(tmpl.content); setIsOpen(false); }}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${theme.border}`,
                  backgroundColor: theme.surface,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: `${theme.primary}15`,
                      color: theme.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tmpl.icon}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text, margin: 0 }}>
                    {t(tmpl.nameKey)}
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: theme.text, opacity: 0.7, margin: 0, lineHeight: 1.5 }}>
                  {t(tmpl.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
