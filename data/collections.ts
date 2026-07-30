import type { Collection } from "@/lib/types";

export const collections: Collection[] = [
  // ── feature ────────────────────────────────────────────────
  { handle: "all", title: "All Jewellery", description: "Every piece in the Rakkhi world — 925 sterling silver, hallmarked and hand-finished.", group: "feature" },
  { handle: "new-arrivals", title: "New Arrivals", description: "The freshest additions to the studio, restocked every fortnight.", group: "feature" },
  { handle: "bestseller", title: "Bestseller", description: "The pieces our customers keep coming back for.", group: "feature" },
  { handle: "rakhi-2026", title: "Rakhi Collection 2026", description: "925 sterling silver rakhis and rakhi bracelets, made to be worn long after the thread season.", group: "feature" },

  // ── category ───────────────────────────────────────────────
  { handle: "rings", title: "Rings", description: "Stackable bands, solitaires and statement silhouettes.", group: "category" },
  { handle: "bracelets", title: "Bracelets", description: "Delicate chains and sculpted cuffs for every wrist.", group: "category" },
  { handle: "anklets", title: "Anklets", description: "Featherlight payals with charms, beads and evil-eye detail.", group: "category" },
  { handle: "neck-chains", title: "Neckchains", description: "Everyday silver chains in classic and modern links.", group: "category" },
  { handle: "earrings", title: "Earrings", description: "Studs, hoops and drops that carry from desk to dinner.", group: "category" },
  { handle: "pendants", title: "Pendant Sets", description: "Pendants with matching chains, ready to gift.", group: "category" },
  { handle: "brooches", title: "Brooches", description: "Sherwani and blazer brooches with old-world craft.", group: "category" },
  { handle: "kurta-buttons", title: "Men Kurta Buttons", description: "Sterling silver button sets for kurtas and bandhgalas.", group: "category" },
  { handle: "bracelets-men", title: "Men Bracelets", description: "Heavier links and rudraksh-inspired silver for men.", group: "category" },
  { handle: "men-rings", title: "Men Rings", description: "Bold bands with matte, oxidised and polished finishes.", group: "category" },

  // ── occasion ───────────────────────────────────────────────
  { handle: "birthday", title: "Birthday Gifts", description: "Thoughtful silver for the person who has everything.", group: "occasion" },
  { handle: "anniversary", title: "Anniversary", description: "Pieces that mark the years, quietly and beautifully.", group: "occasion" },
  { handle: "wedding", title: "Wedding", description: "Bridal-party silver, trousseau sets and shagun gifting.", group: "occasion" },
  { handle: "daily-wear", title: "Daily Wear", description: "Light, tarnish-resistant silver you never take off.", group: "occasion" },

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
  { handle: "gift-for-wife", title: "Gift for Wife", description: "For her — pendants, solitaires and everyday luxe.", group: "gifting" },
  { handle: "gift-for-husband", title: "Gift for Husband", description: "For him — bold bracelets and signet rings.", group: "gifting" },
  { handle: "gift-for-sister", title: "Gift for Sister", description: "Rakhi-season favourites and forever pieces.", group: "gifting" },
  { handle: "gift-for-brother", title: "Gift for Brother", description: "Rakhi bracelets and men's silver he'll actually wear.", group: "gifting" },
  { handle: "gift-for-mother", title: "Gift for Mother", description: "Timeless silver with a little sentiment.", group: "gifting" },
  { handle: "gift-for-father", title: "Gift for Father", description: "Understated, well-made, built to last.", group: "gifting" },
  { handle: "gift-for-her", title: "Gift for Her", description: "Every women's gift in one place.", group: "gifting" },
  { handle: "gift-for-him", title: "Gift for Him", description: "Every men's gift in one place.", group: "gifting" },
];

export const collectionMap = new Map(collections.map((c) => [c.handle, c]));

export function getCollection(handle: string) {
  return collectionMap.get(handle);
}

export function collectionsByGroup(group: Collection["group"]) {
  return collections.filter((c) => c.group === group);
}

/** Homepage: Shop by Category — order matches the reference layout. */
export const homeCategories = [
  "rings",
  "bracelets",
  "anklets",
  "neck-chains",
  "earrings",
  "pendants",
  "brooches",
  "kurta-buttons",
  "bracelets-men",
  "men-rings",
];

export const homeOccasions = ["birthday", "anniversary", "wedding", "daily-wear"];

export const homeCollections = [
  "luxe-gold-plated",
  "signature-sparkle",
  "no-bad-vibes",
  "celestial-aura",
  "beachy-vibes",
  "pearl-pop",
  "floral-bloom",
  "amore",
];

export const homeBudgets = [
  "under-1599",
  "under-2599",
  "under-3599",
  "under-4599",
  "under-5599",
  "under-6599",
];

export const homeGifting = [
  "gift-for-wife",
  "gift-for-husband",
  "gift-for-sister",
  "gift-for-brother",
  "gift-for-mother",
  "gift-for-father",
];
