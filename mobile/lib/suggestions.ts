import { supabase } from "./supabase";
import type {
  Dish,
  DishIngredient,
  DishNutrientPerServing,
  Nutrient,
  Profile,
  RejectionReason,
} from "../types/database";

/** Monday of the current week, as YYYY-MM-DD, used to group weekly progress. */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export async function fetchNutrients(): Promise<Nutrient[]> {
  const { data, error } = await supabase
    .from("nutrients")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Nutrient[];
}

/** Weekly target per nutrient_id for this user (falls back to no entry if never set). */
export async function fetchWeeklyTargets(userId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("nutrient_targets")
    .select("nutrient_id, weekly_amount")
    .eq("user_id", userId);
  if (error) throw error;
  const targets: Record<string, number> = {};
  for (const row of data ?? []) targets[row.nutrient_id] = row.weekly_amount;
  return targets;
}

/** Sum of nutrients already logged this week from approved dishes in weekly_plans. */
export async function fetchWeekConsumed(userId: string, weekStart: string): Promise<Record<string, number>> {
  const { data: plans, error: plansError } = await supabase
    .from("weekly_plans")
    .select("dish_id, servings")
    .eq("user_id", userId)
    .eq("week_start", weekStart);
  if (plansError) throw plansError;
  if (!plans || plans.length === 0) return {};

  const dishIds = plans.map((p) => p.dish_id);
  const { data: dishNutrients, error: dnError } = await supabase
    .from("dish_nutrients_per_serving")
    .select("dish_id, nutrient_id, amount_per_serving")
    .in("dish_id", dishIds);
  if (dnError) throw dnError;

  const servingsByDish: Record<string, number> = {};
  for (const p of plans) servingsByDish[p.dish_id] = p.servings;

  const consumed: Record<string, number> = {};
  for (const row of (dishNutrients ?? []) as DishNutrientPerServing[]) {
    const servings = servingsByDish[row.dish_id] ?? 1;
    consumed[row.nutrient_id] = (consumed[row.nutrient_id] ?? 0) + row.amount_per_serving * servings;
  }
  return consumed;
}

interface CandidateOptions {
  profile: Profile;
  excludeDishIds: string[];
}

async function fetchCandidateDishes({ profile, excludeDishIds }: CandidateOptions): Promise<Dish[]> {
  let query = supabase.from("dishes").select("*").eq("cuisine", profile.cuisine);
  if (profile.avoid_meat) query = query.eq("contains_meat", false);
  if (profile.avoid_spicy) query = query.in("spice_level", ["none", "mild"]);
  if (excludeDishIds.length > 0) query = query.not("id", "in", `(${excludeDishIds.join(",")})`);

  const { data, error } = await query;
  if (error) throw error;
  let dishes = (data ?? []) as Dish[];

  if (profile.allergies?.length) {
    const { data: badIngredientRows } = await supabase
      .from("dish_ingredients_view")
      .select("dish_id, ingredient_name")
      .in("dish_id", dishes.map((d) => d.id));
    const dishIdsWithAllergen = new Set(
      (badIngredientRows ?? [])
        .filter((row: { dish_id: string; ingredient_name: string }) =>
          profile.allergies.some((a) => row.ingredient_name.toLowerCase().includes(a.toLowerCase()))
        )
        .map((row: { dish_id: string; ingredient_name: string }) => row.dish_id)
    );
    dishes = dishes.filter((d) => !dishIdsWithAllergen.has(d.id));
  }

  return dishes;
}

/** Dishes the user already approved or rejected this week — don't suggest them again. */
async function fetchThisWeeksSeenDishIds(userId: string, weekStart: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_dish_feedback")
    .select("dish_id, created_at")
    .eq("user_id", userId)
    .gte("created_at", weekStart);
  if (error) throw error;
  return [...new Set((data ?? []).map((r) => r.dish_id))];
}

/**
 * Score = how much of the remaining weekly gap this dish would fill, normalized
 * by each nutrient's target. Overshooting an already-met nutrient scores 0 for
 * that nutrient instead of being rewarded, so the ranking favors dishes that
 * plug the biggest current gaps rather than just the highest-calorie dish.
 */
