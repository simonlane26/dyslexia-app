import { useState, useEffect } from 'react';

export type OnboardingStep =
  | 'welcome'
  | 'struggles'
  | 'accessibility'
  | 'coach'
  | 'complete';

export interface OnboardingState {
  currentStep: OnboardingStep | null;
  hasCompletedOnboarding: boolean;
  struggles: string[];
  showFirstTypeCelebration: boolean;
  showFirstSaveCelebration: boolean;
}

const STORAGE_KEY = 'dyslexia-writer-onboarding';

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    currentStep: null,
    hasCompletedOnboarding: false,
    struggles: [],
    showFirstTypeCelebration: false,
    showFirstSaveCelebration: false,
  });

  // Load onboarding state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } else {
        // First time user - start onboarding
        setState((prev) => ({
          ...prev,
          currentStep: 'welcome',
        }));
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
      // Start fresh onboarding on error
      setState((prev) => ({
        ...prev,
        currentStep: 'welcome',
      }));
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, [state]);

  const goToNextStep = () => {
    setState((prev) => {
      const steps: OnboardingStep[] = ['welcome', 'struggles', 'accessibility', 'coach', 'complete'];
      const currentIndex = steps.indexOf(prev.currentStep as OnboardingStep);
      const nextStep = steps[currentIndex + 1] || 'complete';

      if (nextStep === 'complete') {
        return {
          ...prev,
          currentStep: null,
          hasCompletedOnboarding: true,
        };
      }

      return {
        ...prev,
        currentStep: nextStep,
      };
    });
  };

  const skipToEnd = () => {
    setState((prev) => ({
      ...prev,
      currentStep: null,
      hasCompletedOnboarding: true,
    }));
  };

  const setStruggles = (struggles: string[]) => {
    setState((prev) => ({
      ...prev,
      struggles,
    }));
  };

  const showFirstTypeCelebration = () => {
    setState((prev) => ({
      ...prev,
      showFirstTypeCelebration: true,
    }));
  };

  const hideFirstTypeCelebration = () => {
    setState((prev) => ({
      ...prev,
      showFirstTypeCelebration: false,
    }));
  };

  const showFirstSaveCelebration = () => {
    setState((prev) => ({
      ...prev,
      showFirstSaveCelebration: true,
    }));
  };

  const hideFirstSaveCelebration = () => {
    setState((prev) => ({
      ...prev,
      showFirstSaveCelebration: false,
    }));
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentStep: 'welcome',
      hasCompletedOnboarding: false,
      struggles: [],
      showFirstTypeCelebration: false,
      showFirstSaveCelebration: false,
    });
  };

  return {
    currentStep: state.currentStep,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    struggles: state.struggles,
    isShowingFirstTypeCelebration: state.showFirstTypeCelebration,
    isShowingFirstSaveCelebration: state.showFirstSaveCelebration,
    goToNextStep,
    skipToEnd,
    setStruggles,
    showFirstTypeCelebration,
    hideFirstTypeCelebration,
    showFirstSaveCelebration,
    hideFirstSaveCelebration,
    resetOnboarding,
  };
}
