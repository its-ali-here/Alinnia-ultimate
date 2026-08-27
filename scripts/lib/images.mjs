// Shared "where do catalog images live" logic for generate-seed.mjs and
// upload-images.mjs, so the two scripts can never disagree about which JSON
// keys have a photo or what its storage path/URL is.

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SEED_IMAGES_DIR = join(__dirname, "..", "seed-data", "images");

const SOURCE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export const CATALOG_IMAGES_BUCKET = "catalog-images";

// Returns the absolute path to a local source image for this food/recipe
// key, or null if none has been added yet under scripts/seed-data/images/.
export function findLocalImage(type, key) {
  for (const ext of SOURCE_EXTENSIONS) {
    const candidate = join(SEED_IMAGES_DIR, type, `${key}${ext}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

// Every uploaded image is normalized to .jpg by upload-images.mjs, so the
// storage path is derived from the row's own id, not the source extension.
export function storagePath(type, id) {
  return `${type}/${id}.jpg`;
}

export function publicImageUrl(supabaseUrl, type, id) {
  return `${supabaseUrl}/storage/v1/object/public/${CATALOG_IMAGES_BUCKET}/${storagePath(type, id)}`;
}
