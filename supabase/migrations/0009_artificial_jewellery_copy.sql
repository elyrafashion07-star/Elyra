-- The store sells artificial fashion jewellery, not silver or gold. Renames the
-- two rows whose *keys* carried the old wording; the text of everything else is
-- refreshed by re-running `npm run db:seed` after this migration.

-- products / product_collections follow via ON UPDATE CASCADE.
update public.collections set handle = 'luxe-collection' where handle = 'luxe-gold-plated';

-- The seed upserts by slug, so the old page has to go or it would sit next to
-- the new one.
delete from public.info_pages where slug = 'certificate-of-authenticity';

update public.nav_items
   set label = 'Our Quality Promise', href = '/pages/quality-promise'
 where href = '/pages/certificate-of-authenticity';

update public.nav_items
   set href = '/collections/luxe-collection'
 where href = '/collections/luxe-gold-plated';

update public.hero_slides
   set cta_href = '/collections/luxe-collection'
 where cta_href = '/collections/luxe-gold-plated';
