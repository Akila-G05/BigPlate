-- Cities table for delivery zones
create table cities (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  delivery_time_min integer not null default 30,
  is_active boolean default true
);

alter table addresses add column if not exists city_id uuid references cities(id);
alter table orders add column if not exists city_id uuid references cities(id);
alter table orders add column if not exists estimated_delivery_min integer;

-- Seed delivery zones
insert into cities (name, delivery_time_min) values
  ('Colombo 01', 25),
  ('Colombo 03', 20),
  ('Rajagiriya', 30),
  ('Nugegoda', 35),
  ('Battaramulla', 40),
  ('Maharagama', 45)
on conflict (name) do nothing;
