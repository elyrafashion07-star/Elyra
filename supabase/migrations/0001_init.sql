-- Elyrafashion — initial schema
--
-- Run this once against a fresh Supabase project (SQL Editor, or `supabase db push`).
-- It is idempotent: safe to re-run.
--
-- Reading is public (anon key). Every write goes through the service-role key,
-- which bypasses RLS — so no write policies are defined on purpose.

-- ── helpers ────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── collections ────────────────────────────────────────────────────────────
create table if not exists public.collections (
  handle       text primary key,
  title        text not null,
  description  text not null default '',
  "group"      text not null,
  image        text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint collections_group_check check (
    "group" in ('category','occasion','collection','budget','gender','gifting','feature')
  )
);

create index if not exists collections_group_idx on public.collections ("group", sort_order);

-- ── products ───────────────────────────────────────────────────────────────
create table if not exists public.products (
  handle           text primary key,
  title            text not null,
  price            numeric(10,2) not null check (price >= 0),
  compare_at       numeric(10,2) check (compare_at is null or compare_at >= price),
  rating           numeric(2,1) not null default 0 check (rating between 0 and 5),
  reviews          integer not null default 0 check (reviews >= 0),
  category         text references public.collections (handle) on update cascade on delete set null,
  description      text not null default '',
  material         text,
  weight           text,
  variant_label    text,
  variant_options  text[],
  badge            text,
  sold_out         boolean not null default false,
  gallery          integer not null default 1 check (gallery > 0),
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint products_badge_check check (badge is null or badge in ('NEW','BESTSELLER','LIMITED'))
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_sort_idx on public.products (sort_order);

-- ── product ↔ collection (many-to-many) ────────────────────────────────────
create table if not exists public.product_collections (
  product_handle    text not null references public.products (handle)    on update cascade on delete cascade,
  collection_handle text not null references public.collections (handle) on update cascade on delete cascade,
  primary key (product_handle, collection_handle)
);

create index if not exists product_collections_collection_idx
  on public.product_collections (collection_handle);

-- ── hero slides ────────────────────────────────────────────────────────────
-- `position` is the natural key so re-seeding updates in place.
create table if not exists public.hero_slides (
  position     smallint primary key,
  eyebrow      text not null default '',
  title        text not null,
  body         text not null default '',
  cta_label    text not null default '',
  cta_href     text not null default '/',
  desktop_src  text,
  mobile_src   text,
  focus        text,
  mobile_focus text,
  active       boolean not null default true,
  updated_at   timestamptz not null default now()
);

-- ── static content pages ───────────────────────────────────────────────────
create table if not exists public.info_pages (
  slug       text primary key,
  title      text not null,
  intro      text not null default '',
  -- [{ heading, body: [paragraph, ...] }, ...]
  sections   jsonb not null default '[]'::jsonb,
  kind       text not null default 'page',
  updated_at timestamptz not null default now(),
  constraint info_pages_kind_check check (kind in ('page','policy'))
);

-- ── updated_at triggers ────────────────────────────────────────────────────
drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at before update on public.collections
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists hero_slides_set_updated_at on public.hero_slides;
create trigger hero_slides_set_updated_at before update on public.hero_slides
  for each row execute function public.set_updated_at();

drop trigger if exists info_pages_set_updated_at on public.info_pages;
create trigger info_pages_set_updated_at before update on public.info_pages
  for each row execute function public.set_updated_at();

-- ── row level security: public read only ───────────────────────────────────
alter table public.collections         enable row level security;
alter table public.products            enable row level security;
alter table public.product_collections enable row level security;
alter table public.hero_slides         enable row level security;
alter table public.info_pages          enable row level security;

drop policy if exists "public read collections"         on public.collections;
drop policy if exists "public read products"            on public.products;
drop policy if exists "public read product_collections" on public.product_collections;
drop policy if exists "public read hero_slides"         on public.hero_slides;
drop policy if exists "public read info_pages"          on public.info_pages;

create policy "public read collections"         on public.collections         for select to anon, authenticated using (true);
create policy "public read products"            on public.products            for select to anon, authenticated using (true);
create policy "public read product_collections" on public.product_collections for select to anon, authenticated using (true);
create policy "public read hero_slides"         on public.hero_slides         for select to anon, authenticated using (true);
create policy "public read info_pages"          on public.info_pages          for select to anon, authenticated using (true);
