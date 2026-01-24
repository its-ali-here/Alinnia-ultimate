"use client"

import React, { createContext, useContext, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// --- Types ---
type Plan = 'starter' | 'professional';
type DataLocation = 'cloud' | 'local' | 'other';

interface OnboardingData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  dataLocation?: DataLocation;
  agreedToTerms?: boolean;
  plan?: Plan;
  // We won't store actual payment details, just a flag
  paymentConfirmed?: boolean;
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
    '/onboarding/start',
    '/onboarding/details',
    '/onboarding/plans',
    '/onboarding/payment',
    '/onboarding/setup',
  ];

  const navigateToStep = (stepNumber: number) => {
    if (stepNumber > 0 && stepNumber <= STEPS.length) {
      router.push(STEPS[stepNumber - 1]);
    }
  };

  const nextStep = () => {
    setStep(prev => {
      const next = prev + 1;
      navigateToStep(next);
      return next;
    });
  };

  const prevStep = () => {
    setStep(prev => {
      const next = prev - 1;
      navigateToStep(next);
      return next;
    });
  };

  const goToStep = (stepNumber: number) => {
    setStep(stepNumber);
    navigateToStep(stepNumber);
  };
  
  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const startSubmitting = () => {
    setIsSubmitting(true);
  }

  const resetOnboarding = () => {
    setStep(1);
    setData({});
    setIsSubmitting(false);
    router.push(STEPS[0]);
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
    startSubmitting
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
