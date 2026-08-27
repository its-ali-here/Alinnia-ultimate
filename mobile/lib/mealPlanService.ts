import { supabase } from "./supabase";
import type { Food, Recipe, RecipeFood } from "../types/database";

export interface WeekDayPlan {
  dayIndex: number; // 0 (Mon) - 6 (Sun)
  label: string; // "M", "T", "W", etc.
  dayName: string; // "Mon", "Tue", etc.
  dateISO: string;
  isToday: boolean;
  planned: boolean;
  recipeId?: string;
  recipeName?: string;
  recipeImageUrl?: string | null;
  calories?: number;
  protein?: number;
  carbs?: number;
  prepMinutes?: number;
  cookMinutes?: number;
}

export interface WeeklyNutrient {
  key: string;
  label: string;
  amount: number;
  target: number;
  unit: string;
  fraction: number; // 0.0 - 1.0 (clamped or visual)
  status: string;
  color: "primary" | "sprout" | "accent";
}

export interface WeeklyNudge {
  title: string;
  body: string;
}

export interface WeeklyPlanData {
  days: WeekDayPlan[];
  plannedCount: number;
  nutrients: WeeklyNutrient[];
  nudge: WeeklyNudge;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  rawGrams: number;
  category: string;
  got: boolean;
  isStaple: boolean;
  recipeNames: string[];
  currency?: string;
  proratedPrice?: number; // Exact cost of quantity used (e.g. 5g = Rs. 0.38)
  packagePrice?: number; // Full package retail price (e.g. 800g = Rs. 60)
  packageInfo?: string; // e.g. "800g pack"
  packsNeeded?: number; // e.g. 1
}

export interface ShoppingAisle {
  key: string;
  label: string;
  emoji: string;
  items: ShoppingItem[];
}

export interface ShoppingBudget {
  spent: number;
  recipeCost: number;
  checkoutCost: number;
  total: number;
  currency: string;
}

export interface WeeklyShoppingData {
  aisles: ShoppingAisle[];
  totalItemCount: number;
  budget: ShoppingBudget;
}

// -------------------------------------------------------------
// Date Utilities
// -------------------------------------------------------------

