-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL CHECK (file_type = ANY (ARRAY['drawing'::text, 'invoice'::text, 'receipt'::text, 'permit'::text, 'contract'::text, 'photo'::text, 'other'::text])),
  uploaded_by uuid,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id)
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
  CONSTRAINT expenses_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT expenses_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.documents(id)
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
CREATE TABLE public.phase_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  construction_path text NOT NULL CHECK (construction_path = ANY (ARRAY['masonry'::text, 'timber'::text, 'precision'::text, 'kitchen-reno'::text, 'bathroom-reno'::text, 'full-reno'::text, 'extension'::text, 'bedroom-reno'::text, 'multi-room'::text])),
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
CREATE TABLE public.price_intelligence (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  item_name text NOT NULL,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY['material'::text, 'labor'::text])),
  unit text NOT NULL,
  price numeric NOT NULL,
  location text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT price_intelligence_pkey PRIMARY KEY (id)
);
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
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text NOT NULL,
  description text,
  address text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  budget numeric NOT NULL,
  status text NOT NULL DEFAULT 'planning'::text CHECK (status = ANY (ARRAY['planning'::text, 'in_progress'::text, 'completed'::text, 'on_hold'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  site_type text CHECK (site_type = ANY (ARRAY['empty'::text, 'existing'::text])),
  project_type text CHECK (project_type = ANY (ARRAY['residential'::text, 'commercial'::text])),
  construction_path text CHECK (construction_path = ANY (ARRAY['masonry'::text, 'timber'::text, 'precision'::text, 'kitchen-reno'::text, 'bathroom-reno'::text, 'full-reno'::text, 'extension'::text, 'bedroom-reno'::text, 'multi-room'::text])),
  scope_of_work text CHECK (scope_of_work = ANY (ARRAY['construction'::text, 'extension'::text, 'renovation'::text])),
  is_project_underway boolean DEFAULT false,
  has_basement boolean DEFAULT false,
  city text,
  country text,
  total_area numeric,
  number_of_floors integer,
  has_drawings boolean DEFAULT false,
  timeline_months integer,
  currency text DEFAULT 'USD'::text,
  home_type text CHECK (home_type = ANY (ARRAY['house'::text, 'apartment'::text, 'flat'::text, 'townhouse'::text, 'period'::text, 'heritage'::text])),
  home_era text CHECK (home_era = ANY (ARRAY['pre-1950'::text, '1950-1980'::text, '1980-2000'::text, '2000-present'::text])),
  contingency_pct numeric DEFAULT 15,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
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