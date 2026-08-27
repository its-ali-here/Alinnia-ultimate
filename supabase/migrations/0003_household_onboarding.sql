-- Adds household-level onboarding fields (replacing the individual weight/
-- calorie/macro model), a recipe-catalog cuisine tag, and a new
-- complete_onboarding_v3 RPC that writes them. The previously-live
-- complete_onboarding_v2 RPC is not defined anywhere in this repo (no prior
-- migration created it) — this migration does not touch it, and introduces
-- v3 as its replacement instead of guessing at its unknown behavior.
-- Idempotent: safe to paste into the Supabase SQL editor more than once.

-- ---------------------------------------------------------------
-- profiles: household composition, needs, avoids, dish preferences
-- ---------------------------------------------------------------

alter table public.profiles
  add column if not exists cuisines text[] not null default '{}';

alter table public.profiles
  add column if not exists adults_count int not null default 2 check (adults_count >= 1);

alter table public.profiles
  add column if not exists children_count int not null default 0 check (children_count >= 0);

alter table public.profiles
  add column if not exists household_needs text[] not null default '{}'
  check (household_needs <@ array['diabetic', 'pregnant', 'training_hard', 'fussy_eater', 'high_blood_pressure']::text[]);

alter table public.profiles
  add column if not exists who_cooks text
  check (who_cooks is null or who_cooks = any (array['solo', 'helped', 'shared']));

alter table public.profiles
  add column if not exists avoids text[] not null default '{}'
  check (avoids <@ array['beef', 'seafood', 'eggs', 'nuts', 'dairy']::text[]);

-- Collected but not yet used for recipe filtering — no recipe has spice data
-- yet (same partially-wired pattern the schema already has for `cuisine` and
-- `household_size`). Wire this up once recipes carry a spice tag.
alter table public.profiles
  add column if not exists spice_level int default 3 check (spice_level between 1 and 5);

alter table public.profiles
  add column if not exists favorite_recipe_ids uuid[] not null default '{}';

alter table public.profiles
  add column if not exists cooking_nights_per_week int not null default 5
  check (cooking_nights_per_week = any (array[3, 5, 7]));

-- ---------------------------------------------------------------
-- recipes: cuisine tag (nullable — existing 40 seeded rows get backfilled
-- via the regenerated supabase/seed.sql, not this migration)
-- ---------------------------------------------------------------

alter table public.recipes
  add column if not exists cuisine text;

-- ---------------------------------------------------------------
-- complete_onboarding_v3: writes the household payload collected by the
-- new (setup) flow and marks the profile onboarded. Called once, at the
-- very end of onboarding (see mobile/app/_layout.tsx routing notes).
-- ---------------------------------------------------------------

create or replace function public.complete_onboarding_v3(p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_adults int := coalesce((p_payload ->> 'adults_count')::int, 2);
  v_children int := coalesce((p_payload ->> 'children_count')::int, 0);
begin
  update public.profiles
  set
    cuisines = coalesce(
      (select array_agg(value) from jsonb_array_elements_text(p_payload -> 'cuisines')),
      '{}'
    ),
    adults_count = v_adults,
    children_count = v_children,
    household_size = v_adults + v_children,
    household_needs = coalesce(
      (select array_agg(value) from jsonb_array_elements_text(p_payload -> 'household_needs')),
      '{}'
    ),
    who_cooks = p_payload ->> 'who_cooks',
    avoids = coalesce(
      (select array_agg(value) from jsonb_array_elements_text(p_payload -> 'avoids')),
      '{}'
    ),
    spice_level = coalesce((p_payload ->> 'spice_level')::int, 3),
    favorite_recipe_ids = coalesce(
      (select array_agg(value::uuid) from jsonb_array_elements_text(p_payload -> 'favorite_recipe_ids')),
      '{}'
    ),
    cooking_nights_per_week = coalesce((p_payload ->> 'cooking_nights_per_week')::int, 5),
    reminders_enabled = coalesce((p_payload ->> 'reminders_enabled')::boolean, false),
    onboarded = true,
    updated_at = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.complete_onboarding_v3(jsonb) to authenticated;

-- ---------------------------------------------------------------
-- NOT applied automatically — verify first (see the redesign plan's
-- "RLS — verify before relying on it" section):
--
-- The new pre-auth "Tonight" onboarding screen reads `recipes`/
-- `recipe_foods`/`foods` anonymously, before any session exists. If RLS is
-- currently disabled on these tables, anon access already works and nothing
-- below is needed. If RLS is enabled and currently authenticated-only, that
-- screen will silently return zero rows until a scoped anon read policy
-- like the one below is added. Confirm the live state first — enabling RLS
-- here unconditionally could also newly *restrict* any authenticated access
-- to user-owned (owner_id is not null) rows that currently relies on RLS
-- being off, so this is left commented out rather than applied blindly.
--
-- alter table public.recipes enable row level security;
-- alter table public.recipe_foods enable row level security;
-- alter table public.foods enable row level security;
--
-- drop policy if exists "recipes public read (global catalog)" on public.recipes;
-- create policy "recipes public read (global catalog)"
--   on public.recipes for select
--   to anon, authenticated
--   using (owner_id is null);
--
-- drop policy if exists "recipe_foods public read (global catalog)" on public.recipe_foods;
-- create policy "recipe_foods public read (global catalog)"
--   on public.recipe_foods for select
--   to anon, authenticated
--   using (exists (
--     select 1 from public.recipes r where r.id = recipe_foods.recipe_id and r.owner_id is null
--   ));
--
-- drop policy if exists "foods public read (global catalog)" on public.foods;
-- create policy "foods public read (global catalog)"
--   on public.foods for select
--   to anon, authenticated
--   using (owner_id is null);
