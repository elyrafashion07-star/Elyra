-- Cash on Delivery, alongside the existing Razorpay ("prepaid") flow.
--
-- A COD order skips Razorpay entirely: there is no signature to verify and
-- nothing to collect online, so it is inserted already `confirmed` and joins
-- paid orders in the same "ready to pack" queue in the admin panel.
-- `payment_method` is what tells the two flows apart everywhere downstream —
-- which Shiprocket payment_method to send, whether a refund is even possible,
-- and what the admin sees on the order.
--
-- Run this in the Supabase SQL editor BEFORE deploying the code that uses it.
-- Idempotent: safe to re-run.

alter table public.orders add column if not exists payment_method text not null default 'prepaid';

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check check (payment_method in ('prepaid', 'cod'));

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check check (
    status in ('pending', 'confirmed', 'paid', 'packed', 'failed', 'cancelled', 'shipped', 'delivered', 'refunded')
  );

create index if not exists orders_payment_method_idx on public.orders (payment_method);
