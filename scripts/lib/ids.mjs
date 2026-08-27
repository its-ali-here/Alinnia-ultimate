// Deterministic UUID v5 derivation shared by generate-seed.mjs and
// upload-images.mjs, so a food/recipe's DB id and its storage object path
// are always computed the same way from the same JSON `key`.

import { createHash } from "node:crypto";

// Fixed namespace UUID (RFC 4122 §4.3) — arbitrary but constant, just needs
// to never change so regeneration stays deterministic.
export const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export function uuidv5(name, namespace = NAMESPACE) {
  const namespaceBytes = Buffer.from(namespace.replace(/-/g, ""), "hex");
  const hash = createHash("sha1").update(Buffer.concat([namespaceBytes, Buffer.from(name, "utf8")])).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function foodId(key) {
  return uuidv5(`food:${key}`);
}

export function recipeId(key) {
  return uuidv5(`recipe:${key}`);
}
