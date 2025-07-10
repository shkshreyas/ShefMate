-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chef_locations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  chef_id uuid NOT NULL,
  location text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chef_locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chef_services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  chef_id uuid NOT NULL,
  service_name text NOT NULL,
  price_range text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chef_services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chefs (
  id text NOT NULL,
  user_id text UNIQUE,
  name text,
  email text,
  phone_number text,
  bio text,
  location text,
  experience_years integer,
  profile_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chefs_pkey PRIMARY KEY (id),
  CONSTRAINT chefs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.new_chefs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text,
  display_name text NOT NULL,
  bio text,
  profile_image text,
  location text,
  experience_years integer,
  rating double precision DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_income numeric DEFAULT 0,
  customers_served integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT new_chefs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.new_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  message text,
  read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT new_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT new_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.new_users(id)
);
CREATE TABLE public.new_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  chef_id uuid,
  service_id uuid,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'completed'::text, 'cancelled'::text])),
  scheduled_time timestamp without time zone,
  price numeric,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT new_orders_pkey PRIMARY KEY (id),
  CONSTRAINT new_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.new_users(id),
  CONSTRAINT new_orders_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.new_services(id),
  CONSTRAINT new_orders_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES public.new_chefs(id)
);
CREATE TABLE public.new_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  customer_id uuid,
  chef_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT new_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT new_reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.new_orders(id),
  CONSTRAINT new_reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.new_users(id),
  CONSTRAINT new_reviews_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES public.new_chefs(id)
);
CREATE TABLE public.new_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chef_id uuid,
  service_name text NOT NULL,
  description text,
  price numeric NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT new_services_pkey PRIMARY KEY (id),
  CONSTRAINT new_services_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES public.new_chefs(id)
);
CREATE TABLE public.new_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['customer'::text, 'chef'::text, 'admin'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT new_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.orders (
  id text NOT NULL,
  chef_id text,
  user_id text,
  service_id text,
  order_date date,
  order_time time without time zone,
  duration integer,
  food_preference text,
  customer_mobile text,
  order_location text,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT orders_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES public.chefs(id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.services (
  id text NOT NULL,
  chef_id text,
  service_name text,
  description text,
  price numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES public.chefs(id)
);
CREATE TABLE public.tasks (
  id integer NOT NULL DEFAULT nextval('tasks_id_seq'::regclass),
  name text NOT NULL,
  user_id text NOT NULL DEFAULT (auth.jwt() ->> 'sub'::text),
  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  name text,
  email text UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);