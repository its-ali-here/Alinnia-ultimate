// The `recipes` and `foods` tables have no emoji/color columns — those are
// presentational only, so we derive them here instead of storing them in the DB.
const CATEGORY_EMOJI: Record<string, string> = {
  Protein: "🍗",
  Dairy: "🧀",
  Grains: "🍚",
  Produce: "🥬",
  "Fats & Oils": "🫒",
  Spices: "🌶️",
  Sweeteners: "🍯",
  "Fast Food": "🍔",
};

const CATEGORY_COLOR: Record<string, string> = {
  Protein: "#E8C39E",
  Dairy: "#F5E1A4",
  Grains: "#F5F0E1",
  Produce: "#C3E0A0",
  "Fats & Oils": "#DCE8A0",
  Spices: "#E3A469",
  Sweeteners: "#F2D98A",
  "Fast Food": "#D9A6A0",
};

const DEFAULT_FOOD_EMOJI = "🍽️";
const DEFAULT_FOOD_COLOR = "#EDEBD9";

export function foodEmoji(category: string | null) {
  return (category && CATEGORY_EMOJI[category]) || DEFAULT_FOOD_EMOJI;
}

export function foodColor(category: string | null) {
  return (category && CATEGORY_COLOR[category]) || DEFAULT_FOOD_COLOR;
}

const RECIPE_COLORS = ["#DDEBC7", "#E8C9A0", "#F2D9A0", "#CFE8B0", "#E8C39E", "#D9C9A3"];

// Deterministic so the same recipe always gets the same color across renders/screens.
export function recipeColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return RECIPE_COLORS[hash % RECIPE_COLORS.length];
}

export const RECIPE_EMOJI = "🍛";
