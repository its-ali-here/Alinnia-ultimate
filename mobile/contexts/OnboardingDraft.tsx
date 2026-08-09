import { createContext, useContext, useState, type PropsWithChildren } from "react";
import type {
  ActivityLevel,
  BioSex,
  BodyFat,
  GeneralGoal,
  GoalMode,
  UnitSystem,
} from "../lib/estimateNutrition";
import { DEFAULT_MEAL_SLOTS, type MealSlot } from "../lib/mealSlots";

interface OnboardingDraft {
  householdSize: number;
  avoidMeat: boolean;
  avoidSpicy: boolean;
  allergiesText: string;
  calories: number;
  meals: number;
  dietType: string;
  carbsG: number;
  fatG: number;
  proteinG: number;
  unitSystem: UnitSystem;
  energyUnit: string;
  heightFeet: number;
  heightInches: number;
  heightCm: number;
  weightLb: number;
  weightKg: number;
  bioSex: BioSex;
  age: number;
  bodyFat: BodyFat;
  goalMode: GoalMode;
  goalGeneral: GeneralGoal;
  goalWeight: number;
  weightChangeRate: number;
  activityLevel: ActivityLevel;
  allergies: string[];
  mealSlots: MealSlot[];
  remindersEnabled: boolean;
}

interface OnboardingDraftState extends OnboardingDraft {
  setHouseholdSize: (n: number) => void;
  setAvoidMeat: (v: boolean) => void;
  setAvoidSpicy: (v: boolean) => void;
  setAllergiesText: (v: string) => void;
  setCalories: (n: number) => void;
  setMeals: (n: number) => void;
  setDietType: (key: string) => void;
  setMacros: (macros: { carbsG: number; fatG: number; proteinG: number }) => void;
  setUnitSystem: (v: UnitSystem) => void;
  setEnergyUnit: (v: string) => void;
  setHeightFeet: (n: number) => void;
  setHeightInches: (n: number) => void;
  setHeightCm: (n: number) => void;
  setWeightLb: (n: number) => void;
  setWeightKg: (n: number) => void;
  setBioSex: (v: BioSex) => void;
  setAge: (n: number) => void;
  setBodyFat: (v: BodyFat) => void;
  setGoalMode: (v: GoalMode) => void;
  setGoalGeneral: (v: GeneralGoal) => void;
  setGoalWeight: (n: number) => void;
  setWeightChangeRate: (n: number) => void;
  setActivityLevel: (v: ActivityLevel) => void;
  toggleAllergy: (allergy: string) => void;
  removeMealSlot: (key: string) => void;
  updateMealSlot: (key: string, patch: Partial<MealSlot>) => void;
  enableAllMeals: () => void;
  setRemindersEnabled: (v: boolean) => void;
  reset: () => void;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  householdSize: 2,
  avoidMeat: false,
  avoidSpicy: false,
  allergiesText: "",
  calories: 1800,
  meals: 4,
  dietType: "anything",
  carbsG: 90,
  fatG: 40,
  proteinG: 90,
  unitSystem: "us",
  energyUnit: "calories",
  heightFeet: 5,
  heightInches: 7,
  heightCm: 170,
  weightLb: 150,
  weightKg: 68,
  bioSex: "female",
  age: 30,
  bodyFat: "medium",
  goalMode: "general",
  goalGeneral: "maintain",
  goalWeight: 150,
  weightChangeRate: 1,
  activityLevel: "sedentary",
  allergies: [],
  mealSlots: DEFAULT_MEAL_SLOTS,
  remindersEnabled: false,
};

const noop = () => {};

const OnboardingDraftContext = createContext<OnboardingDraftState>({
  ...DEFAULT_DRAFT,
  setHouseholdSize: noop,
  setAvoidMeat: noop,
  setAvoidSpicy: noop,
  setAllergiesText: noop,
  setCalories: noop,
  setMeals: noop,
  setDietType: noop,
  setMacros: noop,
  setUnitSystem: noop,
  setEnergyUnit: noop,
  setHeightFeet: noop,
  setHeightInches: noop,
  setHeightCm: noop,
  setWeightLb: noop,
  setWeightKg: noop,
  setBioSex: noop,
  setAge: noop,
  setBodyFat: noop,
  setGoalMode: noop,
  setGoalGeneral: noop,
  setGoalWeight: noop,
  setWeightChangeRate: noop,
  setActivityLevel: noop,
  toggleAllergy: noop,
  removeMealSlot: noop,
  updateMealSlot: noop,
  enableAllMeals: noop,
  setRemindersEnabled: noop,
  reset: noop,
});

export function OnboardingDraftProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);

  function set<K extends keyof OnboardingDraft>(key: K) {
    return (value: OnboardingDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  }

  const value: OnboardingDraftState = {
    ...draft,
    setHouseholdSize: set("householdSize"),
    setAvoidMeat: set("avoidMeat"),
    setAvoidSpicy: set("avoidSpicy"),
    setAllergiesText: set("allergiesText"),
    setCalories: set("calories"),
    setMeals: set("meals"),
    setDietType: set("dietType"),
    setMacros: ({ carbsG, fatG, proteinG }) => setDraft((d) => ({ ...d, carbsG, fatG, proteinG })),
    setUnitSystem: set("unitSystem"),
    setEnergyUnit: set("energyUnit"),
    setHeightFeet: set("heightFeet"),
    setHeightInches: set("heightInches"),
    setHeightCm: set("heightCm"),
    setWeightLb: set("weightLb"),
    setWeightKg: set("weightKg"),
    setBioSex: set("bioSex"),
    setAge: set("age"),
    setBodyFat: set("bodyFat"),
    setGoalMode: set("goalMode"),
    setGoalGeneral: set("goalGeneral"),
    setGoalWeight: set("goalWeight"),
    setWeightChangeRate: set("weightChangeRate"),
    setActivityLevel: set("activityLevel"),
    toggleAllergy: (allergy) =>
      setDraft((d) => ({
        ...d,
        allergies: d.allergies.includes(allergy) ? d.allergies.filter((a) => a !== allergy) : [...d.allergies, allergy],
      })),
    removeMealSlot: (key) => setDraft((d) => ({ ...d, mealSlots: d.mealSlots.filter((m) => m.key !== key) })),
    updateMealSlot: (key, patch) =>
      setDraft((d) => ({ ...d, mealSlots: d.mealSlots.map((m) => (m.key === key ? { ...m, ...patch } : m)) })),
    enableAllMeals: () => setDraft((d) => ({ ...d, mealSlots: d.mealSlots.map((m) => ({ ...m, generate: true })) })),
    setRemindersEnabled: set("remindersEnabled"),
    reset: () => setDraft(DEFAULT_DRAFT),
  };

  return <OnboardingDraftContext.Provider value={value}>{children}</OnboardingDraftContext.Provider>;
}

export function useOnboardingDraft() {
  return useContext(OnboardingDraftContext);
}
