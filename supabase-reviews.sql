-- Reviews table
create table reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  order_id uuid references orders(id) on delete cascade not null,
  menu_item_id uuid references menu_items(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, order_id, menu_item_id)
);

-- Enable RLS
alter table reviews enable row level security;

-- Policies
create policy "Users read own reviews" on reviews for select using (auth.uid() = user_id);
create policy "Users insert own reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "Users update own reviews" on reviews for update using (auth.uid() = user_id);

-- Index for faster lookups
create index idx_reviews_user_order_item on reviews(user_id, order_id, menu_item_id);
