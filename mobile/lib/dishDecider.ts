import { supabase } from "./supabase";
import { RECIPE_EMOJI, recipeColor } from "./foodIcons";
import type { Profile } from "../types/database";

export interface DinnerCandidate {
  id: string;
  name: string;
  cuisine: string | null;
  calories_per_serving: number;
  protein_g_per_serving: number | null;
  carbs_g_per_serving: number | null;
  fat_g_per_serving: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number;
  image_url: string | null;
}

export interface MoodFilters {
  noMeat: boolean;
  meatOnly: boolean;
  quick: boolean;
  light: boolean;
}

export const DEFAULT_MOOD_FILTERS: MoodFilters = {
  noMeat: false,
  meatOnly: false,
  quick: false,
  light: false,
};

// Same name-matching workaround planCycle.ts used — there's no `contains_meat`
// tag anywhere in the schema, so "No meat" means matching against the known
// seeded meat/fish/shellfish foods. Eggs, paneer, tofu, lentils, and
// chickpeas are deliberately not meat.
const MEAT_FOOD_NAMES = [
  "Chicken breast, skinless",
  "Chicken thigh, skinless",
  "Ground beef, 80/20",
  "Salmon, Atlantic",
  "Mutton (lamb), lean, raw",
  "Beef, boneless chuck, raw",
  "Shrimp (prawns), raw",
  "Zinger Burger",
];

// Household "avoids" (see supabase/migrations/0003_household_onboarding.sql)
// are hard exclusions, unlike the mood bubbles below which are per-session
// nudges — same name-matching approach as MEAT_FOOD_NAMES, since recipes
// carry no ingredient tags to filter on directly.
const AVOID_FOOD_NAMES: Record<string, string[]> = {
  beef: ["Ground beef, 80/20", "Beef, boneless chuck, raw"],
  seafood: ["Salmon, Atlantic", "Shrimp (prawns), raw"],
  eggs: ["Egg, whole"],
  nuts: ["Peanut butter"],
  dairy: [
    "Greek yogurt, plain whole milk",
    "Milk, whole",
    "Milk, skim",
    "Cheddar cheese",
    "Butter",
    "Yogurt (dahi), plain whole milk",
    "UHT Milk",
    "Paneer",
    "Ghee",
  ],
};

const QUICK_MAX_MINUTES = 30;
const LIGHT_MAX_CALORIES = 500;

async function getRecipeIdsContainingFoods(foodNames: string[]): Promise<Set<string>> {
  if (foodNames.length === 0) return new Set();
  const { data: foods } = await supabase.from("foods").select("id").in("name", foodNames);
  const foodIds = (foods ?? []).map((f: any) => f.id);
  if (foodIds.length === 0) return new Set();

  const { data: recipeFoods } = await supabase.from("recipe_foods").select("recipe_id").in("food_id", foodIds);
  return new Set((recipeFoods ?? []).map((rf: any) => rf.recipe_id));
}

export function getMeatRecipeIds(): Promise<Set<string>> {
  return getRecipeIdsContainingFoods(MEAT_FOOD_NAMES);
}

function getAvoidRecipeIds(avoids: string[]): Promise<Set<string>> {
  return getRecipeIdsContainingFoods(avoids.flatMap((a) => AVOID_FOOD_NAMES[a] ?? []));
}

export interface DinnerCandidateOptions {
  cuisines: string[];
  avoids: string[];
  favoriteRecipeIds: string[];
}

export function candidateOptionsFromProfile(profile: Profile): DinnerCandidateOptions {
  return { cuisines: profile.cuisines, avoids: profile.avoids, favoriteRecipeIds: profile.favorite_recipe_ids };
}

// Household-level filtering shared by the pre-auth "Tonight" onboarding
// screen and the in-app Dish Decider tab, so the two never drift apart.
export async function fetchDinnerCandidates(options: DinnerCandidateOptions): Promise<DinnerCandidate[]> {
  const { data } = await supabase
    .from("recipes")
    .select(
      "id,name,cuisine,calories_per_serving,protein_g_per_serving,carbs_g_per_serving,fat_g_per_serving,prep_minutes,cook_minutes,servings,image_url,meal_types"
    )
    .contains("meal_types", ["dinner"]);

  let candidates: DinnerCandidate[] = data ?? [];

  const avoidIds = await getAvoidRecipeIds(options.avoids);
  if (avoidIds.size > 0) candidates = candidates.filter((c) => !avoidIds.has(c.id));

  if (options.cuisines.length > 0) {
    const matchingCuisine = candidates.filter((c) => c.cuisine && options.cuisines.includes(c.cuisine));
    if (matchingCuisine.length > 0) candidates = matchingCuisine;
  }

  // Favorites surface first but never exclude the rest of the filtered pool.
  const favorites = candidates.filter((c) => options.favoriteRecipeIds.includes(c.id));
  const rest = candidates.filter((c) => !options.favoriteRecipeIds.includes(c.id));
  return [...favorites, ...rest];
}

export async function fetchCandidateIngredients(recipeId: string): Promise<string[]> {
  const { data } = await supabase
    .from("recipe_foods")
    .select("food:foods(name)")
    .eq("recipe_id", recipeId)
    .limit(5);

  if (!data) return [];
  return data
    .map((d: any) => d.food?.name?.replace(/,\s*(raw|cooked|skinless|whole|boneless chuck)/gi, ""))
    .filter(Boolean);
}

