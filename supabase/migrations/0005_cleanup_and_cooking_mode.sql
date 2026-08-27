-- ============================================================================
-- Migration: 0005_cleanup_and_cooking_mode.sql
-- Description:
--   1. Drops legacy/redundant columns from profiles and foods.
--   2. Adds directions (step-by-step) and youtube_url to recipes.
--   3. Cleans up obsolete user_meal_slots table.
-- Idempotent: safe to run in the Supabase SQL editor multiple times.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Profiles Table: Remove legacy/unused single-field dietary columns
-- ----------------------------------------------------------------------------
alter table public.profiles
  drop column if exists cuisine,
  drop column if exists avoid_meat,
  drop column if exists avoid_spicy,
  drop column if exists allergies,
  drop column if exists diet_type,
  drop column if exists meals_per_day;

-- ----------------------------------------------------------------------------
-- 2. Foods Table: Remove unused brand/restaurant metadata for raw cooking
-- ----------------------------------------------------------------------------
alter table public.foods
  drop column if exists brand_name,
  drop column if exists restaurant_name;

-- ----------------------------------------------------------------------------
-- 3. Recipes Table: Add step-by-step Cooking Mode directions & YouTube video link
-- ----------------------------------------------------------------------------
alter table public.recipes
  add column if not exists directions text[] not null default '{}'::text[],
  add column if not exists youtube_url text;

-- ----------------------------------------------------------------------------
-- 4. Clean up obsolete user_meal_slots table if no longer referenced
-- ----------------------------------------------------------------------------
drop table if exists public.user_meal_slots cascade;

