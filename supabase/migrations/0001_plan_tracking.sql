-- Adds meal-logging support and a uniqueness guarantee so day-plan
-- generation can be safely re-run without duplicating a day's slots.
-- Idempotent: safe to paste into the Supabase SQL editor more than once.

alter table public.plan_entries
  add column if not exists logged_at timestamptz;

create unique index if not exists plan_meal_slots_user_date_slot_key
  on public.plan_meal_slots (user_id, plan_date, meal_slot_key);