// Session-only nudges, layered on top of fetchDinnerCandidates' pool — never
// persisted to the household's profile.
export function applyMoodFilters(
  candidates: DinnerCandidate[],
  filters: MoodFilters,
  meatRecipeIds: Set<string>
): DinnerCandidate[] {
  let pool = candidates;
  if (filters.noMeat) pool = pool.filter((c) => !meatRecipeIds.has(c.id));
  if (filters.meatOnly) pool = pool.filter((c) => meatRecipeIds.has(c.id));
  if (filters.quick) pool = pool.filter((c) => (c.prep_minutes ?? 0) + (c.cook_minutes ?? 0) <= QUICK_MAX_MINUTES);
  if (filters.light) pool = pool.filter((c) => c.calories_per_serving <= LIGHT_MAX_CALORIES);
  return pool;
}

export function pickCandidate(candidates: DinnerCandidate[], excludeIds: Set<string> = new Set()): DinnerCandidate | null {
  if (candidates.length === 0) return null;
  const fresh = candidates.filter((c) => !excludeIds.has(c.id));
  const pool = fresh.length > 0 ? fresh : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function recipeDisplay(candidate: DinnerCandidate) {
  return { emoji: RECIPE_EMOJI, color: recipeColor(candidate.id) };
}

export function explainMatch(candidate: DinnerCandidate, filters: MoodFilters): string {
  const reasons: string[] = [];
  if (filters.noMeat) reasons.push("100% vegetarian");
  else if (filters.meatOnly) reasons.push("protein-rich meat dinner");
  if (filters.quick) reasons.push("ready in under 30 mins");
  if (filters.light) reasons.push("light & balanced calories");
  if (candidate.cuisine) reasons.push(`${candidate.cuisine} specialty`);

  if (reasons.length === 0) {
    if (candidate.protein_g_per_serving && candidate.protein_g_per_serving > 25) {
      return `Rich in protein (${Math.round(candidate.protein_g_per_serving)}g) and perfect for tonight.`;
    }
    return "A household favorite packed with authentic flavor.";
  }
  if (reasons.length === 1) return `This dish is ${reasons[0]}.`;
  return `This dish is ${reasons.slice(0, -1).join(", ")} and ${reasons[reasons.length - 1]}.`;
}

// ---------------------------------------------------------------
// In-app (authenticated) persistence: a single fixed "dinner" slot per day,
// reusing plan_meal_slots/plan_entries rather than a new table — see the
// redesign plan's "Dish Decider main-app tab" section.
// ---------------------------------------------------------------

const DINNER_SLOT_KEY = "dinner";

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getRecentDinnerRecipeIds(userId: string, beforeDateISO: string, lookbackDays = 3): Promise<Set<string>> {
  const before = new Date(beforeDateISO);
  const from = new Date(before);
  from.setDate(from.getDate() - lookbackDays);
  const fromISO = toISODate(from);

  const { data: slots } = await supabase
    .from("plan_meal_slots")
    .select("id")
    .eq("user_id", userId)
    .eq("meal_slot_key", DINNER_SLOT_KEY)
    .gte("plan_date", fromISO)
    .lt("plan_date", beforeDateISO);

  const slotIds = (slots ?? []).map((s: any) => s.id);
  if (slotIds.length === 0) return new Set();

  const { data: entries } = await supabase.from("plan_entries").select("recipe_id").in("slot_id", slotIds).not("recipe_id", "is", null);
  return new Set((entries ?? []).map((e: any) => e.recipe_id).filter(Boolean));
}

export interface TonightEntry {
  entryId: string;
  slotId: string;
  recipeId: string;
  name: string;
  imageUrl: string | null;
  emoji: string;
  color: string;
  calories: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  servings: number;
}

function toTonightEntry(slotId: string, recipe: DinnerCandidate, entryId: string, servings: number): TonightEntry {
  return {
    entryId,
    slotId,
    recipeId: recipe.id,
    name: recipe.name,
    imageUrl: recipe.image_url,
    emoji: RECIPE_EMOJI,
    color: recipeColor(recipe.id),
    calories: Math.round(recipe.calories_per_serving * servings),
    prepMinutes: recipe.prep_minutes,
    cookMinutes: recipe.cook_minutes,
    servings,
  };
}

export async function getTonightsDinner(userId: string, dateISO: string): Promise<TonightEntry | null> {
  const { data: slotRow } = await supabase
    .from("plan_meal_slots")
    .select("id")
    .eq("user_id", userId)
    .eq("plan_date", dateISO)
    .eq("meal_slot_key", DINNER_SLOT_KEY)
    .maybeSingle();
  if (!slotRow) return null;

  const { data } = await supabase
    .from("plan_entries")
    .select("id,servings,recipe:recipes(id,name,calories_per_serving,prep_minutes,cook_minutes,image_url)")
    .eq("slot_id", slotRow.id)
    .maybeSingle();

  if (!data?.recipe) return null;
  return toTonightEntry(slotRow.id, data.recipe as any, data.id, data.servings);
}

export async function chooseTonightsDinner(
  userId: string,
  dateISO: string,
  recipe: DinnerCandidate,
  servings = 1
): Promise<TonightEntry> {
  const { data: slotRow, error: slotError } = await supabase
    .from("plan_meal_slots")
    .upsert(
      { user_id: userId, plan_date: dateISO, meal_slot_key: DINNER_SLOT_KEY, skipped: false },
      { onConflict: "user_id,plan_date,meal_slot_key" }
    )
    .select("id")
    .single();

  if (slotError || !slotRow) throw new Error(slotError?.message ?? "Couldn't create tonight's dinner slot.");

  await supabase.from("plan_entries").delete().eq("slot_id", slotRow.id);
  const { data: inserted, error } = await supabase
    .from("plan_entries")
    .insert({ slot_id: slotRow.id, user_id: userId, item_type: "recipe", recipe_id: recipe.id, servings, sort_order: 0 })
    .select("id,servings")
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Insert returned no row.");
  return toTonightEntry(slotRow.id, recipe, inserted.id, inserted.servings);
}