export function getWeekRange(refDate = new Date()) {
  const day = refDate.getDay();
  // Monday is start of week
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    monday,
    sunday,
    mondayISO: toISODate(monday),
    sundayISO: toISODate(sunday),
  };
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatWeekLabel(monday: Date, sunday: Date): string {
  const fmt = (d: Date) => d.getDate();
  const month = sunday.toLocaleDateString(undefined, { month: "short" });
  return `${fmt(monday)}–${fmt(sunday)} ${month}`;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// -------------------------------------------------------------
// Weekly Plan Fetching
// -------------------------------------------------------------

export async function fetchWeeklyPlan(userId: string, refDate = new Date()): Promise<WeeklyPlanData> {
  const { monday, sunday, mondayISO, sundayISO } = getWeekRange(refDate);
  const todayISO = toISODate(refDate);

  // Fetch all meal slots for this week
  const { data: slots } = await supabase
    .from("plan_meal_slots")
    .select("id, plan_date, meal_slot_key")
    .eq("user_id", userId)
    .gte("plan_date", mondayISO)
    .lte("plan_date", sundayISO);

  const slotMap = new Map<string, string>(); // dateISO -> slotId
  (slots ?? []).forEach((s: any) => {
    slotMap.set(s.plan_date, s.id);
  });

  const slotIds = Array.from(slotMap.values());
  const entryMap = new Map<string, any>(); // slotId -> entry with recipe

  if (slotIds.length > 0) {
    const { data: entries } = await supabase
      .from("plan_entries")
      .select("id, slot_id, servings, recipe:recipes(id, name, image_url, prep_minutes, cook_minutes, calories_per_serving, protein_g_per_serving, carbs_g_per_serving, fat_g_per_serving)")
      .in("slot_id", slotIds)
      .not("recipe_id", "is", null);

    (entries ?? []).forEach((e: any) => {
      if (e.recipe) entryMap.set(e.slot_id, e);
    });
  }

  // Build 7 days
  const days: WeekDayPlan[] = [];
  let totalProtein = 0;
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dISO = toISODate(d);
    const slotId = slotMap.get(dISO);
    const entry = slotId ? entryMap.get(slotId) : null;
    const isToday = dISO === todayISO;
    const planned = !!entry?.recipe;

    if (entry?.recipe) {
      totalProtein += (entry.recipe.protein_g_per_serving ?? 0) * (entry.servings ?? 1);
      totalCalories += (entry.recipe.calories_per_serving ?? 0) * (entry.servings ?? 1);
      totalCarbs += (entry.recipe.carbs_g_per_serving ?? 0) * (entry.servings ?? 1);
      totalFat += (entry.recipe.fat_g_per_serving ?? 0) * (entry.servings ?? 1);
    }

    days.push({
      dayIndex: i,
      label: DAY_LABELS[i],
      dayName: DAY_NAMES[i],
      dateISO: dISO,
      isToday,
      planned,
      recipeId: entry?.recipe?.id,
      recipeName: entry?.recipe?.name,
      recipeImageUrl: entry?.recipe?.image_url,
      calories: entry?.recipe?.calories_per_serving ? Math.round(entry.recipe.calories_per_serving * (entry.servings ?? 1)) : undefined,
      protein: entry?.recipe?.protein_g_per_serving ? Math.round(entry.recipe.protein_g_per_serving * (entry.servings ?? 1)) : undefined,
      carbs: entry?.recipe?.carbs_g_per_serving ? Math.round(entry.recipe.carbs_g_per_serving * (entry.servings ?? 1)) : undefined,
      prepMinutes: entry?.recipe?.prep_minutes ?? undefined,
      cookMinutes: entry?.recipe?.cook_minutes ?? undefined,
    });
  }

  const plannedCount = days.filter((d) => d.planned).length;

  // Approximate targets for single person adult portion across 7 days (or user household scale)
  const proteinTarget = 350; // 50g/day * 7
  const fiberTarget = 175; // 25g/day * 7
  const ironTarget = 98; // 14mg/day * 7
  const calciumTarget = 4900; // 700mg/day * 7

  // Estimated coverage based on planned count & dish composition
  const proteinFraction = Math.min(1, totalProtein > 0 ? totalProtein / proteinTarget : (plannedCount * 0.14));
  const fiberFraction = Math.min(1, plannedCount > 0 ? (plannedCount * 0.13) : 0);
  const ironFraction = Math.min(1, plannedCount > 0 ? (plannedCount * 0.11) : 0);
  const calciumFraction = Math.min(1, plannedCount > 0 ? (plannedCount * 0.12) : 0);

  const nutrients: WeeklyNutrient[] = [
    {
      key: "protein",
      label: "Protein",
      amount: Math.round(totalProtein),
      target: proteinTarget,
      unit: "g",
      fraction: proteinFraction || 0.1,
      status: proteinFraction >= 0.7 ? "Well covered" : proteinFraction >= 0.4 ? "Coming along" : "Could use more",
      color: proteinFraction >= 0.7 ? "primary" : "accent",
    },
    {
      key: "fibre",
      label: "Fibre",
      amount: Math.round(totalCarbs * 0.3),
      target: fiberTarget,
      unit: "g",
      fraction: fiberFraction || 0.1,
      status: fiberFraction >= 0.7 ? "Well covered" : fiberFraction >= 0.4 ? "Coming along" : "Could use more",
      color: "sprout",
    },
    {
      key: "iron",
      label: "Iron",
      amount: Math.round(plannedCount * 12),
      target: ironTarget,
      unit: "mg",
      fraction: ironFraction || 0.1,
      status: ironFraction >= 0.6 ? "Well covered" : "Could use more",
      color: "accent",
    },
    {
      key: "calcium",
      label: "Calcium",
      amount: Math.round(plannedCount * 550),
      target: calciumTarget,
      unit: "mg",
      fraction: calciumFraction || 0.1,
      status: calciumFraction >= 0.6 ? "Well covered" : "Coming along",
      color: "primary",
    },
  ];

  let nudge: WeeklyNudge;
  if (plannedCount === 0) {
    nudge = {
      title: "Plan your first dinner",
      body: "Pick a dish on Dish Decider to kickstart this week's nutrient targets and grocery list.",
    };
  } else if (plannedCount < 3) {
    nudge = {
      title: "Keep the momentum going",
      body: `You've planned ${plannedCount} of 7 dinners. Choose a few more to balance your week.`,
    };
  } else if (ironFraction < 0.5) {
    nudge = {
      title: "Something leafy on the weekend",
      body: "Saag, palak or lentils will round out the iron across your dinners this week.",
    };
  } else {
    nudge = {
      title: "Nutrients coming along nicely",
      body: "Your planned meals provide a balanced blend of protein and daily micronutrients.",
    };
  }

  return { days, plannedCount, nutrients, nudge };
}

