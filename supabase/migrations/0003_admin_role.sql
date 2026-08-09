-- Admin role.
--
-- One column on profiles decides who can reach /admin. It lives here rather than
-- on auth.users because that table belongs to Supabase — app-level fields do not
-- go in it.
-- Idempotent: safe to re-run.

alter table public.profiles
  add column if not exists role text not null default 'customer';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('customer', 'admin'));
  end if;
end $$;

-- Partial: admins are a handful of rows, customers are the whole table.
create index if not exists profiles_admins_idx on public.profiles (role) where role <> 'customer';

-- ── stop users promoting themselves ────────────────────────────────────────
-- The "update own profile" policy from 0002 lets a signed-in user write their
-- own row, and RLS cannot see *which columns* an UPDATE touched. On its own that
-- would let anybody set role = 'admin' on themselves with nothing but the anon
-- key — the same key that ships in the browser bundle.
--
-- Column privileges are evaluated separately from RLS and close that hole. A
-- table-wide UPDATE grant beats any column-level revoke, so the broad grant has
-- to go first and be handed back one column at a time.
revoke update on public.profiles from anon, authenticated;
grant  update (full_name, phone) on public.profiles to authenticated;

-- handle_new_user() is security definer, so signup still writes every column.
-- service_role is untouched: it bypasses RLS and keeps its own grants, which is
-- what lets an admin-only server action promote somebody later.

-- ── bootstrap ──────────────────────────────────────────────────────────────
-- The first admin is made by hand, on purpose — there is no code path that
-- grants this, so there is nothing to trick into granting it.
--
-- 1. Register the account through the website first (auth.users must exist).
-- 2. Then run this once, with your own address:
--
--      update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- 3. Confirm exactly one row came back:
--
--      select id, email, role from public.profiles where role = 'admin';
