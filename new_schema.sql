CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  organization_code text UNIQUE,
  email text,
  industry text,
  city text,
  country text,
  phone text,
  logo_url text,
  description text,
  business_type character varying,
  business_description text,
  business_metrics jsonb DEFAULT '{}'::jsonb,
  key_operations ARRAY DEFAULT '{}'::text[],
  pain_points ARRAY DEFAULT '{}'::text[],
  goals ARRAY DEFAULT '{}'::text[],
  onboarding_csv_path character varying,
  onboarding_completed boolean DEFAULT false,
  business_challenges ARRAY,
  ai_analysis_result jsonb,
  onboarding_completed_at timestamp with time zone,
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.organization_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  user_id uuid,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])),
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  designation text,
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  email text UNIQUE,
  avatar_url text,
  phone text,
  timezone text DEFAULT 'UTC'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.datasources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['csv'::text, 'google_sheet'::text, 'database'::text])),
  organization_id uuid NOT NULL,
  uploaded_by_user_id uuid NOT NULL,
  storage_path text,
  google_sheet_id text,
  status text NOT NULL DEFAULT 'uploading'::text,
  column_definitions jsonb,
  row_count integer,
  error_message text,
  processed_data jsonb,
  date_format text,
  CONSTRAINT datasources_pkey PRIMARY KEY (id),
  CONSTRAINT datasources_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT datasources_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  plan text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['active'::text, 'canceled'::text, 'trialing'::text])),
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  billing_cycle text NOT NULL CHECK (billing_cycle = ANY (ARRAY['monthly'::text, 'yearly'::text])),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['succeeded'::text, 'failed'::text, 'pending'::text])),
  payment_method text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id)
);
