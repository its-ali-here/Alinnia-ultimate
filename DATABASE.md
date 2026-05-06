-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- See supabase/migrations/ for the actual migration files.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  avatar_url text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name text,
  last_name text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,                                -- NULL for anonymous sessions
  session_id uuid,                             -- anonymous session link
  name text NOT NULL,
  description text,
  address text,
  budget numeric NOT NULL,
  status text NOT NULL DEFAULT 'planning'::text CHECK (status = ANY (ARRAY['planning'::text, 'in_progress'::text, 'completed'::text, 'on_hold'::text])),
  -- Consumer-facing fields
  room_type text CHECK (room_type = ANY (ARRAY['bathroom'::text, 'kitchen'::text, 'bedroom'::text, 'living-room'::text, 'outdoor'::text, 'full-home'::text, 'extension'::text, 'multi-room'::text])),
  zip_code text,
  city text,
  country text,
  inspiration_text text,
  guide_purchased boolean NOT NULL DEFAULT false,
  guide_purchased_at timestamp with time zone,
  -- Property details (kept for project tracker phase)
  home_type text CHECK (home_type = ANY (ARRAY['house'::text, 'apartment'::text, 'flat'::text, 'townhouse'::text, 'period'::text, 'heritage'::text])),
  total_area numeric,
  currency text DEFAULT 'USD'::text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.project_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  session_id uuid,
  image_type text NOT NULL CHECK (image_type = ANY (ARRAY['current'::text, 'inspiration'::text])),
  storage_path text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_images_pkey PRIMARY KEY (id),
  CONSTRAINT project_images_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

CREATE TABLE public.renovation_analyses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  feasibility_score numeric NOT NULL,
  achievable_pct numeric NOT NULL,
  fits_budget jsonb NOT NULL DEFAULT '[]',
  doesnt_fit_budget jsonb NOT NULL DEFAULT '[]',
  summary_text text,
  raw_ai_response jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT renovation_analyses_pkey PRIMARY KEY (id),
  CONSTRAINT renovation_analyses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

CREATE TABLE public.renovation_guides (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  materials_list jsonb NOT NULL DEFAULT '[]',
  work_sequence jsonb NOT NULL DEFAULT '[]',
  contractors_needed jsonb NOT NULL DEFAULT '[]',
  quote_questions jsonb NOT NULL DEFAULT '[]',
  red_flags jsonb NOT NULL DEFAULT '[]',
  project_tracker jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT renovation_guides_pkey PRIMARY KEY (id),
  CONSTRAINT renovation_guides_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  project_id uuid NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT payments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

CREATE TABLE public.price_intelligence (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  item_name text NOT NULL,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY['material'::text, 'labor'::text])),
  unit text NOT NULL,
  price numeric NOT NULL,
  location text NOT NULL,
  state text,
  region text CHECK (region = ANY (ARRAY['northeast'::text, 'southeast'::text, 'midwest'::text, 'west'::text, 'southwest'::text])),
  room_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT price_intelligence_pkey PRIMARY KEY (id)
);

-- Project tracker tables (accessible after $79 purchase)

CREATE TABLE public.phase_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  construction_path text NOT NULL CHECK (construction_path = ANY (ARRAY['masonry'::text, 'timber'::text, 'precision'::text, 'kitchen-reno'::text, 'bathroom-reno'::text, 'full-reno'::text, 'extension'::text, 'bedroom-reno'::text, 'multi-room'::text, 'living-room-reno'::text, 'outdoor'::text])),
  phase_key text NOT NULL,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT phase_templates_pkey PRIMARY KEY (id)
);

CREATE TABLE public.phases (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  parent_phase_id uuid,
  name text NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  budget numeric NOT NULL,
  status text NOT NULL DEFAULT 'not_started'::text CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text])),
  completion_percentage numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT phases_pkey PRIMARY KEY (id),
  CONSTRAINT phases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT phases_parent_phase_id_fkey FOREIGN KEY (parent_phase_id) REFERENCES public.phases(id)
);

CREATE TABLE public.project_phases (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  phase_template_id uuid NOT NULL,
  is_selected boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_phases_pkey PRIMARY KEY (id),
  CONSTRAINT project_phases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_phases_phase_template_id_fkey FOREIGN KEY (phase_template_id) REFERENCES public.phase_templates(id)
);

CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  phase_id uuid,
  name text NOT NULL,
  description text,
  due_date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'todo'::text CHECK (status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'done'::text])),
  assignee_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES public.phases(id)
);

CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  phase_id uuid,
  task_id uuid,
  description text NOT NULL,
  amount numeric NOT NULL,
  date timestamp with time zone NOT NULL,
  category text NOT NULL,
  vendor text,
  invoice_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  unit_rate numeric,
  quantity numeric,
  unit text,
  notes text,
  payment_method text,
  paid_by text,
  delivery_status text NOT NULL DEFAULT 'delivered'::text CHECK (delivery_status = ANY (ARRAY['ordered'::text, 'delivered'::text, 'consumed'::text])),
  expected_delivery_date date,
  confirmed_delivery_date date,
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT expenses_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES public.phases(id),
  CONSTRAINT expenses_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id)
);

CREATE TABLE public.material_stock (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  material_name text NOT NULL,
  unit text NOT NULL DEFAULT ''::text,
  on_hand_qty numeric NOT NULL DEFAULT 0,
  reorder_threshold numeric,
  lead_time_days integer NOT NULL DEFAULT 2,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT material_stock_pkey PRIMARY KEY (id),
  CONSTRAINT material_stock_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
