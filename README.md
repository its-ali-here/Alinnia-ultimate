# Mealinnia

A weekly nutrient-target tracker that suggests familiar dishes (starting with Pakistani cuisine) to fill the gaps, then hands you a shopping list scaled to your household. See [PLAN.md](PLAN.md) for the full product context — this README is just setup/run instructions.

**Status:** v1 core loop scaffolded (auth, onboarding, dish suggestion engine, ingredient list, weekly summary) and ready to run against a real Supabase project.

## Repo layout

```
mobile/     Expo (React Native + TypeScript) app — the actual product
website/    Next.js landing page with an email waitlist
supabase/   SQL schema (migrations/) + starter data (seed.sql)
```

## 1. Create your Supabase project

You'll need to do this part yourself — it requires your own Supabase account.

1. Go to [supabase.com](https://supabase.com), create a project (pick any region near you).
2. In **Project Settings → API**, copy the **Project URL** and the **anon public key**. You'll need these for both `mobile/.env` and `website/.env.local`.
3. In **Authentication → Providers → Email**, for easier local testing you can turn off "Confirm email" so sign-up logs you in immediately. Turn it back on before any real users sign up.

## 2. Apply the database schema + seed data

The `supabase/` folder has two migrations (core schema, then the website waitlist table) and one seed file (nutrient/ingredient/dish reference data for the 10 starter Pakistani dishes).

**Option A — Supabase CLI** (installed on this machine, `supabase --version` → 2.26.9; consider updating with `brew upgrade supabase` first):

```sh
cd supabase
supabase link --project-ref your-project-ref   # find this in your project's dashboard URL
supabase db push                                # applies migrations/*.sql in order
psql "$(supabase db url --linked)" -f seed.sql  # or paste seed.sql into the SQL editor
```

**Option B — Dashboard SQL editor** (no CLI needed): open **SQL Editor** in your Supabase dashboard and run, in order: `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_waitlist.sql`, then `supabase/seed.sql`.

Read the comment at the top of `seed.sql` before trusting the nutrient numbers for anything beyond development — they're hand-entered approximations, not verified against a food composition database yet.

## 3. Run the mobile app

```sh
cd mobile
cp .env.example .env        # fill in your Supabase URL + anon key
npm run start                # then press i / a / w, or scan the QR code with Expo Go
```

Sign up with any email, complete onboarding (household size, meat/spice preferences, allergies), and you should land on the home screen with nutrient progress bars and a "Get today's suggestion" button.

## 4. Run the website

```sh
cd website
cp .env.example .env.local  # fill in your Supabase URL + anon key
npm run dev                  # http://localhost:3000
```

The waitlist form inserts into the `waitlist_signups` table (insert-only from the browser; nothing is readable back out through the public API).

## What's not built yet

By design — see the plan for the phased roadmap:
- Pantry matching ("I already have this ingredient")
- Monthly/biweekly "try something new" rotation + YouTube links
- foodpanda ordering integration, price comparison, budgeting
- App icons/splash screens, EAS build config for actual App Store/Play Store submission
- Personalized nutrient targets (v1 uses one general-adult default for everyone)
