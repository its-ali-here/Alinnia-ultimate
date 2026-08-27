// Loads the repo root's .env.local regardless of the cwd the script is run
// from — `dotenv/config` alone only looks for `.env` in the current directory,
// which isn't where this repo's Supabase config lives.

import { config } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });
