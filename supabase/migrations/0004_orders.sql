-- Orders.
--
-- Checkout is prepaid-only and requires a signed-in user, so user_id is NOT NULL
-- and every order is reachable through RLS without a guest-token escape hatch.
--
-- Money here is paise, stored as integers — not rupees. Razorpay quotes, charges
-- and *signs* every amount in integer paise, so keeping the same unit end to end
-- means reconciling a payment never comes down to comparing floats.
-- products.price stays numeric rupees: that is a display price, this is a ledger.
--
-- Idempotent: safe to re-run.

-- ── who is an admin ────────────────────────────────────────────────────────
-- Needed by the policies below. security definer so it can read profiles without
-- tripping over that table's own RLS; it only ever answers for the caller.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ── order numbers ──────────────────────────────────────────────────────────
-- Customers quote these over WhatsApp, so they are short and human — the uuid
-- primary key stays internal. Sequence-backed rather than random, because a gap
-- in the run is a useful signal when reconciling.
create sequence if not exists public.order_no_seq start 1001;

create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  order_no     text not null unique
                 default 'EF' || to_char(now(), 'YYMM') || '-' ||
                         lpad(nextval('public.order_no_seq')::text, 5, '0'),

  -- restrict, not cascade: deleting a customer must never silently erase the
  -- financial record of what they bought.
  user_id      uuid not null references auth.users (id) on delete restrict,

  status       text not null default 'pending',

  subtotal_paise integer not null check (subtotal_paise >= 0),
  shipping_paise integer not null default 0 check (shipping_paise >= 0),
  discount_paise integer not null default 0 check (discount_paise >= 0),
  total_paise    integer not null check (total_paise >= 0),
  currency       text    not null default 'INR',

  -- Address is snapshotted, never joined. Where it shipped then is not where the
  -- customer lives now.
  ship_name    text not null,
  ship_phone   text not null,
  ship_email   text not null,
  ship_line1   text not null,
  ship_line2   text,
  ship_city    text not null,
  ship_state   text not null,
  ship_pincode text not null,
  ship_country text not null default 'India',

  razorpay_order_id   text unique,
  razorpay_payment_id text unique,
  paid_at             timestamptz,

  shiprocket_order_id    text,
  shiprocket_shipment_id text,
  awb                    text,
  courier                text,

  note           text,
  failure_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint orders_status_check check (
    status in ('pending', 'paid', 'failed', 'cancelled', 'shipped', 'delivered', 'refunded')
  ),
  -- Catches a mis-computed cart before it becomes a mismatched Razorpay amount.
  constraint orders_total_check check (
    total_paise = subtotal_paise + shipping_paise - discount_paise
  )
);

-- Claim marker for the Shiprocket push. The browser callback and the Razorpay
-- webhook both try to fulfil the same order, and they can arrive at the same
-- moment — whoever sets this first wins, and the loser stands down. Added by
-- ALTER so re-running this file on an existing database picks it up.
alter table public.orders add column if not exists shipment_requested_at timestamptz;

create index if not exists orders_user_idx     on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx   on public.orders (status, created_at desc);
create index if not exists orders_razorpay_idx on public.orders (razorpay_order_id);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ── line items ─────────────────────────────────────────────────────────────
-- Everything is snapshotted. There is deliberately no foreign key to products:
-- renaming, repricing or removing a product must not rewrite what someone was
-- charged last month.
create table if not exists public.order_items (
  id       uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,

  product_handle text not null,
  title          text not null,
  variant        text,

  unit_price_paise integer not null check (unit_price_paise >= 0),
  qty              integer not null check (qty > 0),
  line_total_paise integer not null check (line_total_paise >= 0),

  constraint order_items_line_total_check check (line_total_paise = unit_price_paise * qty)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ── row level security ─────────────────────────────────────────────────────
-- Read-only for everyone holding the anon key. There are no insert or update
-- policies on purpose: orders are written by server actions and the Razorpay
-- webhook using the service-role key, which bypasses RLS. A customer must never
-- be able to author or amend their own order — that is where price tampering
-- would live.
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "read own orders"       on public.orders;
drop policy if exists "admins read orders"    on public.orders;
drop policy if exists "read own order items"  on public.order_items;
drop policy if exists "admins read order items" on public.order_items;

create policy "read own orders" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "admins read orders" on public.orders
  for select to authenticated
  using (public.is_admin());

create policy "read own order items" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = (select auth.uid())
  ));

create policy "admins read order items" on public.order_items
  for select to authenticated
  using (public.is_admin());
