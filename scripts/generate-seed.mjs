// Generates supabase/seed.sql from the JSON source files in scripts/seed-data/.
// Run with: node scripts/generate-seed.mjs
//
// JSON is the diffable/editable source of truth; seed.sql is a regenerable
// build artifact — don't hand-edit seed.sql, edit the JSON and regenerate.
//
// IDs are deterministic (UUID v5 over a fixed namespace + the JSON `key`),
// so regenerating produces the same UUIDs every time and `ON CONFLICT (id)
// DO NOTHING` makes re-running the seed safe.

import "./lib/env.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { uuidv5 } from "./lib/ids.mjs";
import { findLocalImage, publicImageUrl } from "./lib/images.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DATA_DIR = join(__dirname, "seed-data");
const OUT_PATH = join(__dirname, "..", "supabase", "seed.sql");

// Only set if NEXT_PUBLIC_SUPABASE_URL is configured (root .env.local) — falls
// back to always emitting a null image_url otherwise, so this script stays
// runnable with zero config, same as before images existed.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;

// image_url is computed purely from local file presence (does a source photo
// exist for this key under scripts/seed-data/images/?), never from Storage —
// see scripts/upload-images.mjs's header comment for the intended run order.
function imageUrlFor(type, key, id) {
  if (!supabaseUrl) return null;
  return findLocalImage(type, key) ? publicImageUrl(supabaseUrl, type, id) : null;
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  if (value === null || value === undefined) return "null";
  return String(value);
}

function sqlArray(values) {
  if (!values || values.length === 0) return "'{}'";
  return `array[${values.map((v) => sqlString(v)).join(", ")}]::text[]`;
}

const nutrients = JSON.parse(readFileSync(join(SEED_DATA_DIR, "nutrients.json"), "utf8"));
const foods = JSON.parse(readFileSync(join(SEED_DATA_DIR, "foods.json"), "utf8"));
const recipes = JSON.parse(readFileSync(join(SEED_DATA_DIR, "recipes.json"), "utf8"));

const nutrientKeys = new Set(nutrients.map((n) => n.key));
const foodByKey = new Map(foods.map((f) => [f.key, f]));

const lines = [];
lines.push("-- GENERATED FILE — do not hand-edit.");
lines.push("-- Source: scripts/seed-data/*.json, built by scripts/generate-seed.mjs.");
lines.push("-- Nutrition values are standard reference figures (comparable to USDA");
lines.push("-- FoodData Central averages) entered as a v1 starter dataset, not a");
lines.push("-- verified lab-grade export — treat as app-functional quality, expand");
lines.push("-- via the JSON source files as the founder adds more foods/recipes.");
lines.push("");

// ---------------------------------------------------------------
// nutrients
// ---------------------------------------------------------------
lines.push("-- nutrients ----------------------------------------------------");
for (const n of nutrients) {
  lines.push(
    `insert into public.nutrients (key, label, unit, category, sort_order) values (${sqlString(n.key)}, ${sqlString(n.label)}, ${sqlString(n.unit)}, ${sqlString(n.category)}, ${sqlNumber(n.sort_order)}) on conflict (key) do nothing;`
  );
}
lines.push("");

