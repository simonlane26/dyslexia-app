// src/components/WritingTemplates.tsx
'use client';

import { useState } from 'react';
import { FileText, Mail, BookOpen, MessageSquare, X, Sparkles } from 'lucide-react';
import { ModernButton } from './ModernButton';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  content: string;
  category: 'essay' | 'letter' | 'story' | 'other';
}

const TEMPLATES: Template[] = [
  {
    id: 'essay-5paragraph',
    name: 'Five Paragraph Essay',
    description: 'Classic essay structure with introduction, body, and conclusion',
    icon: <FileText size={20} />,
    category: 'essay',
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
    name: 'Formal Letter',
    description: 'Professional business letter format',
    icon: <Mail size={20} />,
    category: 'letter',
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
    name: 'Complaint Letter',
    description: 'Template for writing a complaint or concern',
    icon: <MessageSquare size={20} />,
    category: 'letter',
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
    name: 'Story Outline',
    description: 'Basic story structure with beginning, middle, and end',
    icon: <BookOpen size={20} />,
    category: 'story',
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
    name: 'Professional Email',
    description: 'Standard professional email format',
    icon: <Mail size={20} />,
    category: 'letter',
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
    name: 'Thank You Note',
    description: 'Express gratitude professionally',
    icon: <Sparkles size={20} />,
    category: 'letter',
    content: `Dear [Name],

I wanted to take a moment to thank you for [what they did].

[Explain how their action helped you or made a difference]

I truly appreciate your [kindness/support/help/etc.], and I'm grateful to have [you/your support/etc.].

Thank you again.

Warm regards,
[Your Name]`,
  },
];

interface WritingTemplatesProps {
  onSelectTemplate: (content: string) => void;
  theme: any;
}

export function WritingTemplates({ onSelectTemplate, theme }: WritingTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'essay', label: 'Essays' },
    { id: 'letter', label: 'Letters' },
    { id: 'story', label: 'Stories' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template.content);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <ModernButton
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <FileText size={16} />
        Use Template
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
              Writing Templates
            </h2>
            <p style={{ fontSize: '14px', color: theme.text, opacity: 0.7, margin: '4px 0 0 0' }}>
              Choose a template to get started quickly
            </p>
          </div>
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
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
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
                    {template.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: theme.text,
                      margin: 0,
                    }}
                  >
                    {template.name}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    color: theme.text,
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
