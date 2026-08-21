-- Courier tracking history.
--
-- The Shiprocket webhook already updates orders.awb / courier / status, but that
-- only ever holds the *latest* state — the journey itself was thrown away. This
-- keeps every checkpoint so both the admin and the customer can see where a
-- parcel has been, not just where it is.
--
-- Idempotent: safe to re-run.

create table if not exists public.order_tracking_events (
  id       uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,

  status      text not null,
  location    text,
  note        text,
  happened_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),

  -- Shiprocket resends the whole history on every callback, and the manual
  -- "refresh tracking" button replays it too. This is what makes those inserts
  -- idempotent instead of stacking duplicates on every poll.
  constraint order_tracking_events_unique unique (order_id, status, happened_at)
);

create index if not exists order_tracking_events_order_idx
  on public.order_tracking_events (order_id, happened_at desc);

-- ── row level security ─────────────────────────────────────────────────────
-- Read-only, and scoped the same way orders are. Writes come from the webhook
-- and admin actions via the service-role key, which bypasses RLS — a customer
-- must never be able to author their own delivery history.
alter table public.order_tracking_events enable row level security;

drop policy if exists "read own tracking"    on public.order_tracking_events;
drop policy if exists "admins read tracking" on public.order_tracking_events;

create policy "read own tracking" on public.order_tracking_events
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_tracking_events.order_id and o.user_id = (select auth.uid())
  ));

create policy "admins read tracking" on public.order_tracking_events
  for select to authenticated
  using (public.is_admin());
