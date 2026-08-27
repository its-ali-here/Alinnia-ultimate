export interface PlanMealItem {
  id: string;
  name: string;
  servings: string;
  calories: number;
  emoji: string;
  color: string;
}

export interface PlanMealSection {
  key: string;
  label: string;
  calories: number;
  skipped?: boolean;
  items: PlanMealItem[];
}

export const TODAYS_PLAN: PlanMealSection[] = [
  {
    key: "breakfast",
    label: "Breakfast",
    calories: 580,
    items: [
      { id: "omelet", name: "Spinach, Swiss, and Egg White Omelet", servings: "2 serving", calories: 251, emoji: "🍳", color: "#DDEBC7" },
      { id: "smoothie", name: "Banana Coconut Green Smoothie", servings: "1 serving", calories: 328, emoji: "🥤", color: "#CFE8B0" },
    ],
  },
  { key: "lunch", label: "Lunch", calories: 0, skipped: true, items: [] },
  {
    key: "dinner",
    label: "Dinner",
    calories: 606,
    items: [{ id: "korean-beef", name: "Korean Beef Bowl", servings: "1 serving", calories: 606, emoji: "🍚", color: "#E8C9A0" }],
  },
];

