-- ============================================================
-- Alinnia Product Overhaul Migration
-- Pivots from contractor PM tool to consumer freemium analysis
-- ============================================================

-- 1. DROP removed tables (order respects FK dependencies)
DROP TABLE IF EXISTS public.documents CASCADE;

-- 2. MODIFY projects table
--    Remove old construction-management columns
ALTER TABLE public.projects
  DROP COLUMN IF EXISTS construction_path,
  DROP COLUMN IF EXISTS scope_of_work,
  DROP COLUMN IF EXISTS is_project_underway,
  DROP COLUMN IF EXISTS has_basement,
  DROP COLUMN IF EXISTS number_of_floors,
  DROP COLUMN IF EXISTS has_drawings,
  DROP COLUMN IF EXISTS timeline_months,
  DROP COLUMN IF EXISTS home_era,
  DROP COLUMN IF EXISTS site_type,
  DROP COLUMN IF EXISTS project_type,
  DROP COLUMN IF EXISTS contingency_pct;

--    Make start_date / end_date optional (analysis happens before scheduling)
ALTER TABLE public.projects
  ALTER COLUMN start_date DROP NOT NULL;

--    Add new consumer-facing columns
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS room_type text
    CHECK (room_type = ANY (ARRAY[
      'bathroom','kitchen','bedroom','living-room',
      'outdoor','full-home','extension','multi-room'
    ])),
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS inspiration_text text,
  ADD COLUMN IF NOT EXISTS guide_purchased boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS guide_purchased_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS session_id uuid;

-- 3. MODIFY price_intelligence — add US regional fields
ALTER TABLE public.price_intelligence
  ADD COLUMN IF NOT EXISTS state  text,
  ADD COLUMN IF NOT EXISTS region text CHECK (region = ANY (ARRAY[
    'northeast','southeast','midwest','west','southwest'
  ])),
  ADD COLUMN IF NOT EXISTS room_type text;

-- 4. MODIFY phase_templates — extend construction_path CHECK to new room types
ALTER TABLE public.phase_templates
  DROP CONSTRAINT IF EXISTS phase_templates_construction_path_check;

ALTER TABLE public.phase_templates
  ADD CONSTRAINT phase_templates_construction_path_check
  CHECK (construction_path = ANY (ARRAY[
    'masonry','timber','precision',
    'kitchen-reno','bathroom-reno','full-reno',
    'extension','bedroom-reno','multi-room',
    'living-room-reno','outdoor'
  ]));

-- 5. CREATE project_images table
CREATE TABLE IF NOT EXISTS public.project_images (
  id            uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id    uuid NOT NULL,
  session_id    uuid,
  image_type    text NOT NULL CHECK (image_type = ANY (ARRAY['current','inspiration'])),
  storage_path  text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_images_pkey PRIMARY KEY (id),
  CONSTRAINT project_images_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- 6. CREATE renovation_analyses table
CREATE TABLE IF NOT EXISTS public.renovation_analyses (
  id                uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id        uuid NOT NULL,
  feasibility_score numeric NOT NULL,
  achievable_pct    numeric NOT NULL,
  fits_budget       jsonb NOT NULL DEFAULT '[]',
  doesnt_fit_budget jsonb NOT NULL DEFAULT '[]',
  summary_text      text,
  raw_ai_response   jsonb,
  created_at        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT renovation_analyses_pkey PRIMARY KEY (id),
  CONSTRAINT renovation_analyses_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- 7. CREATE renovation_guides table
CREATE TABLE IF NOT EXISTS public.renovation_guides (
  id                 uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id         uuid NOT NULL,
  materials_list     jsonb NOT NULL DEFAULT '[]',
  work_sequence      jsonb NOT NULL DEFAULT '[]',
  contractors_needed jsonb NOT NULL DEFAULT '[]',
  quote_questions    jsonb NOT NULL DEFAULT '[]',
  red_flags          jsonb NOT NULL DEFAULT '[]',
  project_tracker    jsonb,
  created_at         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT renovation_guides_pkey PRIMARY KEY (id),
  CONSTRAINT renovation_guides_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- 8. CREATE payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id                       uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id                  uuid,
  project_id               uuid NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  amount_cents             integer NOT NULL,
  currency                 text NOT NULL DEFAULT 'usd',
  status                   text NOT NULL DEFAULT 'pending'
    CHECK (status = ANY (ARRAY['pending','succeeded','failed'])),
  created_at               timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT payments_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- 9. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_projects_session_id
  ON public.projects(session_id) WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_images_project_id
  ON public.project_images(project_id);

CREATE INDEX IF NOT EXISTS idx_renovation_analyses_project_id
  ON public.renovation_analyses(project_id);

CREATE INDEX IF NOT EXISTS idx_renovation_guides_project_id
  ON public.renovation_guides(project_id);

CREATE INDEX IF NOT EXISTS idx_payments_project_id
  ON public.payments(project_id);

CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi
  ON public.payments(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
