-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.dashboards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  description text,
  organization_id uuid NOT NULL,
  created_by uuid NOT NULL,
  layout jsonb,
  datasource_id uuid,
  filters jsonb,
  CONSTRAINT dashboards_pkey PRIMARY KEY (id),
  CONSTRAINT dashboards_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT dashboards_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT dashboards_datasource_id_fkey FOREIGN KEY (datasource_id) REFERENCES public.datasources(id)
);
CREATE TABLE public.datasources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  file_name text NOT NULL,
  organization_id uuid NOT NULL,
  uploaded_by_user_id uuid NOT NULL,
  storage_path text NOT NULL,
  status text NOT NULL DEFAULT 'uploading'::text,
  column_definitions jsonb,
  row_count integer,
  error_message text,
  processed_data jsonb,
  file_size bigint,
  CONSTRAINT datasources_pkey PRIMARY KEY (id),
  CONSTRAINT datasources_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.google_sheets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  google_sheet_id text NOT NULL UNIQUE,
  name text NOT NULL,
  organization_id uuid NOT NULL,
  created_by uuid NOT NULL,
  web_view_link text,
  last_modified timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT google_sheets_pkey PRIMARY KEY (id),
  CONSTRAINT google_sheets_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.market_pulse_feeds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE,
  structured_data jsonb,
  unstructured_articles jsonb,
  keywords_used ARRAY,
  sentiment character varying NOT NULL CHECK (sentiment::text = ANY (ARRAY['positive'::character varying, 'negative'::character varying, 'neutral'::character varying]::text[])),
  key_indicator text NOT NULL,
  ai_suggestion text NOT NULL,
  market_trends jsonb,
  last_fetched timestamp with time zone DEFAULT now(),
  next_refresh timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  fetch_priority integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT market_pulse_feeds_pkey PRIMARY KEY (id),
  CONSTRAINT market_pulse_feeds_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.market_pulse_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE,
  priority integer DEFAULT 1,
  scheduled_for timestamp with time zone DEFAULT now(),
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying]::text[])),
  retry_count integer DEFAULT 0,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT market_pulse_queue_pkey PRIMARY KEY (id),
  CONSTRAINT market_pulse_queue_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.news_api_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  api_provider character varying NOT NULL,
  requests_count integer DEFAULT 1,
  usage_date date DEFAULT CURRENT_DATE,
  cost_estimate numeric DEFAULT 0,
  organizations_processed integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT news_api_usage_pkey PRIMARY KEY (id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email text,
  industry text,
  city text,
  country text,
  logo_url text,
  description text,
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sheet_data_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  google_sheet_id text NOT NULL,
  range_name text DEFAULT 'Sheet1'::text,
  data jsonb NOT NULL,
  column_definitions jsonb,
  row_count integer,
  last_fetched timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '00:15:00'::interval),
  CONSTRAINT sheet_data_cache_pkey PRIMARY KEY (id),
  CONSTRAINT sheet_data_cache_google_sheet_id_fkey FOREIGN KEY (google_sheet_id) REFERENCES public.google_sheets(google_sheet_id)
);