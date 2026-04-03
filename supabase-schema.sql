-- ============================================
-- Big Plate Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
create table users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. ADDRESSES TABLE
create table addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  label text not null,
  line1 text not null,
  line2 text,
  city text not null,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. CATEGORIES TABLE
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image text,
  sort_order integer default 0
);

-- 4. MENU ITEMS TABLE
create table menu_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price integer not null,
  image text,
  category_id uuid references categories(id) on delete set null,
  is_trending boolean default false,
  is_new boolean default false,
  discount integer default 0,
  is_available boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- 5. ORDERS TABLE
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  branch text not null,
  status text not null default 'pending',
  total integer not null,
  delivery_fee integer default 250,
  payment_method text default 'cash',
  delivery_name text not null,
  delivery_phone text not null,
  delivery_address text not null,
  delivery_instructions text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. ORDER ITEMS TABLE
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  menu_item_id uuid references menu_items(id) on delete set null,
  name text not null,
  quantity integer not null default 1,
  price integer not null,
  created_at timestamp with time zone default now()
);

-- 7. FAVORITES TABLE
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  menu_item_id uuid references menu_items(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, menu_item_id)
);

-- 8. PROMOTIONS TABLE
create table promotions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  code text unique not null,
  discount integer default 0,
  image text,
  min_order integer default 0,
  valid_until timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table users enable row level security;
alter table addresses enable row level security;
alter table menu_items enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table favorites enable row level security;
alter table promotions enable row level security;

-- Users can read/update own data
create policy "Users read own data" on users for select using (auth.uid() = id);
create policy "Users update own data" on users for update using (auth.uid() = id);
create policy "Users insert own data" on users for insert with check (auth.uid() = id);

-- Addresses
create policy "Users read own addresses" on addresses for select using (auth.uid() = user_id);
create policy "Users manage own addresses" on addresses for all using (auth.uid() = user_id);

-- Menu items - public read
create policy "Public read menu items" on menu_items for select using (true);

-- Categories - public read
create policy "Public read categories" on categories for select using (true);

-- Orders - users see own orders
create policy "Users read own orders" on orders for select using (auth.uid() = user_id);
create policy "Users create own orders" on orders for insert with check (auth.uid() = user_id);

-- Order items - users see own
create policy "Users read own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users create own order items" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Favorites
create policy "Users manage own favorites" on favorites for all using (auth.uid() = user_id);
create policy "Users read own favorites" on favorites for select using (auth.uid() = user_id);

-- Promotions - public read
create policy "Public read promotions" on promotions for select using (is_active = true);

-- ============================================
-- SEED DATA
-- ============================================

-- Categories
insert into categories (name, image, sort_order) values
  ('Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', 1),
  ('Subs', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=200&h=200&fit=crop', 2),
  ('Rice & Curry', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop', 3),
  ('Chinese', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=200&h=200&fit=crop', 4),
  ('Arabic', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop', 5),
  ('Indian', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop', 6),
  ('Kottu', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop', 7),
  ('Drinks', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop', 8);

-- Menu Items
insert into menu_items (name, description, price, image, category_id, is_trending, is_new, discount) values
  ('Tower Burger', 'Massive stacked burger with premium toppings', 3100, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', (select id from categories where name = 'Burgers'), true, false, 0),
  ('Beef Burger', 'Classic beef burger with special sauce', 850, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop', (select id from categories where name = 'Burgers'), true, false, 20),
  ('Chicken Submarine', 'Loaded chicken sub with fresh veggies', 1200, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop', (select id from categories where name = 'Subs'), true, true, 0),
  ('Devilled Chicken', 'Spicy Indo-Chinese devilled chicken', 1100, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop', (select id from categories where name = 'Chinese'), true, false, 0),
  ('Chicken Fried Rice', 'Wok-fried rice with chicken and vegetables', 950, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', (select id from categories where name = 'Rice & Curry'), false, false, 0),
  ('Chicken Biryani', 'Aromatic basmati rice with spiced chicken', 1050, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', (select id from categories where name = 'Indian'), false, false, 0),
  ('Chicken Kottu', 'Chopped roti with chicken and spices', 900, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', (select id from categories where name = 'Kottu'), false, false, 0),
  ('Garlic Naan', 'Fresh baked garlic naan bread', 350, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', (select id from categories where name = 'Indian'), false, false, 0),
  ('Chilli Beef', 'Spicy stir-fried beef with peppers', 1200, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', (select id from categories where name = 'Chinese'), false, false, 0),
  ('Mango Lassi', 'Creamy yogurt mango smoothie', 450, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', (select id from categories where name = 'Drinks'), false, false, 0);

-- Promotions
insert into promotions (title, description, code, discount, image, min_order, valid_until) values
  ('20% OFF Burgers', 'Get 20% off on all burgers this week. Use code BURGER20 at checkout.', 'BURGER20', 20, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=300&fit=crop', 1000, '2026-04-10'),
  ('Free Delivery', 'Free delivery on orders above Rs. 2000. No code needed!', 'FREEDEL', 0, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop', 2000, '2026-04-15'),
  ('Combo Deal', 'Burger + Fries + Drink combo at just Rs. 1500. Save Rs. 500!', 'COMBO1500', 25, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=300&fit=crop', 1500, '2026-04-20');
