-- Rakhi is no longer a thing this store sells or promotes. Drops the featured
-- collection and its nav entry; re-running `npm run db:seed` after this
-- refreshes hero_slides position 0 to the new Bestseller banner in data/hero.ts.

-- product_collections rows for this handle go with it via ON DELETE CASCADE;
-- the products themselves are untouched (they still exist, just unlisted here).
delete from public.collections where handle = 'rakhi-2026';

delete from public.nav_items where href = '/collections/rakhi-2026';
