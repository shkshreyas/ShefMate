-- Enable RLS on users table (if not already enabled)
alter table users enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow all inserts on users" on users;
drop policy if exists "Allow all select on users" on users;
drop policy if exists "Allow all update on users" on users;
drop policy if exists "Allow all delete on users" on users;

-- Create policies with correct syntax
create policy "Allow all inserts on users"
on users
for insert
with check (true);

create policy "Allow all select on users"
on users
for select
using (true);

create policy "Allow all update on users"
on users
for update
using (true);

create policy "Allow all delete on users"
on users
for delete
using (true); 