function scoreDish(
  dishId: string,
  gap: Record<string, number>,
  targets: Record<string, number>,
  dishNutrientsByDish: Record<string, Record<string, number>>
): number {
  const amounts = dishNutrientsByDish[dishId] ?? {};
  let score = 0;
  for (const nutrientId of Object.keys(gap)) {
    const remaining = gap[nutrientId];
    if (remaining <= 0) continue;
    const target = targets[nutrientId] || 1;
    const contribution = Math.min(amounts[nutrientId] ?? 0, remaining);
    score += contribution / target;
  }
  return score;
}

export interface Suggestion {
  dish: Dish;
  nutrientsPerServing: Record<string, number>;
}

export async function getNextSuggestion(userId: string, profile: Profile): Promise<Suggestion | null> {
  const weekStart = getCurrentWeekStart();
  const [targets, consumed, seenDishIds] = await Promise.all([
    fetchWeeklyTargets(userId),
    fetchWeekConsumed(userId, weekStart),
    fetchThisWeeksSeenDishIds(userId, weekStart),
  ]);

  const gap: Record<string, number> = {};
  for (const nutrientId of Object.keys(targets)) {
    gap[nutrientId] = Math.max(0, targets[nutrientId] - (consumed[nutrientId] ?? 0));
  }

  const candidates = await fetchCandidateDishes({ profile, excludeDishIds: seenDishIds });
  if (candidates.length === 0) return null;

  const { data: dishNutrientRows, error } = await supabase
    .from("dish_nutrients_per_serving")
    .select("dish_id, nutrient_id, amount_per_serving")
    .in("dish_id", candidates.map((d) => d.id));
  if (error) throw error;

  const dishNutrientsByDish: Record<string, Record<string, number>> = {};
  for (const row of (dishNutrientRows ?? []) as DishNutrientPerServing[]) {
    dishNutrientsByDish[row.dish_id] ??= {};
    dishNutrientsByDish[row.dish_id][row.nutrient_id] = row.amount_per_serving;
  }

  const ranked = candidates
    .map((dish) => ({ dish, score: scoreDish(dish.id, gap, targets, dishNutrientsByDish) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0].dish;
  return { dish: top, nutrientsPerServing: dishNutrientsByDish[top.id] ?? {} };
}

export async function rejectDish(userId: string, dishId: string, reason: RejectionReason): Promise<void> {
  const { error } = await supabase
    .from("user_dish_feedback")
    .insert({ user_id: userId, dish_id: dishId, status: "rejected", reason });
  if (error) throw error;
}

export async function approveDish(userId: string, dishId: string, servings: number): Promise<void> {
  const weekStart = getCurrentWeekStart();
  const { error: feedbackError } = await supabase
    .from("user_dish_feedback")
    .insert({ user_id: userId, dish_id: dishId, status: "approved", reason: null });
  if (feedbackError) throw feedbackError;

  const { error: planError } = await supabase
    .from("weekly_plans")
    .insert({ user_id: userId, dish_id: dishId, week_start: weekStart, servings });
  if (planError) throw planError;
}

export interface PlannedDish {
  dishId: string;
  name: string;
  servings: number;
}

export async function fetchThisWeeksPlan(userId: string): Promise<PlannedDish[]> {
  const weekStart = getCurrentWeekStart();
  const { data, error } = await supabase
    .from("weekly_plans")
    .select("dish_id, servings, dishes(name)")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    dishId: row.dish_id,
    name: row.dishes?.name ?? "Dish",
    servings: row.servings,
  }));
}

export async function fetchDish(dishId: string): Promise<Dish> {
  const { data, error } = await supabase.from("dishes").select("*").eq("id", dishId).single();
  if (error) throw error;
  return data as Dish;
}

export async function fetchDishNutrients(dishId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("dish_nutrients_per_serving")
    .select("nutrient_id, amount_per_serving")
    .eq("dish_id", dishId);
  if (error) throw error;
  const result: Record<string, number> = {};
  for (const row of (data ?? []) as DishNutrientPerServing[]) result[row.nutrient_id] = row.amount_per_serving;
  return result;
}

export async function fetchDishIngredients(dishId: string, servings: number): Promise<DishIngredient[]> {
  const { data, error } = await supabase
    .from("dish_ingredients_view")
    .select("*")
    .eq("dish_id", dishId);
  if (error) throw error;
  return (data ?? []).map((row: DishIngredient) => ({
    ...row,
    quantity_grams_per_serving: row.quantity_grams_per_serving * servings,
  }));
}
