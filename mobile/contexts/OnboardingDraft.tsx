import { createContext, useContext, useState, type PropsWithChildren } from "react";

interface OnboardingDraft {
  householdSize: number;
  avoidMeat: boolean;
  avoidSpicy: boolean;
  allergiesText: string;
}

interface OnboardingDraftState extends OnboardingDraft {
  setHouseholdSize: (n: number) => void;
  setAvoidMeat: (v: boolean) => void;
  setAvoidSpicy: (v: boolean) => void;
  setAllergiesText: (v: string) => void;
  reset: () => void;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  householdSize: 2,
  avoidMeat: false,
  avoidSpicy: false,
  allergiesText: "",
};

const OnboardingDraftContext = createContext<OnboardingDraftState>({
  ...DEFAULT_DRAFT,
  setHouseholdSize: () => {},
  setAvoidMeat: () => {},
  setAvoidSpicy: () => {},
  setAllergiesText: () => {},
  reset: () => {},
});

export function OnboardingDraftProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);

  const value: OnboardingDraftState = {
    ...draft,
    setHouseholdSize: (householdSize) => setDraft((d) => ({ ...d, householdSize })),
    setAvoidMeat: (avoidMeat) => setDraft((d) => ({ ...d, avoidMeat })),
    setAvoidSpicy: (avoidSpicy) => setDraft((d) => ({ ...d, avoidSpicy })),
    setAllergiesText: (allergiesText) => setDraft((d) => ({ ...d, allergiesText })),
    reset: () => setDraft(DEFAULT_DRAFT),
  };

  return <OnboardingDraftContext.Provider value={value}>{children}</OnboardingDraftContext.Provider>;
}

export function useOnboardingDraft() {
  return useContext(OnboardingDraftContext);
}
