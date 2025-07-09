alter table chefs add column profile_image_url

text;
-- Drop foreign key constraints
alter table chefs drop constraint chefs_user_id_fkey;
alter table services drop constraint services_chef_id_fkey;
alter table orders drop constraint orders_user_id_fkey;
alter table orders drop constraint orders_chef_id_fkey;
alter table orders drop constraint orders_service_id_fkey;

-- Drop primary key constraints
alter table users drop constraint users_pkey;
alter table chefs drop constraint chefs_pkey;
alter table services drop constraint services_pkey;
alter table orders drop constraint orders_pkey;

-- Convert all relevant uuid columns to text using cast
alter table users alter column id type text using id::text;
alter table chefs alter column id type text using id::text;
alter table chefs alter column user_id type text using user_id::text;
alter table services alter column id type text using id::text;
alter table services alter column chef_id type text using chef_id::text;
alter table orders alter column id type text using id::text;
alter table orders alter column chef_id type text using chef_id::text;
alter table orders alter column user_id type text using user_id::text;
alter table orders alter column service_id type text using service_id::text;

-- Recreate primary key constraints
alter table users add primary key (id);
alter table chefs add primary key (id);
alter table services add primary key (id);
alter table orders add primary key (id);

-- Recreate foreign key constraints
alter table chefs add constraint chefs_user_id_fkey foreign key (user_id) references users(id) on delete cascade;
alter table services add constraint services_chef_id_fkey foreign key (chef_id) references chefs(id) on delete cascade;
alter table orders add constraint orders_user_id_fkey foreign key (user_id) references users(id) on delete set null;
alter table orders add constraint orders_chef_id_fkey foreign key (chef_id) references chefs(id) on delete cascade;
alter table orders add constraint orders_service_id_fkey foreign key (service_id) references services(id) on delete set null;