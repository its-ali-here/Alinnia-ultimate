export type FoodSource = "usda" | "custom";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type PlanItemType = "recipe" | "food";
export type UnitSystem = "us" | "metric";
export type WhoCooks = "solo" | "helped" | "shared";
export type HouseholdNeed = "diabetic" | "pregnant" | "training_hard" | "fussy_eater" | "high_blood_pressure";
export type Avoid = "beef" | "seafood" | "eggs" | "nuts" | "dairy";
export type CookingNightsPerWeek = 3 | 5 | 7;

export interface Profile {
  id: string;
  household_size: number;
  adults_count: number;
  children_count: number;
  cuisines: string[];
  household_needs: HouseholdNeed[];
  who_cooks: WhoCooks | null;
  avoids: Avoid[];
  spice_level: number | null;
  cooking_nights_per_week: CookingNightsPerWeek;
  favorite_recipe_ids: string[];
  onboarded: boolean;
  reminders_enabled: boolean;
  unit_system: UnitSystem;
  created_at: string;
  updated_at: string;
}

export interface Nutrient {
  id: string;
  key: string;
  label: string;
  unit: string;
  category: "macro" | "vitamin" | "mineral";
  sort_order: number;
  default_weekly_amount?: number;
}

export interface NutrientTarget {
  user_id: string;
  nutrient_id: string;
  daily_amount: number;
}

export interface Food {
  id: string;
  name: string;
  source: FoodSource;
  owner_id: string | null;
  category: string | null;
  serving_size: number;
  serving_unit: string;
  calories_per_serving: number;
  protein_g_per_serving: number | null;
  carbs_g_per_serving: number | null;
  fat_g_per_serving: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodNutrient {
  food_id: string;
  nutrient_id: string;
  amount_per_100g: number;
}

export interface Recipe {
  id: string;
  owner_id: string | null; // null = global "Featured" recipe
  name: string;
  description: string | null;
  cuisine: string | null;
  image_url: string | null;
  youtube_url: string | null;
  servings: number;
  prep_minutes: number | null;
  cook_minutes: number | null;
  meal_types: MealType[];
  calories_per_serving: number;
  protein_g_per_serving: number | null;
  carbs_g_per_serving: number | null;
  fat_g_per_serving: number | null;
  directions: string[];
  created_at: string;
  updated_at: string;
}

export interface RecipeFood {
  id: string;
  recipe_id: string;
  food_id: string;
  quantity: number;
  unit: string;
  sort_order: number;
}

export interface PlanMealSlotRow {
  id: string;
  user_id: string;
  plan_date: string; // ISO date
  meal_slot_key: string;
  skipped: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanEntry {
  id: string;
  slot_id: string;
  user_id: string;
  item_type: PlanItemType;
  recipe_id: string | null;
  food_id: string | null;
  servings: number;
  sort_order: number;
  created_at: string;
  logged_at: string | null;
}
