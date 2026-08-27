import { createContext, useContext, useState, type PropsWithChildren } from "react";

interface OnboardingDraft {
  cuisines: string[];
  adultsCount: number;
  childrenCount: number;
  needs: string[];
  whoCooks: string;
  avoids: string[];
  spiceLevel: number;
  favoriteRecipeIds: string[];
  cookingNightsPerWeek: number;
  remindersEnabled: boolean;
  // Read outside the new linear flow — see mobile/app/(setup)/diet-type.tsx
  // (reachable only from Preferences).
  dietType: string;
}

interface OnboardingDraftState extends OnboardingDraft {
  setCuisines: (cuisines: string[]) => void;
  toggleCuisine: (cuisine: string) => void;
  setAdultsCount: (n: number) => void;
  setChildrenCount: (n: number) => void;
  toggleNeed: (need: string) => void;
  setWhoCooks: (v: string) => void;
  toggleAvoid: (avoid: string) => void;
  setSpiceLevel: (n: number) => void;
  toggleFavoriteRecipe: (recipeId: string) => void;
  setCookingNightsPerWeek: (n: number) => void;
  setRemindersEnabled: (v: boolean) => void;
  setDietType: (key: string) => void;
  reset: () => void;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  cuisines: [],
  adultsCount: 2,
  childrenCount: 0,
  needs: [],
  whoCooks: "",
  avoids: [],
  spiceLevel: 3,
  favoriteRecipeIds: [],
  cookingNightsPerWeek: 5,
  remindersEnabled: false,
  dietType: "anything",
};

const noop = () => {};

const OnboardingDraftContext = createContext<OnboardingDraftState>({
  ...DEFAULT_DRAFT,
  setCuisines: noop,
  toggleCuisine: noop,
  setAdultsCount: noop,
  setChildrenCount: noop,
  toggleNeed: noop,
  setWhoCooks: noop,
  toggleAvoid: noop,
  setSpiceLevel: noop,
  toggleFavoriteRecipe: noop,
  setCookingNightsPerWeek: noop,
  setRemindersEnabled: noop,
  setDietType: noop,
  reset: noop,
});

function toggleInArray(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function OnboardingDraftProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);

  function set<K extends keyof OnboardingDraft>(key: K) {
    return (value: OnboardingDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  }

  const value: OnboardingDraftState = {
    ...draft,
    setCuisines: set("cuisines"),
    toggleCuisine: (cuisine) => setDraft((d) => ({ ...d, cuisines: toggleInArray(d.cuisines, cuisine) })),
    setAdultsCount: set("adultsCount"),
    setChildrenCount: set("childrenCount"),
    toggleNeed: (need) => setDraft((d) => ({ ...d, needs: toggleInArray(d.needs, need) })),
    setWhoCooks: set("whoCooks"),
    toggleAvoid: (avoid) => setDraft((d) => ({ ...d, avoids: toggleInArray(d.avoids, avoid) })),
    setSpiceLevel: set("spiceLevel"),
    toggleFavoriteRecipe: (recipeId) =>
      setDraft((d) => ({ ...d, favoriteRecipeIds: toggleInArray(d.favoriteRecipeIds, recipeId) })),
    setCookingNightsPerWeek: set("cookingNightsPerWeek"),
    setRemindersEnabled: set("remindersEnabled"),
    setDietType: set("dietType"),
    reset: () => setDraft(DEFAULT_DRAFT),
  };

  return <OnboardingDraftContext.Provider value={value}>{children}</OnboardingDraftContext.Provider>;
}

export function useOnboardingDraft() {
  return useContext(OnboardingDraftContext);
}
