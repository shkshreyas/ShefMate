-- WARNING: This migration will DROP and recreate all main tables, erasing all data!

-- Drop tables if they exist
drop table if exists orders

cascade;
drop table if exists services

cascade;
drop table if exists chefs

cascade;
drop table if exists users

cascade;

-- Users table (Clerk-compatible, id is text)
create table users (
   id    text primary key,
   name  text,
   email text unique
);

-- Chefs table
create table chefs (
   id                text primary key,
   user_id           text
      references users ( id )
         on delete cascade,
   name              text,
   email             text,
   phone_number      text,
   bio               text,
   location          text,
   experience_years  int,
   profile_image_url text,
   created_at        timestamptz default now(),
   constraint unique_user unique ( user_id )
);
create index idx_chefs_user_id on
   chefs (
      user_id
   );

-- Services table
create table services (
   id           text primary key,
   chef_id      text
      references chefs ( id )
         on delete cascade,
   service_name text,
   description  text,
   price        numeric,
   is_active    boolean default true,
   created_at   timestamptz default now()
);
create index idx_services_chef_id on
   services (
      chef_id
   );

-- Orders table
create table orders (
   id              text primary key,
   chef_id         text
      references chefs ( id )
         on delete cascade,
   user_id         text
      references users ( id )
         on delete set null,
   service_id      text
      references services ( id )
         on delete set null,
   order_date      date,
   order_time      time,
   duration        int,
   food_preference text,
   customer_mobile text,
   order_location  text,
   status          text default 'pending',
   created_at      timestamptz default now()
);
create index idx_orders_chef_id on
   orders (
      chef_id
   );
create index idx_orders_user_id on
   orders (
      user_id
   );
create index idx_orders_status on
   orders (
      status
   );