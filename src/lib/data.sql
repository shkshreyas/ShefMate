-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chef_locations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  chef_id uuid NOT NULL,
  location text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chef_locations_pkey PRIMARY KEY (id),
  CONSTRAINT chef_locations_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES public.chefs(id)
);
CREATE TABLE public.chef_services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  chef_id uuid NOT NULL,
  service_name text NOT NULL,
  price_range text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chef_services_pkey PRIMARY KEY (id),
  CONSTRAINT chef_services_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES public.chefs(id)
);
CREATE TABLE public.chefs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone_number text NOT NULL,
  bio text NOT NULL,
  experience_years integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chefs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tasks (
  id integer NOT NULL DEFAULT nextval('tasks_id_seq'::regclass),
  name text NOT NULL,
  user_id text NOT NULL DEFAULT (auth.jwt() ->> 'sub'::text),
  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);