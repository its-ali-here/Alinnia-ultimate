-- Step 1: Create the new organization_users table
CREATE TABLE public.organization_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  user_id uuid,
  full_name text,
  email text UNIQUE,
  avatar_url text,
  phone text,
  timezone text DEFAULT 'UTC'::text,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])),
  designation text,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_users_pkey PRIMARY KEY (id),
  CONSTRAINT organization_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Step 2: Migrate the data from the old tables to the new table
INSERT INTO public.organization_users (organization_id, user_id, full_name, email, avatar_url, phone, timezone, role, designation, joined_at)
SELECT
  om.organization_id,
  p.id,
  p.full_name,
  p.email,
  p.avatar_url,
  p.phone,
  p.timezone,
  om.role,
  om.designation,
  om.joined_at
FROM
  public.profiles AS p
JOIN
  public.organization_members AS om
ON
  p.id = om.user_id;

-- Step 3: Drop the old tables
DROP TABLE public.organization_members;
DROP TABLE public.profiles;
