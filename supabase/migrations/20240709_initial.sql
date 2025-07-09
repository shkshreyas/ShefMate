-- Users table (linked to Clerk)
create table if not exists users (
   id    uuid primary key,
   name  text,
   email text unique
);

-- Chefs table
create table if not exists chefs (
   id                uuid primary key default gen_random_uuid(),
   user_id           uuid
      references users ( id )
         on delete cascade,
   bio               text,
   location          text,
   experience_years  int,
   profile_image_url text, -- Supabase Storage URL
   created_at        timestamptz default now(),
   constraint unique_user unique ( user_id )
);
create index if not exists idx_chefs_user_id on
   chefs (
      user_id
   );

-- Services table
create table if not exists services (
   id           uuid primary key default gen_random_uuid(),
   chef_id      uuid
      references chefs ( id )
         on delete cascade,
   service_name text,
   description  text,
   price        numeric,
   is_active    boolean default true,
   created_at   timestamptz default now()
);
create index if not exists idx_services_chef_id on
   services (
      chef_id
   );

-- Orders table
create table if not exists orders (
   id              uuid primary key default gen_random_uuid(),
   chef_id         uuid
      references chefs ( id )
         on delete cascade,
   user_id         uuid
      references users ( id )
         on delete set null,
   service_id      uuid
      references services ( id )
         on delete set null,
   order_date      date,
   order_time      time,
   duration        int,
   food_preference text,
   customer_mobile text,
   status          text default 'pending', -- pending, completed, cancelled
   created_at      timestamptz default now()
);
create index if not exists idx_orders_chef_id on
   orders (
      chef_id
   );
create index if not exists idx_orders_user_id on
   orders (
      user_id
   );
create index if not exists idx_orders_status on
   orders (
      status
   );

-- For Supabase Storage: profile_image_url will store the public URL of the chef's profile photo (after compression on upload in the app). 