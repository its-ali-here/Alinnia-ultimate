-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.products (
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  category text NOT NULL CHECK (category = ANY (ARRAY['cleaning-tablet'::text, 'dish-soap'::text, 'hand-soap'::text, 'laundry'::text, 'starter-kit'::text, 'accessory'::text])),
  price_cents integer NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  currency text NOT NULL DEFAULT 'PKR'::text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_refill boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_variants (
  product_id uuid NOT NULL,
  name text NOT NULL,
  sku text NOT NULL UNIQUE,
  price_cents integer NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  stock_quantity integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.addresses (
  user_id uuid NOT NULL,
  label text,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  province text,
  postal_code text,
  phone text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  country text NOT NULL DEFAULT 'PK'::text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'cancelled'::text])),
  frequency_days integer NOT NULL DEFAULT 60,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  next_renewal_date date,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.subscription_items (
  subscription_id uuid NOT NULL,
  product_variant_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quantity integer NOT NULL DEFAULT 1,
  CONSTRAINT subscription_items_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_items_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id),
  CONSTRAINT subscription_items_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.orders (
  user_id uuid NOT NULL,
  total_cents integer NOT NULL,
  stripe_payment_intent_id text,
  shipping_address jsonb,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'fulfilled'::text, 'cancelled'::text])),
  currency text NOT NULL DEFAULT 'PKR'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.order_items (
  order_id uuid NOT NULL,
  product_variant_id uuid NOT NULL,
  unit_price_cents integer NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quantity integer NOT NULL DEFAULT 1,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.waitlist_signups (
  email text NOT NULL UNIQUE,
  city text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_signups_pkey PRIMARY KEY (id)
);