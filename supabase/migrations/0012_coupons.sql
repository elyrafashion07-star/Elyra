-- Coupon codes.
--
-- Created from /admin/coupons and typed in by the customer at checkout. The
-- discount is always computed on the server (lib/orders/coupons.ts) from this
-- table — the browser only ever sends the code.
--
-- Money is paise, same as orders. `value` is a percentage (1–100) for a
-- 'percent' coupon and a paise amount for a 'flat' one.
--
-- Uses are not a counter on this table: they are counted from `orders.coupon_code`,
-- so a failed, cancelled or refunded order gives its use back automatically.
--
-- Run this in the Supabase SQL editor BEFORE deploying the code that uses it.
-- Idempotent: safe to re-run.

create table if not exists public.coupons (
  code        text primary key,
  description text not null default '',
  kind        text not null,
  value       integer not null check (value > 0),

  -- Cap on a percentage discount, e.g. "20% off up to Rs. 500". Null = no cap.
  max_discount_paise integer check (max_discount_paise is null or max_discount_paise > 0),
  min_order_paise    integer not null default 0 check (min_order_paise >= 0),

  starts_at  timestamptz,
  expires_at timestamptz,

  -- Null = unlimited.
  usage_limit    integer check (usage_limit is null or usage_limit > 0),
  per_user_limit integer check (per_user_limit is null or per_user_limit > 0),

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint coupons_code_check check (code ~ '^[A-Z0-9_-]{3,30}$'),
  constraint coupons_kind_check check (kind in ('percent', 'flat')),
  constraint coupons_percent_check check (kind <> 'percent' or value <= 100)
);

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at before update on public.coupons
  for each row execute function public.set_updated_at();

-- No policies: only the service role (server actions) reads or writes coupons,
-- so the list of codes can never be fetched from the browser.
alter table public.coupons enable row level security;

-- Snapshot of the code used, not a foreign key: deleting a coupon must not
-- touch past orders.
alter table public.orders add column if not exists coupon_code text;

create index if not exists orders_coupon_idx on public.orders (coupon_code, user_id)
  where coupon_code is not null;
