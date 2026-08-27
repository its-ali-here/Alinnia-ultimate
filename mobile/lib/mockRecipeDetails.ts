import { TODAYS_PLAN } from "./mockPlan";

export interface RecipeIngredient {
  foodId: string;
  amount: number;
  unit: string;
  gramWeight: number;
}

export interface MockRecipeDetail {
  id: string;
  name: string;
  emoji: string;
  color: string;
  calories: number; // per serving
  carbsG: number;
  fatG: number;
  proteinG: number;
  prepMinutes: number;
  cookMinutes: number;
  prepareServings: number;
  familyMembers: number;
  ingredients: RecipeIngredient[];
  directions: string[];
}

export const RECIPE_DETAILS: Record<string, MockRecipeDetail> = {
  omelet: {
    id: "omelet", name: "Spinach, Swiss, and Egg White Omelet", emoji: "🍳", color: "#DDEBC7",
    calories: 251, carbsG: 4, fatG: 17, proteinG: 22,
    prepMinutes: 5, cookMinutes: 10, prepareServings: 2, familyMembers: 0,
    ingredients: [
      { foodId: "egg-white", amount: 4, unit: "large", gramWeight: 132 },
      { foodId: "spinach", amount: 1, unit: "cup", gramWeight: 30 },
      { foodId: "swiss-cheese", amount: 1, unit: "slice", gramWeight: 28 },
      { foodId: "olive-oil", amount: 1, unit: "tsp", gramWeight: 5 },
    ],
    directions: [
      "Whisk egg whites with a splash of water.",
      "Sauté spinach in olive oil, then add swiss cheese.",
      "Pour eggs over and fold into an omelet.",
    ],
  },
  smoothie: {
    id: "smoothie", name: "Banana Coconut Green Smoothie", emoji: "🥤", color: "#CFE8B0",
    calories: 328, carbsG: 55, fatG: 10, proteinG: 5,
    prepMinutes: 5, cookMinutes: 0, prepareServings: 1, familyMembers: 0,
    ingredients: [
      { foodId: "banana", amount: 1, unit: "medium", gramWeight: 118 },
      { foodId: "spinach", amount: 1, unit: "cup", gramWeight: 30 },
      { foodId: "coconut-milk", amount: 0.5, unit: "cup", gramWeight: 120 },
      { foodId: "honey", amount: 1, unit: "tbsp", gramWeight: 21 },
    ],
    directions: ["Add all ingredients to a blender.", "Blend until smooth and serve immediately."],
  },
  "korean-beef": {
    id: "korean-beef", name: "Korean Beef Bowl", emoji: "🍚", color: "#E8C9A0",
    calories: 606, carbsG: 55, fatG: 28, proteinG: 34,
    prepMinutes: 10, cookMinutes: 15, prepareServings: 4, familyMembers: 3,
    ingredients: [
      { foodId: "ground-beef", amount: 200, unit: "g", gramWeight: 200 },
      { foodId: "white-rice", amount: 1, unit: "cup", gramWeight: 158 },
      { foodId: "soy-sauce", amount: 1, unit: "tbsp", gramWeight: 16 },
      { foodId: "garlic", amount: 1, unit: "tbsp, minced", gramWeight: 9 },
      { foodId: "sesame-oil", amount: 1, unit: "tsp", gramWeight: 4.5 },
    ],
    directions: [
      "Brown the ground beef with garlic.",
      "Stir in soy sauce and sesame oil.",
      "Serve over white rice.",
    ],
  },
  "hard-boiled-eggs": {
    id: "hard-boiled-eggs", name: "Easy Hard-Boiled Eggs", emoji: "🥚", color: "#F5E6C8",
    calories: 72, carbsG: 0.4, fatG: 4.8, proteinG: 6.3,
    prepMinutes: 2, cookMinutes: 12, prepareServings: 1, familyMembers: 0,
    ingredients: [
      { foodId: "egg", amount: 1, unit: "large", gramWeight: 50 },
      { foodId: "salt", amount: 1, unit: "dash", gramWeight: 0.5 },
    ],
    directions: [
      "Place egg in a saucepan and cover with water.",
      "Bring to a boil, then cover and remove from heat for 11 minutes.",
      "Cool in ice water, peel, and season with salt.",
    ],
  },
  "chicken-caesar-salad": {
    id: "chicken-caesar-salad", name: "Chicken Caesar Salad", emoji: "🥗", color: "#DDEBC7",
    calories: 358, carbsG: 8, fatG: 20, proteinG: 35,
    prepMinutes: 10, cookMinutes: 12, prepareServings: 3, familyMembers: 2,
    ingredients: [
      { foodId: "chicken-breast", amount: 150, unit: "g", gramWeight: 150 },
      { foodId: "romaine-lettuce", amount: 2, unit: "cup, chopped", gramWeight: 94 },
      { foodId: "caesar-dressing", amount: 2, unit: "tbsp", gramWeight: 30 },
      { foodId: "parmesan-cheese", amount: 2, unit: "tbsp", gramWeight: 10 },
    ],
    directions: [
      "Grill the chicken breast and slice.",
      "Toss romaine with caesar dressing.",
      "Top with chicken and parmesan.",
    ],
  },
  "spinach-scramble": {
    id: "spinach-scramble", name: "Simple Spinach Scramble", emoji: "🍳", color: "#F2D9A0",
    calories: 252, carbsG: 3, fatG: 20, proteinG: 15,
    prepMinutes: 3, cookMinutes: 7, prepareServings: 1, familyMembers: 0,
    ingredients: [
      { foodId: "egg", amount: 3, unit: "large", gramWeight: 150 },
      { foodId: "spinach", amount: 1, unit: "cup", gramWeight: 30 },
      { foodId: "butter", amount: 1, unit: "tbsp", gramWeight: 14 },
      { foodId: "salt", amount: 1, unit: "dash", gramWeight: 0.5 },
    ],
    directions: [
      "Melt butter in a pan and wilt the spinach.",
      "Whisk eggs with salt and pour into the pan.",
      "Scramble until just set.",
    ],
  },
  "scrambled-eggs": {
    id: "scrambled-eggs", name: "Basic scrambled eggs", emoji: "🍳", color: "#F5E6C8",
    calories: 273, carbsG: 2, fatG: 21, proteinG: 19,
    prepMinutes: 2, cookMinutes: 6, prepareServings: 1, familyMembers: 0,
    ingredients: [
      { foodId: "egg", amount: 3, unit: "large", gramWeight: 150 },
      { foodId: "butter", amount: 1, unit: "tbsp", gramWeight: 14 },
      { foodId: "salt", amount: 1, unit: "dash", gramWeight: 0.5 },
      { foodId: "black-pepper", amount: 1, unit: "dash", gramWeight: 0.3 },
    ],
    directions: [
      "Whisk eggs with salt and pepper.",
      "Melt butter in a nonstick pan over medium heat.",
      "Add eggs and scramble to your liking.",
    ],
  },
  "chicken-teriyaki": {
    id: "chicken-teriyaki", name: "Easy Grilled Chicken Teriyaki", emoji: "🍗", color: "#E8C39E",
    calories: 227, carbsG: 9, fatG: 8, proteinG: 28,
    prepMinutes: 5, cookMinutes: 12, prepareServings: 1, familyMembers: 0,
    ingredients: [
      { foodId: "chicken-breast", amount: 150, unit: "g", gramWeight: 150 },
      { foodId: "teriyaki-sauce", amount: 2, unit: "tbsp", gramWeight: 36 },
      { foodId: "sesame-oil", amount: 1, unit: "tsp", gramWeight: 4.5 },
    ],
    directions: [
      "Marinate chicken in teriyaki sauce for 10 minutes.",
      "Grill chicken, brushing with sesame oil.",
      "Slice and serve.",
    ],
  },
  "sweet-potato": {
    id: "sweet-potato", name: "Microwaved sweet potato", emoji: "🍠", color: "#E3A469",
    calories: 112, carbsG: 26, fatG: 0.1, proteinG: 2,
    prepMinutes: 1, cookMinutes: 5, prepareServings: 1, familyMembers: 0,
    ingredients: [
      { foodId: "sweet-potato-raw", amount: 1, unit: "medium", gramWeight: 130 },
      { foodId: "salt", amount: 1, unit: "dash", gramWeight: 0.5 },
    ],
    directions: [
      "Pierce the sweet potato a few times with a fork.",
      "Microwave on high for 5 minutes until soft.",
    ],
  },
  "tuna-american": {
    id: "tuna-american", name: "All American Tuna", emoji: "🥪", color: "#D9C9A3",
    calories: 317, carbsG: 16, fatG: 17, proteinG: 24,
    prepMinutes: 8, cookMinutes: 0, prepareServings: 1, familyMembers: 0,
    ingredients: [
      { foodId: "canned-tuna", amount: 1, unit: "can", gramWeight: 85 },
      { foodId: "mayo", amount: 1, unit: "tbsp", gramWeight: 14 },
      { foodId: "white-bread", amount: 2, unit: "slice", gramWeight: 60 },
      { foodId: "celery", amount: 1, unit: "stalk", gramWeight: 40 },
    ],
    directions: ["Mix tuna, mayo, and chopped celery.", "Spread onto bread and serve."],
  },
  "grilled-chicken": {
    id: "grilled-chicken", name: "Easy Grilled Chicken", emoji: "🍗", color: "#E8C39E",
    calories: 316, carbsG: 1, fatG: 17, proteinG: 40,
    prepMinutes: 5, cookMinutes: 15, prepareServings: 2, familyMembers: 1,
    ingredients: [
      { foodId: "chicken-breast", amount: 180, unit: "g", gramWeight: 180 },
      { foodId: "olive-oil", amount: 1, unit: "tbsp", gramWeight: 14 },
      { foodId: "salt", amount: 1, unit: "dash", gramWeight: 0.5 },
      { foodId: "black-pepper", amount: 1, unit: "dash", gramWeight: 0.3 },
    ],
    directions: [
      "Rub chicken with olive oil, salt, and pepper.",
      "Grill 6-7 minutes per side until cooked through.",
    ],
  },
  "tuna-salad": {
    id: "tuna-salad", name: "Tuna Salad", emoji: "🥗", color: "#DDEBC7",
    calories: 237, carbsG: 4, fatG: 14, proteinG: 23,
    prepMinutes: 6, cookMinutes: 0, prepareServings: 1, familyMembers: 0,
    ingredients: [
      { foodId: "canned-tuna", amount: 1, unit: "can", gramWeight: 85 },
      { foodId: "mayo", amount: 1, unit: "tbsp", gramWeight: 14 },
      { foodId: "celery", amount: 1, unit: "stalk", gramWeight: 40 },
      { foodId: "red-onion", amount: 2, unit: "tbsp, chopped", gramWeight: 20 },
    ],
    directions: ["Mix tuna, mayo, celery, and red onion.", "Chill and serve over greens or bread."],
  },
};

export function getRecipeById(id: string): MockRecipeDetail | undefined {
  return RECIPE_DETAILS[id];
}

export interface ScheduledFoodEntry {
  date: string;
  mealLabel: string;
  recipeName: string;
  recipeId: string;
  servings: string;
}

// Cross-references today's plan against recipe ingredient lists to answer
// "which planned meals use this ingredient" for the food detail screen.
export function getScheduledFoodsForFood(foodId: string): ScheduledFoodEntry[] {
  const entries: ScheduledFoodEntry[] = [];
  for (const section of TODAYS_PLAN) {
    for (const item of section.items) {
      const recipe = RECIPE_DETAILS[item.id];
      if (recipe?.ingredients.some((ing) => ing.foodId === foodId)) {
        entries.push({
          date: "Today",
          mealLabel: section.label,
          recipeName: recipe.name,
          recipeId: recipe.id,
          servings: item.servings,
        });
      }
    }
  }
  return entries;
}
