-- ============================================================================
-- Migration: 0007_fix_planning_slots.sql
-- Description:
--   1. Ensures public.plan_meal_slots table exists with proper unique constraints.
--   2. Ensures public.plan_entries table is properly linked and structured.
--   3. Adds complete Row Level Security (RLS) policies so authenticated users
--      can create, read, update, and delete their own dinner plans & slots.
-- Idempotent: safe to run multiple times in the Supabase SQL editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create plan_meal_slots table if missing
-- ----------------------------------------------------------------------------
create table if not exists public.plan_meal_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  meal_slot_key text not null default 'dinner',
  skipped boolean not null default false,
  created_at timestamptz not null default now()
);

-- Unique constraint required for chooseTonightsDinner upsert
create unique index if not exists plan_meal_slots_user_date_slot_key
  on public.plan_meal_slots (user_id, plan_date, meal_slot_key);

-- ----------------------------------------------------------------------------
-- 2. Ensure plan_entries table exists and has all required columns
-- ----------------------------------------------------------------------------
create table if not exists public.plan_entries (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.plan_meal_slots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('recipe', 'food')),
  recipe_id uuid references public.recipes(id) on delete cascade,
  food_id uuid references public.foods(id) on delete cascade,
  servings numeric not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  logged_at timestamptz
);

-- Index for fast lookup of week schedule
create index if not exists idx_plan_entries_slot_id on public.plan_entries(slot_id);
create index if not exists idx_plan_entries_user_id on public.plan_entries(user_id);

-- ----------------------------------------------------------------------------
-- 3. Row Level Security (RLS) for Planning Tables
-- ----------------------------------------------------------------------------
alter table public.plan_meal_slots enable row level security;
alter table public.plan_entries enable row level security;

-- Drop existing policies if any to avoid duplication errors
drop policy if exists "Users can manage their own plan_meal_slots" on public.plan_meal_slots;
drop policy if exists "Users can manage their own plan_entries" on public.plan_entries;

-- Create comprehensive CRUD policies
create policy "Users can manage their own plan_meal_slots"
  on public.plan_meal_slots for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own plan_entries"
  on public.plan_entries for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

