-- Cities table
create table cities (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  delivery_time_minutes integer not null default 30,
  delivery_fee integer not null default 250,
  is_active boolean default true
);

-- Branches table
create table branches (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  phone text,
  city_id uuid references cities(id),
  is_active boolean default true
);

-- Branch delivery zones (which cities each branch delivers to)
create table branch_delivery_zones (
  id uuid default gen_random_uuid() primary key,
  branch_id uuid references branches(id) on delete cascade,
  city_id uuid references cities(id) on delete cascade,
  unique(branch_id, city_id)
);

-- Enable RLS
alter table cities enable row level security;
alter table branches enable row level security;
alter table branch_delivery_zones enable row level security;

-- Public read
create policy "Public read cities" on cities for select using (is_active = true);
create policy "Public read branches" on branches for select using (is_active = true);
create policy "Public read delivery zones" on branch_delivery_zones for select using (true);

-- Seed cities
insert into cities (name, delivery_time_minutes, delivery_fee) values
  ('Colombo 01', 25, 250),
  ('Colombo 02', 25, 250),
  ('Colombo 03', 25, 250),
  ('Colombo 04', 30, 300),
  ('Colombo 05', 30, 300),
  ('Colombo 06', 30, 300),
  ('Colombo 07', 35, 350),
  ('Rajagiriya', 30, 300),
  ('Borella', 30, 300),
  ('Nugegoda', 35, 350),
  ('Maharagama', 40, 400),
  ('Piliyandala', 45, 450),
  ('Kottawa', 45, 450),
  ('Dehiwala', 35, 350),
  ('Mount Lavinia', 40, 400),
  ('Battaramulla', 35, 350),
  ('Malabe', 40, 400),
  ('Kaduwela', 45, 450),
  ('Homagama', 50, 500),
  ('Moratuwa', 50, 500);

-- Seed branches
insert into branches (name, address, phone, city_id)
select 'Colombo 03', 'No 32, Marine Drive, Kollupitiya', '+94 77 035 9400', id from cities where name = 'Colombo 03';

insert into branches (name, address, phone, city_id)
select 'Rajagiriya', 'Rajagiriya Branch', '+94 77 779 9400', id from cities where name = 'Rajagiriya';

insert into branches (name, address, phone, city_id)
select 'Port City', 'Port City Branch', '+94 77 035 9400', id from cities where name = 'Colombo 03';

-- Seed delivery zones
-- Colombo 03 branch delivers to: Colombo 01-07, Borella, Dehiwala, Mount Lavinia
insert into branch_delivery_zones (branch_id, city_id)
select b.id, c.id from branches b, cities c
where b.name = 'Colombo 03' and c.name in ('Colombo 01', 'Colombo 02', 'Colombo 03', 'Colombo 04', 'Colombo 05', 'Colombo 06', 'Colombo 07', 'Borella', 'Dehiwala', 'Mount Lavinia');

-- Rajagiriya branch delivers to: Rajagiriya, Borella, Battaramulla, Malabe, Kaduwela
insert into branch_delivery_zones (branch_id, city_id)
select b.id, c.id from branches b, cities c
where b.name = 'Rajagiriya' and c.name in ('Rajagiriya', 'Borella', 'Battaramulla', 'Malabe', 'Kaduwela', 'Colombo 03', 'Colombo 04', 'Colombo 05');

-- Port City branch delivers to: Colombo 01-07, Dehiwala, Mount Lavinia, Moratuwa
insert into branch_delivery_zones (branch_id, city_id)
select b.id, c.id from branches b, cities c
where b.name = 'Port City' and c.name in ('Colombo 01', 'Colombo 02', 'Colombo 03', 'Colombo 04', 'Colombo 05', 'Colombo 06', 'Colombo 07', 'Dehiwala', 'Mount Lavinia', 'Moratuwa');
