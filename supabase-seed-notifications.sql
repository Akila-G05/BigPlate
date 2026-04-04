-- Seed initial notifications for existing users
-- Run this after the notifications table is created

-- Add welcome notifications for all existing users
insert into notifications (user_id, title, message, type, is_read, created_at)
select 
  id as user_id,
  'Welcome to Big Plate! 🍽️',
  'Thanks for joining us. Enjoy exclusive deals and fast delivery.',
  'system',
  true,
  now() - interval '7 days'
from users
where id not in (select user_id from notifications where title = 'Welcome to Big Plate! 🍽️');

-- Add sample order notifications for users who have orders
insert into notifications (user_id, title, message, type, is_read, created_at)
select 
  o.user_id,
  'Order Placed! 🎉',
  'Your order #' || substring(o.id::text, 1, 8) || ' has been placed successfully.',
  'order',
  case when o.status != 'delivered' then false else true end,
  o.created_at
from orders o
where o.id not in (
  select (regexp_match(message, '#([a-f0-9-]+)'))[1]::uuid 
  from notifications 
  where title = 'Order Placed! 🎉'
);

-- Add sample promotion notifications
insert into notifications (user_id, title, message, type, is_read, created_at)
select 
  id as user_id,
  '20% OFF Burgers! 🍔',
  'Get 20% off on all burgers this week. Use code BURGER20 at checkout.',
  'promo',
  false,
  now() - interval '1 day'
from users
limit 100;
