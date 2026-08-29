-- Everything the homepage shows, editable from the admin panel.
--
-- Until now the homepage read data/collections.ts and data/navigation.ts —
-- files compiled into the build. Adding a category or an occasion meant a code
-- change and a deploy. The collections table already existed and was seeded
-- from that file; this migration adds what was missing so it can be the source
-- of truth: which rows appear on the homepage, which products are "trending",
-- and the header menu.
--
-- Idempotent: safe to re-run.

-- ── trending ───────────────────────────────────────────────────────────────
-- Was a hard-coded list of 15 handles in lib/catalog.ts.
alter table public.products
  add column if not exists trending boolean not null default false;

create index if not exists products_trending_idx
  on public.products (sort_order) where trending;

-- The list as it stood, so the row looks unchanged after this runs.
update public.products set trending = true where handle in (
  'twin-strings-silver-ring', 'mystic-evil-eye-anklet', 'lovers-loop-bracelet',
  'eternal-solitaire-ring', 'infinity-bhai-rakhi', 'everyday-huggie-hoops',
  'vajra-mens-bracelet', 'flora-whisper-ring', 'infinity-heart-pendant-set',
  'celestial-turquoise-star-anklet', 'linea-luxe-bracelet', 'petal-drop-earrings',
  'classic-box-chain', 'sparkle-hearts-anklet', 'royal-kurta-button-set'
);

-- ── which collections reach the homepage ───────────────────────────────────
-- Not every collection belongs there: "All Jewellery" is a catch-all, and the
-- gift roll-ups only exist so tagging one thing implies another. Default false
-- so a new row is opt-in, then switch on exactly what the homepage renders now.
alter table public.collections
  add column if not exists show_on_home boolean not null default false;

update public.collections set show_on_home = true where handle in (
  -- Shop by Category
  'rings', 'bracelets', 'anklets', 'neck-chains', 'earrings', 'pendants',
  'brooches', 'bracelets-men',
  -- Shop by Occasion
  'birthday', 'anniversary', 'wedding', 'daily-wear',
  -- Explore Our Collections
  'luxe-gold-plated', 'signature-sparkle', 'no-bad-vibes', 'celestial-aura',
  'beachy-vibes', 'pearl-pop', 'floral-bloom', 'amore',
  -- Shop by Budget
  'under-1599', 'under-2599', 'under-3599', 'under-4599', 'under-5599', 'under-6599',
  -- The Gifting Edit
  'gift-for-wife', 'gift-for-husband', 'gift-for-sister', 'gift-for-brother',
  'gift-for-mother', 'gift-for-father'
);

create index if not exists collections_home_idx
  on public.collections ("group", sort_order) where show_on_home;

-- ── header menu ────────────────────────────────────────────────────────────
-- One self-referencing table rather than two: a dropdown entry is just an item
-- with a parent. Two levels is all the header renders, which the check enforces
-- by refusing a parent that itself has one.
create table if not exists public.nav_items (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  href       text not null,
  parent_id  uuid references public.nav_items (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nav_items_parent_idx on public.nav_items (parent_id, sort_order);

create or replace function public.nav_items_depth_check()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is not null and exists (
    select 1 from public.nav_items where id = new.parent_id and parent_id is not null
  ) then
    raise exception 'nav_items supports two levels only';
  end if;
  return new;
end $$;

drop trigger if exists nav_items_depth on public.nav_items;
create trigger nav_items_depth before insert or update on public.nav_items
  for each row execute function public.nav_items_depth_check();

drop trigger if exists nav_items_set_updated_at on public.nav_items;
create trigger nav_items_set_updated_at before update on public.nav_items
  for each row execute function public.set_updated_at();

-- The menu exactly as data/navigation.ts had it. Seeded once: this is edited in
-- the admin panel afterwards, so re-running must not undo those edits.
do $$
declare
  parent uuid;
begin
  if exists (select 1 from public.nav_items) then return; end if;

  insert into public.nav_items (label, href, sort_order)
    values ('New Arrivals', '/collections/new-arrivals', 0), ('Bestseller', '/collections/bestseller', 1);

  insert into public.nav_items (label, href, sort_order)
    values ('For Her', '/collections/women', 2) returning id into parent;
  insert into public.nav_items (label, href, parent_id, sort_order) values
    ('Rings', '/collections/rings', parent, 0),
    ('Neckchains', '/collections/neck-chains', parent, 1),
    ('Earrings', '/collections/earrings', parent, 2),
    ('Anklets', '/collections/anklets', parent, 3),
    ('Bracelets', '/collections/bracelets', parent, 4),
    ('Pendant Sets', '/collections/pendants', parent, 5);

  insert into public.nav_items (label, href, sort_order)
    values ('For Him', '/collections/men', 3) returning id into parent;
  insert into public.nav_items (label, href, parent_id, sort_order) values
    ('Bracelets', '/collections/bracelets-men', parent, 0),
    ('Kurta Buttons', '/collections/kurta-buttons', parent, 1),
    ('Rings', '/collections/men-rings', parent, 2),
    ('Brooches', '/collections/brooches', parent, 3);

  insert into public.nav_items (label, href, sort_order)
    values ('Gifting', '/collections/gifts', 4) returning id into parent;
  insert into public.nav_items (label, href, parent_id, sort_order) values
    ('Birthday', '/collections/birthday', parent, 0),
    ('Anniversary', '/collections/anniversary', parent, 1),
    ('Gift for Her', '/collections/gift-for-her', parent, 2),
    ('Gift for Him', '/collections/gift-for-him', parent, 3);

  insert into public.nav_items (label, href, sort_order)
    values ('Rakhi Collection 2026', '/collections/rakhi-2026', 5);
end $$;

-- ── row-level security ─────────────────────────────────────────────────────
-- Same shape as every other table here: the world may read, and writes only
-- happen through admin-guarded server actions on the service-role key, which
-- bypasses RLS. No write policy exists to be got wrong.
alter table public.nav_items enable row level security;

drop policy if exists "public read nav_items" on public.nav_items;
create policy "public read nav_items" on public.nav_items
  for select to anon, authenticated using (true);

-- ── collection tile artwork ────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('collection-images', 'collection-images', true)
on conflict (id) do nothing;

drop policy if exists "public read collection images" on storage.objects;
create policy "public read collection images" on storage.objects
  for select to public
  using (bucket_id = 'collection-images');
