-- Cart table for logged-in users
create table cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  menu_item_id uuid references menu_items(id) on delete cascade not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, menu_item_id)
);

alter table cart_items enable row level security;

create policy "Users read own cart" on cart_items for select using (auth.uid() = user_id);
create policy "Users manage own cart" on cart_items for all using (auth.uid() = user_id);
