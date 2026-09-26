-- Restores the collections the header menu links to.
--
-- The menu (nav_items, seeded in 0007) points at these five handles, but the
-- collections themselves are missing from the live database, so each of those
-- menu links was a 404. Definitions are the ones in data/collections.ts.
--
-- Gifts, Gift for Her and Gift for Him fill themselves: lib/catalog.ts adds
-- every product tagged Gift for Wife / Mother / Sister to Gift for Her, and so
-- on. Kurta Buttons and Men Rings are categories, so they appear as tick-boxes
-- on the product form — tag products there to fill them.
--
-- show_on_home is false: none of these has a tile photo yet, and a homepage
-- tile without one renders as a grey box. Add a photo in the admin panel and
-- tick "Show on the homepage" if you want them there.
--
-- Run this in the Supabase SQL editor. Idempotent: an existing collection with
-- the same handle is left exactly as it is.

insert into public.collections (handle, title, description, "group", show_on_home, sort_order) values
  ('kurta-buttons', 'Men Kurta Buttons', 'Button sets for kurtas and bandhgalas.', 'category', false, 50),
  ('men-rings', 'Men Rings', 'Bold bands with matte, oxidised and polished finishes.', 'category', false, 51),
  ('gifts', 'The Gifting Edit', 'Curated jewellery, boxed and ready to give.', 'gifting', false, 50),
  ('gift-for-her', 'Gift for Her', 'Every women''s gift in one place.', 'gifting', false, 51),
  ('gift-for-him', 'Gift for Him', 'Every men''s gift in one place.', 'gifting', false, 52)
on conflict (handle) do nothing;
