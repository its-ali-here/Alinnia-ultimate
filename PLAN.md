# Kitchen & Body Nutrition App — Build Plan

## Context

The idea: most people don't know which foods cover which nutrients. This app sets weekly targets (macros, vitamins, minerals), then suggests a dish from the user's own cuisine — something familiar, not a random "healthy recipe." The user approves or rejects it (rejecting triggers quick reasons like "no meat," "too spicy," "avoid X"). Once approved, the app shows ingredients scaled to household size and nutrients per serving. Later phases add pantry matching, monthly dish rotation with YouTube links, and grocery ordering/budgeting via foodpanda.

Given the size of the idea, we're deliberately building it in phases instead of all at once:
- **v1 (MVP):** the core loop only — targets → suggestion → approve/reject → scaled ingredient list. No pantry matching, no ordering, no budgeting yet. Goal: prove people actually want this before investing in the harder integrations.
- **Cuisine scope for v1:** one cuisine/region only, so the nutrition data can be hand-verified instead of guessed. (Which one — e.g. Pakistani/South Asian — to confirm with you before we start curating dishes.)
- **foodpanda / ordering / price comparison:** deferred to a later phase. That's a business partnership as much as an engineering task, and shouldn't block shipping the core experience.

You said you want to start building this with Claude Code now, so this plan ends with concrete scaffolding steps, not just a strategy doc.

---

## 1. Answering your direct questions

**React Native?** Yes — specifically **React Native + Expo**. One codebase for iOS and Android, easy OTA updates, huge ecosystem, and Expo removes most of the native build pain for a solo/small team.

**One Supabase for both app and website?** Yes — a single Supabase project. The app uses it fully (auth, user data, dish/nutrient database). The website only needs a sliver of it (an "insert-only" waitlist table for email signups) — no need for a second project. One project is simpler to manage and keeps you on Supabase's free/starter tier longer.

---

## 2. Tech stack

| Piece | Choice | Why |
|---|---|---|
| Mobile app | React Native (Expo) + TypeScript | cross-platform, one codebase, fast iteration |
| Backend/DB | Supabase (Postgres + Auth + Row Level Security) | Postgres you control, built-in auth, generous free tier |
| Website | Next.js, deployed on Vercel | simple landing page, same Supabase project for waitlist capture |
| Nutrition data | USDA FoodData Central (free API/dataset) as a base, hand-corrected/extended for the chosen cuisine's dishes | no ready-made database covers regional home-cooked dishes accurately — this needs manual curation regardless of stack |

Repo layout (single git repo, no heavy monorepo tooling needed yet):
```
/app          → Expo React Native app
/website      → Next.js landing page
/supabase     → SQL migrations, schema, seed data for dishes/nutrients
```

---

## 3. Database design (v1 scope)

Core tables in Supabase/Postgres:
- `profiles` — user, household size, cuisine, dietary restrictions/allergies
- `nutrients` — reference list (protein, iron, vitamin C, etc.) with units
- `nutrient_targets` — weekly target per user per nutrient (defaults from standard RDA tables, user can adjust)
- `ingredients` — raw foods (e.g. lentils, chicken, spinach)
- `ingredient_nutrients` — nutrient amount per 100g of each ingredient (the hand-curated nutrition database)
- `dishes` — name, cuisine, spice level, contains-meat flag, tags
- `dish_ingredients` — quantity of each ingredient per serving, per dish
- `user_dish_feedback` — approved/rejected + rejection reason (no meat, too spicy, avoid ingredient, etc.) — this is what personalizes future suggestions
- `weekly_plans` — which dishes were approved this week, used to track progress against targets

Row Level Security ensures each user only reads/writes their own profile, targets, feedback, and plans. `ingredients`, `dishes`, `nutrients` are shared reference data, readable by everyone.

---

## 4. Suggestion logic (v1 — rules, not AI/ML)

No machine learning needed for v1 — a simple, explainable rule works:
1. Calculate the user's remaining weekly nutrient gap (target minus what's already been approved this week).
2. Filter the dish catalog by the user's cuisine + known restrictions (from profile and past rejection reasons).
3. Rank remaining dishes by how well they fill the biggest gaps.
4. Suggest the top dish.
5. On reject → ask a short reason (no meat / too spicy / avoid an ingredient) → save it → suggest the next best dish.
6. On approve → show ingredients scaled by household size, log it into this week's plan, update the nutrient tally.

This can be upgraded later (smarter ranking, variety/repetition avoidance, etc.) — start simple.

---

## 5. App flow (v1)

1. **Onboarding** — household size, cuisine (fixed choice in v1), dietary restrictions/allergies, accept default nutrient targets or adjust.
2. **Home screen** — this week's nutrient progress (calories, protein, a few key vitamins) as simple progress bars.
3. **Suggested dish card** — photo, name, spice level, meat/veg tag → Approve / Reject.
4. **Reject flow** — short reason picker → new suggestion.
5. **Approved dish screen** — ingredient list scaled to household size, nutrients per serving, "log this to my week" confirmation.
6. **Weekly summary** — cumulative nutrients vs. targets.

Not in v1 (planned for later, don't build yet): "I already have this ingredient" pantry matching, monthly/biweekly rotation + YouTube links, foodpanda ordering, price comparison, budgeting.

---

## 6. Website (v1)

One-page Next.js landing page:
- Hero explaining the app in one line + how it works (3 short steps)
- App Store / Play Store badges (placeholder links until the app is published; can point to a TestFlight/APK beta link in the meantime)
- Email waitlist form → writes to a Supabase `waitlist_signups` table (insert-only RLS policy, public anon key)
- Deployed on Vercel

---

## 7. Roadmap after v1

- **Phase 2:** pantry matching ("mark what you already have" → shopping list shrinks), monthly/biweekly "try something new" suggestions, YouTube video links (via YouTube Data API, searched by dish name).
- **Phase 3:** foodpanda partnership integration (or start with a simpler "share/export shopping list" as a stepping stone), price comparison, budget setting.

---

## 8. Things to flag now (not blockers, but plan around them)

- **Nutrition data curation is the real bottleneck**, not code. Budget real time for hand-verifying ~30–50 dishes' worth of ingredient nutrient data for the chosen cuisine.
- **Not medical advice** — add a simple disclaimer; standard RDA values vary by age/sex/activity level, decide in onboarding how much personalization v1 needs (a simple default is fine to start).
- **foodpanda integration needs a business conversation**, not just an API key — treat it as a parallel track, not an engineering task, and don't let it block v1.
- **Accounts you'll need to create yourself** (require your own credentials/payment info, so I can't do this step for you): a Supabase project, an Expo/EAS account for app builds, and eventually Apple Developer + Google Play Console accounts for store publishing.

---

## 9. Immediate next steps (once this plan is approved)

1. Scaffold the repo: `/app` (Expo + TypeScript), `/website` (Next.js), `/supabase` (SQL migrations).
2. Write the initial Postgres schema + RLS policies for the tables in section 3.
3. Seed a small starter dish set (5–10 dishes) with real nutrient data so the app has something real to run against while building.
4. Build onboarding + home screen + suggestion card flow in the Expo app, wired to Supabase.
5. Build the one-page website with the waitlist form.

**Open question for you before we start scaffolding:** which cuisine/region should v1 focus on?
