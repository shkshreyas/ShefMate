-- Enable RLS on chefs table
alter table chefs enable row level security;

-- Allow all inserts
create policy "Allow all inserts on chefs"
on chefs
for insert
using (true);

-- Allow all selects
create policy "Allow all select on chefs"
on chefs
for select
using (true);

-- Allow all updates
create policy "Allow all update on chefs"
on chefs
for update
using (true);

-- Allow all deletes
create policy "Allow all delete on chefs"
on chefs
for delete
using (true); 