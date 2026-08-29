import type { Collection } from "@/lib/types";

export const collections: Collection[] = [
  // ── feature ────────────────────────────────────────────────
  { handle: "all", title: "All Jewellery", description: "Every piece in the Elyrafashion world — 925 sterling silver, hallmarked and hand-finished.", group: "feature" },
  { handle: "new-arrivals", title: "New Arrivals", description: "The freshest additions to the studio, restocked every fortnight.", group: "feature" },
  { handle: "bestseller", title: "Bestseller", description: "The pieces our customers keep coming back for.", group: "feature" },
  { handle: "rakhi-2026", title: "Rakhi Collection 2026", description: "925 sterling silver rakhis and rakhi bracelets, made to be worn long after the thread season.", group: "feature" },

  // ── category ───────────────────────────────────────────────
  { handle: "rings", title: "Rings", description: "Stackable bands, solitaires and statement silhouettes.", group: "category", image: "/images/categories/rings.jpg" },
  { handle: "bracelets", title: "Bracelets", description: "Delicate chains and sculpted cuffs for every wrist.", group: "category", image: "/images/categories/bracelets.jpg" },
  { handle: "anklets", title: "Anklets", description: "Featherlight payals with charms, beads and evil-eye detail.", group: "category", image: "/images/categories/anklets.jpg" },
  { handle: "neck-chains", title: "Neckchains", description: "Everyday silver chains in classic and modern links.", group: "category", image: "/images/categories/neckchains.png" },
  { handle: "earrings", title: "Earrings", description: "Studs, hoops and drops that carry from desk to dinner.", group: "category", image: "/images/categories/earrings.jpg" },
  { handle: "pendants", title: "Pendant Sets", description: "Pendants with matching chains, ready to gift.", group: "category", image: "/images/categories/pendant_set.jpg" },
  { handle: "brooches", title: "Brooches", description: "Sherwani and blazer brooches with old-world craft.", group: "category", image: "/images/categories/brooches.jpg" },
  // No tile art yet — seeded with show_on_home off, see 0007.
  { handle: "kurta-buttons", title: "Men Kurta Buttons", description: "Sterling silver button sets for kurtas and bandhgalas.", group: "category" },
  { handle: "bracelets-men", title: "Men Bracelets", description: "Heavier links and rudraksh-inspired silver for men.", group: "category", image: "/images/categories/men_bracelets.jpg" },
  { handle: "men-rings", title: "Men Rings", description: "Bold bands with matte, oxidised and polished finishes.", group: "category" },

  // ── occasion ───────────────────────────────────────────────
  { handle: "birthday", title: "Birthday Gifts", description: "Thoughtful silver for the person who has everything.", group: "occasion", image: "/images/occasion/birthday-gifts.png" },
  { handle: "anniversary", title: "Anniversary", description: "Pieces that mark the years, quietly and beautifully.", group: "occasion", image: "/images/occasion/anniversary.png" },
  { handle: "wedding", title: "Wedding", description: "Bridal-party silver, trousseau sets and shagun gifting.", group: "occasion", image: "/images/occasion/wedding.png" },
  { handle: "daily-wear", title: "Daily Wear", description: "Light, tarnish-resistant silver you never take off.", group: "occasion", image: "/images/occasion/daily-wear.png" },

  // ── collection ─────────────────────────────────────────────
  { handle: "luxe-gold-plated", title: "Luxe Collection — Gold Plated", description: "18k gold plating over 925 sterling silver.", group: "collection" },
  { handle: "signature-sparkle", title: "Signature Sparkle", description: "Zirconia-set pieces engineered to catch every light.", group: "collection" },
  { handle: "no-bad-vibes", title: "No Bad Vibes — Evil Eye", description: "Protective evil-eye motifs in enamel and turquoise.", group: "collection" },
  { handle: "celestial-aura", title: "Celestial Aura", description: "Stars, moons and constellations in silver.", group: "collection" },
  { handle: "beachy-vibes", title: "Beachy Vibes", description: "Shells, waves and sun-warmed silver.", group: "collection" },
  { handle: "pearl-pop", title: "Pearl Pop", description: "Freshwater pearls set against bright sterling.", group: "collection" },
  { handle: "floral-bloom", title: "Floral Bloom", description: "Petals, vines and botanical silhouettes.", group: "collection" },
  { handle: "amore", title: "Amore", description: "Hearts, knots and infinity loops for the ones you love.", group: "collection" },

  // ── budget ─────────────────────────────────────────────────
  { handle: "under-1599", title: "Under 1599", description: "Silver under Rs. 1,599.", group: "budget" },
  { handle: "under-2599", title: "Under 2599", description: "Silver under Rs. 2,599.", group: "budget" },
  { handle: "under-3599", title: "Under 3599", description: "Silver under Rs. 3,599.", group: "budget" },
  { handle: "under-4599", title: "Under 4599", description: "Silver under Rs. 4,599.", group: "budget" },
  { handle: "under-5599", title: "Under 5599", description: "Silver under Rs. 5,599.", group: "budget" },
  { handle: "under-6599", title: "Under 6599", description: "Silver under Rs. 6,599.", group: "budget" },

  // ── gender ─────────────────────────────────────────────────
  { handle: "women", title: "For Her", description: "The full women's line — rings, chains, anklets and more.", group: "gender" },
  { handle: "men", title: "For Him", description: "The full men's line — bracelets, rings, buttons and brooches.", group: "gender" },

  // ── gifting ────────────────────────────────────────────────
  { handle: "gifts", title: "The Gifting Edit", description: "Curated silver, boxed and ready to give.", group: "gifting" },
  // Filenames come straight from the uploads — note "wifi.png" is the wife tile.
  { handle: "gift-for-wife", title: "Gift for Wife", description: "For her — pendants, solitaires and everyday luxe.", group: "gifting", image: "/images/gifting/wifi.png" },
  { handle: "gift-for-husband", title: "Gift for Husband", description: "For him — bold bracelets and signet rings.", group: "gifting", image: "/images/gifting/husband.png" },
  { handle: "gift-for-sister", title: "Gift for Sister", description: "Rakhi-season favourites and forever pieces.", group: "gifting", image: "/images/gifting/sister.png" },
  { handle: "gift-for-brother", title: "Gift for Brother", description: "Rakhi bracelets and men's silver he'll actually wear.", group: "gifting", image: "/images/gifting/brother.webp" },
  { handle: "gift-for-mother", title: "Gift for Mother", description: "Timeless silver with a little sentiment.", group: "gifting", image: "/images/gifting/mother.jpg" },
  { handle: "gift-for-father", title: "Gift for Father", description: "Understated, well-made, built to last.", group: "gifting", image: "/images/gifting/father.jpg" },
  { handle: "gift-for-her", title: "Gift for Her", description: "Every women's gift in one place.", group: "gifting" },
  { handle: "gift-for-him", title: "Gift for Him", description: "Every men's gift in one place.", group: "gifting" },
];

/**
 * Everything below this line used to drive the site. It is the seed for the
 * `collections` table now (scripts/seed-supabase.ts) and nothing else reads it —
 * the storefront and the admin panel both go through lib/collections.ts, which
 * is what lets a collection added in the admin panel appear on the homepage.
 */
