export interface MealSlot {
  key: string;
  label: string;
  generate: boolean;
  additionalFamilyMembers: number;
  preferredCategories: string[];
}

export const DEFAULT_MEAL_SLOTS: MealSlot[] = [
  { key: "breakfast", label: "Breakfast", generate: false, additionalFamilyMembers: 0, preferredCategories: [] },
  { key: "lunch", label: "Lunch", generate: false, additionalFamilyMembers: 0, preferredCategories: [] },
  { key: "dinner", label: "Dinner", generate: true, additionalFamilyMembers: 0, preferredCategories: [] },
  { key: "snack", label: "Snack", generate: true, additionalFamilyMembers: 0, preferredCategories: [] },
];
