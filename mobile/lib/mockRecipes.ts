export interface MockRecipe {
  id: string;
  name: string;
  calories: number;
  emoji: string;
  color: string;
}

export const FEATURED_RECIPES: MockRecipe[] = [
  { id: "hard-boiled-eggs", name: "Easy Hard-Boiled Eggs", calories: 72, emoji: "🥚", color: "#F5E6C8" },
  { id: "chicken-caesar-salad", name: "Chicken Caesar Salad", calories: 358, emoji: "🥗", color: "#DDEBC7" },
  { id: "spinach-scramble", name: "Simple Spinach Scramble", calories: 252, emoji: "🍳", color: "#F2D9A0" },
  { id: "scrambled-eggs", name: "Basic scrambled eggs", calories: 273, emoji: "🍳", color: "#F5E6C8" },
  { id: "chicken-teriyaki", name: "Easy Grilled Chicken Teriyaki", calories: 227, emoji: "🍗", color: "#E8C39E" },
  { id: "sweet-potato", name: "Microwaved sweet potato", calories: 112, emoji: "🍠", color: "#E3A469" },
  { id: "tuna-american", name: "All American Tuna", calories: 317, emoji: "🥪", color: "#D9C9A3" },
  { id: "grilled-chicken", name: "Easy Grilled Chicken", calories: 316, emoji: "🍗", color: "#E8C39E" },
  { id: "tuna-salad", name: "Tuna Salad", calories: 237, emoji: "🥗", color: "#DDEBC7" },
];
