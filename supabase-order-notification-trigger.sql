-- Update the notification trigger to include Pending
create or replace function notify_order_status_change()
returns trigger as $$
declare
  status_label text;
begin
  -- Get the label of the new status
  select label into status_label from order_statuses where id = NEW.status_id;
  
  if OLD.status_id is distinct from NEW.status_id then
    insert into notifications (user_id, title, message, type)
    values (
      NEW.user_id,
      case
        when status_label = 'Pending' then 'Order Received ⏳'
        when status_label = 'Confirmed' then 'Order Confirmed ✓'
        when status_label = 'Preparing' then 'Order Being Prepared 🍳'
        when status_label = 'On the Way' then 'Order On The Way 🚴'
        when status_label = 'Delivered' then 'Order Delivered 🎉'
        else 'Order Update'
      end,
      'Your order #' || substring(NEW.id::text, 1, 8) || ' is now ' || status_label || '.',
      'order'
    );
  end if;
  return NEW;
end;
$$ language plpgsql;
