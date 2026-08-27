// Resizes/compresses and uploads any local catalog photos to the
// `catalog-images` Supabase Storage bucket, at a path derived from the
// food/recipe's deterministic id (see lib/ids.mjs, lib/images.mjs).
//
// Usage (from scripts/): npm install && npm run upload-images
//
// Source photos live at scripts/seed-data/images/{foods,recipes}/{key}.{ext},
// where {key} matches a `key` field in the corresponding seed-data JSON file.
// Supported source extensions: .jpg, .jpeg, .png, .webp. If a source is a
// HEIC file straight off an iPhone, convert it first — sharp/libvips HEIC
// decode support varies by build — e.g. `sips -s format jpeg src.heic dest.jpg`.
//
// Safe to re-run: uploads always overwrite (upsert), so swapping in an
// improved photo for the same key and re-running just replaces it.
//
// Run this before scripts/generate-seed.mjs — image_url values it emits are
// computed from local file presence, not from Storage, so if you add a photo
// and forget to run this first, the emitted URL will 404 until you catch up.

import "./lib/env.mjs";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { foodId, recipeId } from "./lib/ids.mjs";
import { CATALOG_IMAGES_BUCKET, findLocalImage, storagePath } from "./lib/images.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DATA_DIR = join(__dirname, "seed-data");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (expected in root .env.local).");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const RESIZE_OPTIONS = { width: 1200, height: 1200, fit: "inside", withoutEnlargement: true };
const JPEG_OPTIONS = { quality: 75, mozjpeg: true };

async function uploadOne(type, key, id) {
  const sourcePath = findLocalImage(type, key);
  if (!sourcePath) return null;

  const buffer = await sharp(sourcePath).rotate().resize(RESIZE_OPTIONS).jpeg(JPEG_OPTIONS).toBuffer();
  const path = storagePath(type, id);

  const { error } = await supabase.storage.from(CATALOG_IMAGES_BUCKET).upload(path, buffer, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) throw new Error(`${type}/${key}: upload failed — ${error.message}`);
  return { path, bytes: buffer.length };
}

async function run() {
  const foods = JSON.parse(readFileSync(join(SEED_DATA_DIR, "foods.json"), "utf8"));
  const recipes = JSON.parse(readFileSync(join(SEED_DATA_DIR, "recipes.json"), "utf8"));

  let foodsUploaded = 0;
  for (const f of foods) {
    const result = await uploadOne("foods", f.key, foodId(f.key));
    if (result) {
      foodsUploaded++;
      console.log(`✓ foods/${f.key} → ${result.path} (${Math.round(result.bytes / 1024)}KB)`);
    }
  }

  let recipesUploaded = 0;
  for (const r of recipes) {
    const result = await uploadOne("recipes", r.key, recipeId(r.key));
    if (result) {
      recipesUploaded++;
      console.log(`✓ recipes/${r.key} → ${result.path} (${Math.round(result.bytes / 1024)}KB)`);
    }
  }

  console.log(`\nUploaded ${foodsUploaded} food photo(s), ${recipesUploaded} recipe photo(s).`);

  warnOrphans("foods", foods);
  warnOrphans("recipes", recipes);
}

// Flags source image files whose filename-derived key doesn't match any
// known key in the seed JSON — usually a typo.
function warnOrphans(type, entries) {
  const knownKeys = new Set(entries.map((e) => e.key));
  const dir = join(SEED_DATA_DIR, "images", type);
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return; // no images/{type} directory yet — nothing to check
  }
  for (const file of files) {
    const key = file.replace(/\.[^.]+$/, "");
    if (file.startsWith(".") || knownKeys.has(key)) continue;
    console.warn(`⚠ scripts/seed-data/images/${type}/${file} doesn't match any ${type}.json key — typo?`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
