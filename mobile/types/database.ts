export type SpiceLevel = "none" | "mild" | "medium" | "hot";
export type FeedbackStatus = "approved" | "rejected";
export type RejectionReason = "no_meat" | "too_spicy" | "avoid_ingredient" | "not_in_mood" | "other";

export interface Profile {
  id: string;
  household_size: number;
  cuisine: string;
  avoid_meat: boolean;
  avoid_spicy: boolean;
  allergies: string[];
  onboarded: boolean;
  created_at: string;
}

export interface Nutrient {
  id: string;
  key: string;
  label: string;
  unit: string;
  category: "macro" | "vitamin" | "mineral";
  sort_order: number;
}

export interface NutrientTarget {
  user_id: string;
  nutrient_id: string;
  weekly_amount: number;
}

export interface Dish {
  id: string;
  name: string;
  cuisine: string;
  description: string | null;
  spice_level: SpiceLevel;
  contains_meat: boolean;
  tags: string[];
  image_url: string | null;
}

export interface DishNutrientPerServing {
  dish_id: string;
  nutrient_id: string;
  amount_per_serving: number;
}

export interface DishIngredient {
  dish_id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity_grams_per_serving: number;
}

export interface UserDishFeedback {
  id: string;
  user_id: string;
  dish_id: string;
  status: FeedbackStatus;
  reason: RejectionReason | null;
  created_at: string;
}

export interface WeeklyPlanEntry {
  id: string;
  user_id: string;
  dish_id: string;
  week_start: string;
  servings: number;
  created_at: string;
}