// ---------------------------------------------------------------
// foods + food_nutrients
// ---------------------------------------------------------------
lines.push("-- foods --------------------------------------------------------");
for (const f of foods) {
  const id = uuidv5(`food:${f.key}`);
  const n100 = f.nutrients_per_100g;
  const scale = f.serving_size / 100;
  const caloriesPerServing = (n100.calories ?? 0) * scale;
  const proteinPerServing = n100.protein != null ? n100.protein * scale : null;
  const carbsPerServing = n100.carbs != null ? n100.carbs * scale : null;
  const fatPerServing = n100.fat != null ? n100.fat * scale : null;
  const imageUrl = imageUrlFor("foods", f.key, id);

  lines.push(
    `insert into public.foods (id, name, category, source, owner_id, serving_size, serving_unit, calories_per_serving, protein_g_per_serving, carbs_g_per_serving, fat_g_per_serving, image_url) values (${sqlString(id)}, ${sqlString(f.name)}, ${sqlString(f.category ?? null)}, ${sqlString(f.source ?? "usda")}, null, ${sqlNumber(f.serving_size)}, ${sqlString(f.serving_unit)}, ${sqlNumber(round2(caloriesPerServing))}, ${sqlNumber(round2(proteinPerServing))}, ${sqlNumber(round2(carbsPerServing))}, ${sqlNumber(round2(fatPerServing))}, ${sqlString(imageUrl)}) on conflict (id) do nothing;`
  );

  for (const [key, amount] of Object.entries(n100)) {
    if (!nutrientKeys.has(key)) {
      throw new Error(`foods.json "${f.key}" references unknown nutrient key "${key}"`);
    }
    lines.push(
      `insert into public.food_nutrients (food_id, nutrient_id, amount_per_100g) select ${sqlString(id)}, id, ${sqlNumber(amount)} from public.nutrients where key = ${sqlString(key)} on conflict (food_id, nutrient_id) do nothing;`
    );
  }
}
lines.push("");

// ---------------------------------------------------------------
// recipes + recipe_foods (cached macros computed from ingredients)
// ---------------------------------------------------------------
function round2(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}

lines.push("-- recipes ------------------------------------------------------");
for (const r of recipes) {
  const recipeId = uuidv5(`recipe:${r.key}`);
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const recipeFoodLines = r.ingredients.map((ing, index) => {
    const food = foodByKey.get(ing.food_key);
    if (!food) throw new Error(`recipes.json "${r.key}" references unknown food key "${ing.food_key}"`);
    const grams = ing.grams ?? ing.quantity;
    const factor = grams / 100;
    const n100 = food.nutrients_per_100g;
    totalCalories += (n100.calories ?? 0) * factor;
    totalProtein += (n100.protein ?? 0) * factor;
    totalCarbs += (n100.carbs ?? 0) * factor;
    totalFat += (n100.fat ?? 0) * factor;

    const foodId = uuidv5(`food:${ing.food_key}`);
    const recipeFoodId = uuidv5(`recipe_food:${r.key}:${ing.food_key}:${index}`);
    return `insert into public.recipe_foods (id, recipe_id, food_id, quantity, unit, sort_order) values (${sqlString(recipeFoodId)}, ${sqlString(recipeId)}, ${sqlString(foodId)}, ${sqlNumber(ing.quantity)}, ${sqlString(ing.unit)}, ${index}) on conflict (id) do nothing;`;
  });

  const servings = r.servings || 1;
  const imageUrl = imageUrlFor("recipes", r.key, recipeId);
  lines.push(
    `insert into public.recipes (id, owner_id, name, description, image_url, youtube_url, servings, prep_minutes, cook_minutes, meal_types, cuisine, calories_per_serving, protein_g_per_serving, carbs_g_per_serving, fat_g_per_serving, directions) values (${sqlString(recipeId)}, null, ${sqlString(r.name)}, ${sqlString(r.description ?? null)}, ${sqlString(imageUrl)}, ${sqlString(r.youtube_url ?? null)}, ${sqlNumber(servings)}, ${sqlNumber(r.prep_minutes ?? null)}, ${sqlNumber(r.cook_minutes ?? null)}, ${sqlArray(r.meal_types)}, ${sqlString(r.cuisine ?? null)}, ${sqlNumber(round2(totalCalories / servings))}, ${sqlNumber(round2(totalProtein / servings))}, ${sqlNumber(round2(totalCarbs / servings))}, ${sqlNumber(round2(totalFat / servings))}, ${sqlArray(r.directions ?? [])}) on conflict (id) do nothing;`
  );
  lines.push(...recipeFoodLines);
}

writeFileSync(OUT_PATH, lines.join("\n") + "\n");
console.log(`Wrote ${OUT_PATH} (${nutrients.length} nutrients, ${foods.length} foods, ${recipes.length} recipes).`);
