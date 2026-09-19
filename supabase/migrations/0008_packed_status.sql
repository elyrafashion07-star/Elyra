-- "packed" order status.
--
-- Orders are no longer pushed to Shiprocket the moment they are paid. They wait
-- in the admin panel as `paid`, and pressing "Pack" there creates the Shiprocket
-- shipment and moves the order to `packed`. The courier webhook then carries it
-- on to `shipped` and `delivered`.
--
-- Run this in the Supabase SQL editor BEFORE deploying the code that uses it:
-- until the constraint allows 'packed', marking an order packed is rejected.
-- Idempotent: safe to re-run.

alter table public.orders drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check check (
    status in ('pending', 'paid', 'packed', 'failed', 'cancelled', 'shipped', 'delivered', 'refunded')
  );
