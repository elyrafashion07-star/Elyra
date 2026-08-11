-- Product images, uploaded from the admin panel.
--
-- Until now every product rendered a placeholder box: ProductCard and
-- ProductDetail called FixedImage with no `src`, and the `gallery` column was
-- only a count of how many empty slots to draw. This gives them real files.
--
-- Idempotent: safe to re-run.

-- An ordered array rather than a child table: there are at most a handful of
-- images per product, they are always read together, and the schema already
-- uses text[] this way for variant_options. Position in the array is the
-- display order, and the first entry is the card image.
alter table public.products
  add column if not exists images text[] not null default '{}';

-- `gallery` stays for now so nothing breaks mid-migration, but once the
-- storefront reads from this table it should be derived from images.
comment on column public.products.gallery is
  'Legacy placeholder count. Prefer array_length(images, 1) once images are populated.';

-- ── storage ────────────────────────────────────────────────────────────────
-- Public read: product photos are as public as the product page they sit on,
-- and serving them straight from the CDN avoids signing every URL.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Deliberately no insert/update/delete policies. Uploads go through an
-- admin-guarded server action using the service-role key, which bypasses
-- storage RLS entirely — so there is no path for a signed-in customer to write
-- here, and no policy to get wrong.
drop policy if exists "public read product images" on storage.objects;

create policy "public read product images" on storage.objects
  for select to public
  using (bucket_id = 'product-images');
