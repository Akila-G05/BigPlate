-- Notifications table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'system',
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table notifications enable row level security;

create policy "Users read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);

-- Seed sample notifications
-- Note: Replace 'YOUR_USER_ID' with actual user IDs after signup
-- insert into notifications (user_id, title, message, type, is_read) values
--   ('YOUR_USER_ID', 'Order Confirmed!', 'Your order #ORD-001 has been confirmed and is being prepared.', 'order', false),
--   ('YOUR_USER_ID', '20% OFF Burgers!', 'Get 20% off on all burgers this week. Use code BURGER20 at checkout.', 'promo', false),
--   ('YOUR_USER_ID', 'Order Delivered', 'Your order #ORD-002 has been delivered. Enjoy your meal!', 'order', true),
--   ('YOUR_USER_ID', 'New Menu Items!', 'Check out our new Chicken Submarine and Mango Lassi. Order now!', 'promo', true),
--   ('YOUR_USER_ID', 'Welcome to Big Plate!', 'Thanks for joining us. Enjoy exclusive deals and fast delivery.', 'system', true);
