-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.nutrients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  unit text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['macro'::text, 'vitamin'::text, 'mineral'::text])),
  sort_order integer NOT NULL DEFAULT 0,
  default_weekly_amount numeric NOT NULL DEFAULT 0,
  CONSTRAINT nutrients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  household_size integer NOT NULL DEFAULT 1,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reminders_enabled boolean NOT NULL DEFAULT false,
  unit_system text NOT NULL DEFAULT 'us'::text CHECK (unit_system = ANY (ARRAY['us'::text, 'metric'::text])),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  cuisines ARRAY NOT NULL DEFAULT '{}'::text[],
  adults_count integer NOT NULL DEFAULT 2 CHECK (adults_count >= 1),
  children_count integer NOT NULL DEFAULT 0 CHECK (children_count >= 0),
  household_needs ARRAY NOT NULL DEFAULT '{}'::text[] CHECK (household_needs <@ ARRAY['diabetic'::text, 'pregnant'::text, 'training_hard'::text, 'fussy_eater'::text, 'high_blood_pressure'::text]),
  who_cooks text CHECK (who_cooks IS NULL OR (who_cooks = ANY (ARRAY['solo'::text, 'helped'::text, 'shared'::text]))),
  avoids ARRAY NOT NULL DEFAULT '{}'::text[] CHECK (avoids <@ ARRAY['beef'::text, 'seafood'::text, 'eggs'::text, 'nuts'::text, 'dairy'::text]),
  spice_level integer DEFAULT 3 CHECK (spice_level >= 1 AND spice_level <= 5),
  favorite_recipe_ids ARRAY NOT NULL DEFAULT '{}'::uuid[],
  cooking_nights_per_week integer NOT NULL DEFAULT 5 CHECK (cooking_nights_per_week = ANY (ARRAY[3, 5, 7])),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.foods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source text NOT NULL CHECK (source = ANY (ARRAY['usda'::text, 'branded'::text, 'restaurant'::text, 'custom'::text])),
  owner_id uuid,
  category text,
  serving_size numeric NOT NULL DEFAULT 100,
  serving_unit text NOT NULL DEFAULT 'g'::text,
  calories_per_serving numeric NOT NULL DEFAULT 0,
  protein_g_per_serving numeric,
  carbs_g_per_serving numeric,
  fat_g_per_serving numeric,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT foods_pkey PRIMARY KEY (id),
  CONSTRAINT foods_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.food_nutrients (
  food_id uuid NOT NULL,
  nutrient_id uuid NOT NULL,
  amount_per_100g numeric NOT NULL DEFAULT 0,
  CONSTRAINT food_nutrients_pkey PRIMARY KEY (food_id, nutrient_id),
  CONSTRAINT food_nutrients_nutrient_id_fkey FOREIGN KEY (nutrient_id) REFERENCES public.nutrients(id),
  CONSTRAINT food_nutrients_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id)
);
CREATE TABLE public.recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL,
  description text,
  image_url text,
  servings numeric NOT NULL DEFAULT 1,
  prep_minutes integer,
  cook_minutes integer,
  meal_types ARRAY NOT NULL DEFAULT '{}'::text[] CHECK (meal_types <@ ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text]),
  calories_per_serving numeric NOT NULL DEFAULT 0,
  protein_g_per_serving numeric,
  carbs_g_per_serving numeric,
  fat_g_per_serving numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  cuisine text,
  directions ARRAY NOT NULL DEFAULT '{}'::text[],
  youtube_url text,
  CONSTRAINT recipes_pkey PRIMARY KEY (id),
  CONSTRAINT recipes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.recipe_foods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL,
  food_id uuid NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL DEFAULT 'g'::text,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT recipe_foods_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_foods_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id),
  CONSTRAINT recipe_foods_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id)
);
CREATE TABLE public.plan_meal_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_date date NOT NULL,
  meal_slot_key text NOT NULL DEFAULT 'dinner'::text,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT plan_meal_slots_pkey PRIMARY KEY (id),
  CONSTRAINT plan_meal_slots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT plan_meal_slots_user_date_slot_key UNIQUE (user_id, plan_date, meal_slot_key)
);
CREATE TABLE public.plan_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL,
  user_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY['recipe'::text, 'food'::text])),
  recipe_id uuid,
  food_id uuid,
  servings numeric NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  logged_at timestamp with time zone,
  CONSTRAINT plan_entries_pkey PRIMARY KEY (id),
  CONSTRAINT plan_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT plan_entries_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id),
  CONSTRAINT plan_entries_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id)
);
CREATE TABLE public.food_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  food_id uuid NOT NULL,
  country_code text NOT NULL DEFAULT 'PK'::text,
  currency text NOT NULL DEFAULT 'PKR'::text,
  package_price numeric NOT NULL,
  package_size numeric NOT NULL DEFAULT 1000,
  package_unit text NOT NULL DEFAULT 'g'::text,
  price_per_gram numeric NOT NULL,
  store_name text DEFAULT 'Foodpanda Pandamart'::text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT food_prices_pkey PRIMARY KEY (id),
  CONSTRAINT food_prices_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id)
);