"use client"

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- Types ---
type DataLocation = 'cloud' | 'local' | 'other';

interface OnboardingData {
  // User registration data
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  industry?: string;
  dataLocation?: DataLocation;
  agreedToTerms?: boolean;
  plan?: string;
  paymentConfirmed?: boolean;
  
  // Project wizard data
  projectName?: string;
  siteType?: 'empty' | 'existing' | '';
  projectType?: 'residential' | 'commercial' | '';
  constructionPath?: 'masonry' | 'timber' | 'precision' | '';
  scopeOfWork?: 'construction' | 'extension' | 'renovation' | '';
  selectedPhases?: string[];
  isProjectUnderway?: boolean;
  completedPhases?: string[];
  hasBasement?: boolean;
  city?: string;
  country?: string;
  area?: string;
  floors?: string;
  hasDrawings?: boolean;
  drawings?: File[];
  budget?: string;
  startDate?: string;
  timeline?: string;
}

interface OnboardingContextType {
  step: number;
  data: OnboardingData;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepNumber: number) => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
  isSubmitting: boolean;
  startSubmitting: () => void;
  stopSubmitting: () => void;
}

// --- Context Definition ---
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// --- Provider Component ---
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STEPS = [
    '/auth/signup/start',
    '/auth/signup/wizard',
    '/auth/signup/setup',
  ];

  useEffect(() => {
    const navigateToStep = (stepNumber: number) => {
      if (stepNumber > 0 && stepNumber <= STEPS.length) {
        router.push(STEPS[stepNumber - 1]);
      }
    };
    navigateToStep(step);
  }, [step]);

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const goToStep = (stepNumber: number) => {
    setStep(stepNumber);
  };
  
  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const startSubmitting = () => {
    setIsSubmitting(true);
  }

  const stopSubmitting = () => {
    setIsSubmitting(false);
  }

  const resetOnboarding = () => {
    setStep(1);
    setData({});
    setIsSubmitting(false);
  }

  const value = useMemo(() => ({
    step,
    data,
    nextStep,
    prevStep,
    goToStep,
    updateData,
    resetOnboarding,
    isSubmitting,
    startSubmitting,
    stopSubmitting
  }), [step, data, isSubmitting]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// --- Hook ---
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}