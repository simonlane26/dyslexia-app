'use client';

import { useEffect } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

interface SuccessCelebrationProps {
  type: 'first-type' | 'first-save';
  onClose: () => void;
  theme: any;
  darkMode: boolean;
}

export function SuccessCelebration({
  type,
  onClose,
  theme,
  darkMode,
}: SuccessCelebrationProps) {
  // Auto-hide after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    'first-type': {
      icon: <Sparkles size={32} />,
      color: '#f59e0b',
      title: 'Great start!',
      message: "You're already doing better than you think.",
    },
    'first-save': {
      icon: <CheckCircle size={32} />,
      color: '#10b981',
      title: 'Saved!',
      message: "You're safe here 👍",
    },
  };

  const { icon, color, title, message } = config[type];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 1000,
        backgroundColor: theme.bg,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        border: `2px solid ${color}`,
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.text,
              marginBottom: '4px',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '15px',
              color: theme.text,
              opacity: 0.8,
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>

        {/* Close hint */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: theme.text,
            opacity: 0.4,
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px',
          }}
        >
          ×
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
