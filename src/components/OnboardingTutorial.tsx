// src/components/OnboardingTutorial.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { ModernButton } from './ModernButton';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Dyslexia Writer!',
    description: 'A dyslexia-friendly writing app with powerful tools to help you write, simplify, and listen to your text. Let\'s take a quick tour!',
    icon: '👋',
  },
  {
    title: 'Write with Your Voice',
    description: 'Click the "Dictate" button to start voice typing. Your words will appear as you speak. Perfect for when typing is difficult!',
    icon: '🎤',
  },
  {
    title: 'Simplify Complex Text',
    description: 'Click "Simplify" to make your text easier to read. Our AI rewrites complex sentences into simpler language.',
    icon: '✨',
  },
  {
    title: 'Listen to Your Writing',
    description: 'Click "Read Aloud" to hear your text spoken back to you. Great for catching mistakes and improving flow!',
    icon: '🔊',
  },
  {
    title: 'Customize Your Experience',
    description: 'Click the Settings button (⚙️) to change fonts, colors, and text size. Find what works best for you!',
    icon: '🎨',
  },
  {
    title: 'Save Your Work',
    description: 'Your work auto-saves every 10 seconds! You can also manually save and access all your documents from the Document Manager.',
    icon: '💾',
  },
  {
    title: 'Quick Templates',
    description: 'Use "Quick Templates" to start with pre-formatted structures for essays, letters, and stories.',
    icon: '📝',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Press "?" to see all keyboard shortcuts. Power users can work faster with Ctrl+S to save, Ctrl+Shift+S to simplify, and more!',
    icon: '⌨️',
  },
  {
    title: 'You\'re All Set!',
    description: 'You\'re ready to start writing! Remember, you can always revisit this tutorial from the help menu. Happy writing!',
    icon: '🎉',
  },
];

interface OnboardingTutorialProps {
  theme: any;
  onComplete?: () => void;
}

export function OnboardingTutorial({ theme, onComplete }: OnboardingTutorialProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  // Check if user has seen onboarding
  useEffect(() => {
    const seen = localStorage.getItem('dyslexia-onboarding-seen');
    if (!seen) {
      setHasSeenOnboarding(false);
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('dyslexia-onboarding-seen', 'true');
    setHasSeenOnboarding(true);
    if (onComplete) onComplete();
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  // Manual open function for help menu
  useEffect(() => {
    (window as any).__openOnboarding = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    return () => {
      delete (window as any).__openOnboarding;
    };
  }, []);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={handleSkip}
    >
      <div
        style={{
          backgroundColor: theme.bg,
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
          maxWidth: '600px',
          width: '100%',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px', lineHeight: 1 }}>{step.icon}</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: 0 }}>
              {step.title}
            </h2>
          </div>
          <button
            onClick={handleSkip}
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

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.7,
              color: theme.text,
              margin: 0,
            }}
          >
            {step.description}
          </p>

          {/* Progress indicators */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '32px',
              justifyContent: 'center',
            }}
          >
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                style={{
                  width: index === currentStep ? '32px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor:
                    index === currentStep
                      ? theme.primary
                      : index < currentStep
                      ? theme.success
                      : `${theme.border}`,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 24px',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '14px', color: theme.text, opacity: 0.6 }}>
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep > 0 && (
              <ModernButton variant="secondary" size="sm" onClick={handlePrev}>
                <ChevronLeft size={16} />
                Back
              </ModernButton>
            )}

            <ModernButton variant="primary" size="sm" onClick={handleNext}>
              {isLastStep ? (
                <>
                  <Check size={16} />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </ModernButton>
          </div>
        </div>
      </div>
    </div>
  );
}
