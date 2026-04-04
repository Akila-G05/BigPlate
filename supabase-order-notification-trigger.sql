-- Create a function to auto-generate notifications when order status changes
create or replace function notify_order_status_change()
returns trigger as $$
begin
  if OLD.status is distinct from NEW.status then
    insert into notifications (user_id, title, message, type)
    values (
      NEW.user_id,
      case
        when NEW.status = 'confirmed' then 'Order Confirmed ✓'
        when NEW.status = 'preparing' then 'Order Being Prepared 🍳'
        when NEW.status = 'delivering' then 'Order On The Way 🚴'
        when NEW.status = 'delivered' then 'Order Delivered 🎉'
        when NEW.status = 'cancelled' then 'Order Cancelled'
        else 'Order Update'
      end,
      'Your order #' || substring(NEW.id::text, 1, 8) || ' is now ' || NEW.status || '.',
      'order'
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Attach the trigger to the orders table
drop trigger if exists order_status_notification on orders;
create trigger order_status_notification
  after update on orders
  for each row
  execute function notify_order_status_change();