// -------------------------------------------------------------
// Live Scaled Shopping List Aggregation
// -------------------------------------------------------------

export function categorizeFood(name: string, category: string | null): string {
  const lower = name.toLowerCase();
  if (
    lower.includes("chicken") ||
    lower.includes("beef") ||
    lower.includes("mutton") ||
    lower.includes("lamb") ||
    lower.includes("meat") ||
    lower.includes("fish") ||
    lower.includes("salmon") ||
    lower.includes("shrimp") ||
    lower.includes("prawn") ||
    lower.includes("burger")
  ) {
    return "meat";
  }

  if (
    lower.includes("lentil") ||
    lower.includes("daal") ||
    lower.includes("chickpea") ||
    lower.includes("chana") ||
    lower.includes("rice") ||
    lower.includes("flour") ||
    lower.includes("atta") ||
    lower.includes("oat") ||
    lower.includes("pasta") ||
    lower.includes("bread") ||
    category === "Grains"
  ) {
    return "dry-goods";
  }

  if (
    lower.includes("milk") ||
    lower.includes("yogurt") ||
    lower.includes("dahi") ||
    lower.includes("cheese") ||
    lower.includes("paneer") ||
    lower.includes("butter") ||
    lower.includes("ghee") ||
    lower.includes("oil") ||
    category === "Dairy" ||
    category === "Fats & Oils"
  ) {
    return "dairy";
  }

  if (
    lower.includes("salt") ||
    lower.includes("pepper") ||
    lower.includes("chili powder") ||
    lower.includes("chilli powder") ||
    lower.includes("turmeric") ||
    lower.includes("haldi") ||
    lower.includes("garam masala") ||
    lower.includes("cumin") ||
    lower.includes("zeera") ||
    lower.includes("coriander powder") ||
    lower.includes("sugar") ||
    category === "Spices" ||
    category === "Sweeteners"
  ) {
    return "spices";
  }

  if (
    category === "Produce" ||
    lower.includes("onion") ||
    lower.includes("tomato") ||
    lower.includes("potato") ||
    lower.includes("garlic") ||
    lower.includes("ginger") ||
    lower.includes("spinach") ||
    lower.includes("palak") ||
    lower.includes("chili") ||
    lower.includes("coriander") ||
    lower.includes("cabbage") ||
    lower.includes("cauliflower") ||
    lower.includes("gourd")
  ) {
    return "sabzi";
  }

  return "other";
}

export function isPantryStaple(name: string, category: string | null): boolean {
  const lower = name.toLowerCase();
  if (
    category === "Spices" ||
    category === "Sweeteners" ||
    category === "Fats & Oils" ||
    lower.includes("salt") ||
    lower.includes("pepper") ||
    lower.includes("turmeric") ||
    lower.includes("haldi") ||
    lower.includes("cumin") ||
    lower.includes("zeera") ||
    lower.includes("chili powder") ||
    lower.includes("chilli powder") ||
    lower.includes("garam masala") ||
    lower.includes("coriander powder") ||
    lower.includes("ghee") ||
    lower.includes("oil") ||
    lower.includes("sugar")
  ) {
    return true;
  }
  return false;
}

function formatIngredientQuantity(grams: number, unit: string): string {
  if (unit === "piece" || unit === "egg" || unit === "item") {
    return `${Math.round(grams)} ${Math.round(grams) === 1 ? unit : unit + "s"}`;
  }
  if (unit === "bunch") {
    return `${Math.round(grams)} ${Math.round(grams) === 1 ? "bunch" : "bunches"}`;
  }
  if (unit === "ml" || unit === "l") {
    if (grams >= 1000) {
      const l = grams / 1000;
      return `${Number.isInteger(l) ? l : l.toFixed(1)} L`;
    }
    return `${Math.round(grams)} ml`;
  }
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`;
  }
  return `${Math.round(grams)} g`;
}

export async function fetchWeeklyShoppingList(
  userId: string,
  householdSize = 2,
  refDate = new Date()
): Promise<WeeklyShoppingData> {
  const { mondayISO, sundayISO } = getWeekRange(refDate);

  // 1. Get all planned slots for this week
  const { data: slots } = await supabase
    .from("plan_meal_slots")
    .select("id")
    .eq("user_id", userId)
    .gte("plan_date", mondayISO)
    .lte("plan_date", sundayISO);

  const slotIds = (slots ?? []).map((s: any) => s.id);
  if (slotIds.length === 0) {
    return {
      aisles: [],
      totalItemCount: 0,
      budget: { spent: 0, recipeCost: 0, checkoutCost: 0, total: 1500, currency: "Rs." },
    };
  }

  // 2. Get planned recipes
  const { data: entries } = await supabase
    .from("plan_entries")
    .select("recipe_id, servings, recipe:recipes(id, name, servings)")
    .in("slot_id", slotIds)
    .not("recipe_id", "is", null);

  if (!entries || entries.length === 0) {
    return {
      aisles: [],
      totalItemCount: 0,
      budget: { spent: 0, recipeCost: 0, checkoutCost: 0, total: 1500, currency: "Rs." },
    };
  }

  // 3. For each recipe, fetch recipe_foods
  const recipeIds = Array.from(new Set(entries.map((e: any) => e.recipe_id).filter(Boolean)));
  const { data: recipeFoods } = await supabase
    .from("recipe_foods")
    .select("recipe_id, food_id, quantity, unit, food:foods(id, name, category)")
    .in("recipe_id", recipeIds);

  const recipeMap = new Map<string, any>();
  entries.forEach((e: any) => {
    if (e.recipe) {
      recipeMap.set(e.recipe.id, {
        name: e.recipe.name,
        servings: e.recipe.servings || 1,
        entryServings: e.servings || 1,
      });
    }
  });

  // 4. Aggregate ingredients by food_id
  interface AggregatedFood {
    foodId: string;
    name: string;
    category: string;
    totalGrams: number;
    unit: string;
    recipeNames: Set<string>;
  }

  const aggregated = new Map<string, AggregatedFood>();

  (recipeFoods ?? []).forEach((rf: any) => {
    if (!rf.food) return;
    const rInfo = recipeMap.get(rf.recipe_id);
    if (!rInfo) return;

    // Scale quantity for household size
    const recipeBaseServings = rInfo.servings || 1;
    const householdScale = Math.max(1, householdSize) / recipeBaseServings;
    const itemGrams = rf.quantity * householdScale * rInfo.entryServings;

    const existing = aggregated.get(rf.food.id);
    if (existing) {
      existing.totalGrams += itemGrams;
      existing.recipeNames.add(rInfo.name);
    } else {
      aggregated.set(rf.food.id, {
        foodId: rf.food.id,
        name: rf.food.name,
        category: rf.food.category || "Produce",
        totalGrams: itemGrams,
        unit: rf.unit || "g",
        recipeNames: new Set([rInfo.name]),
      });
    }
  });

  // 5. Fetch pricing from food_prices
  const foodIds = Array.from(aggregated.keys());
  const { data: priceRows } = await supabase
    .from("food_prices")
    .select("food_id, package_price, package_size, package_unit, price_per_gram, currency")
    .in("food_id", foodIds)
    .eq("country_code", "PK");

  const priceMap = new Map<string, any>();
  (priceRows ?? []).forEach((p: any) => {
    priceMap.set(p.food_id, p);
  });

  // 6. Group into Bazaar Aisles with dual pricing
  const aisleBuckets: Record<string, ShoppingItem[]> = {
    sabzi: [],
    meat: [],
    "dry-goods": [],
    dairy: [],
    spices: [],
    other: [],
  };

  let totalRecipeCost = 0;
  let totalCheckoutCost = 0;

  aggregated.forEach((item) => {
    const aisleKey = categorizeFood(item.name, item.category);
    const amountStr = formatIngredientQuantity(item.totalGrams, item.unit);
    const isStaple = isPantryStaple(item.name, item.category);

    const priceInfo = priceMap.get(item.foodId);
    let proratedPrice: number | undefined;
    let packagePrice: number | undefined;
    let packageInfo: string | undefined;
    let packsNeeded = 1;
    const currency = priceInfo?.currency || "Rs.";

    if (priceInfo) {
      proratedPrice = item.totalGrams * Number(priceInfo.price_per_gram);
      const pkgSize = Number(priceInfo.package_size) || 1000;
      packsNeeded = Math.max(1, Math.ceil(item.totalGrams / pkgSize));
      packagePrice = Number(priceInfo.package_price) * packsNeeded;
      packageInfo = `${pkgSize}${priceInfo.package_unit} pack`;

      totalRecipeCost += proratedPrice;
      totalCheckoutCost += packagePrice;
    } else {
      // Fallback approximation if pricing record missing
      proratedPrice = Math.round(item.totalGrams * 0.5);
      packagePrice = proratedPrice;
      totalRecipeCost += proratedPrice;
      totalCheckoutCost += packagePrice;
    }

    aisleBuckets[aisleKey].push({
      id: item.foodId,
      name: item.name.replace(/,\s*(raw|cooked|skinless|whole|boneless chuck)/gi, ""),
      amount: amountStr,
      rawGrams: item.totalGrams,
      category: item.category,
      got: false,
      isStaple,
      recipeNames: Array.from(item.recipeNames),
      currency,
      proratedPrice,
      packagePrice,
      packageInfo,
      packsNeeded,
    });
  });

  const AISLE_METADATA: { key: string; label: string; emoji: string }[] = [
    { key: "sabzi", label: "Sabzi & Fresh Produce", emoji: "🥬" },
    { key: "meat", label: "Meat & Poultry", emoji: "🍗" },
    { key: "dry-goods", label: "Daal, Grains & Rice", emoji: "🌾" },
    { key: "dairy", label: "Dairy, Ghee & Oils", emoji: "🧈" },
    { key: "spices", label: "Spices & Masalay", emoji: "🧂" },
    { key: "other", label: "Pantry & Other", emoji: "🛒" },
  ];

  const finalAisles: ShoppingAisle[] = [];
  let totalItemCount = 0;

  AISLE_METADATA.forEach((meta) => {
    const items = aisleBuckets[meta.key];
    if (items && items.length > 0) {
      items.sort((a, b) => a.name.localeCompare(b.name));
      finalAisles.push({
        key: meta.key,
        label: meta.label,
        emoji: meta.emoji,
        items,
      });
      totalItemCount += items.length;
    }
  });

  return {
    aisles: finalAisles,
    totalItemCount,
    budget: {
      spent: 0,
      recipeCost: Math.round(totalRecipeCost),
      checkoutCost: Math.round(totalCheckoutCost),
      total: Math.round(totalCheckoutCost),
      currency: "Rs.",
    },
  };
}

// -------------------------------------------------------------
// WhatsApp Formatting
// -------------------------------------------------------------

export function formatShoppingListForWhatsApp(
  aisles: ShoppingAisle[],
  householdCount: number,
  weekLabel: string
): string {
  if (aisles.length === 0) {
    return "🛒 Mealinnia Shopping List\n\nNo ingredients planned yet for this week.";
  }

  const lines: string[] = [
    `🛒 *Mealinnia Bazaar List* (${weekLabel})`,
    `👨‍👩‍👧‍👦 Scaled for *${householdCount} ${householdCount === 1 ? "person" : "people"}*`,
    "",
  ];

  aisles.forEach((aisle) => {
    lines.push(`${aisle.emoji} *${aisle.label.toUpperCase()}*`);
    aisle.items.forEach((item) => {
      lines.push(`• ${item.name} — *${item.amount}*`);
    });
    lines.push("");
  });

  lines.push("✨ Generated with Mealinnia");
  return lines.join("\n");
}

