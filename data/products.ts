import type { Product } from "@/lib/types";

const RING_SIZES = { label: "Ring Size", options: ["12", "14", "16", "18", "20"] };
const LENGTHS = { label: "Length", options: ['9"', '10"', '11"'] };
const CHAIN_LENGTHS = { label: "Chain Length", options: ['16"', '18"', '20"'] };

export const products: Product[] = [
  // ── RINGS ──────────────────────────────────────────────────
  {
    handle: "twin-strings-silver-ring",
    title: "Twin Strings Silver Ring",
    price: 2199, compareAt: 2399, rating: 5.0, reviews: 9,
    category: "rings", collections: ["women", "bestseller", "signature-sparkle", "daily-wear"],
    description: "Two fine sterling strands wrap into a single band — an effortless everyday ring that stacks beautifully with anything else you already wear.",
    material: "925 Sterling Silver, Rhodium finish", weight: "2.4 g",
    variants: RING_SIZES, badge: "BESTSELLER", gallery: 4,
  },
  {
    handle: "eternal-solitaire-ring",
    title: "Eternal Solitaire Ring",
    price: 2899, compareAt: 3499, rating: 4.9, reviews: 31,
    category: "rings", collections: ["women", "bestseller", "signature-sparkle", "anniversary", "gift-for-wife"],
    description: "A brilliant-cut zirconia held in a six-prong crown, set on a tapered sterling band. The proposal ring, without the proposal.",
    material: "925 Sterling Silver, AAA Zirconia", weight: "3.1 g",
    variants: RING_SIZES, gallery: 5,
  },
  {
    handle: "flora-whisper-ring",
    title: "Flora Whisper Ring",
    price: 2599, compareAt: 2899, rating: 4.8, reviews: 18,
    category: "rings", collections: ["women", "floral-bloom", "new-arrivals", "gift-for-her"],
    description: "Hand-carved petals curl around the finger in a soft open band. Adjustable at the back, so it sits right on any finger.",
    material: "925 Sterling Silver, Matte finish", weight: "2.9 g",
    variants: RING_SIZES, badge: "NEW", gallery: 4,
  },
  {
    handle: "aqua-flow-stackable-ring",
    title: "Aqua Flow Stackable Ring",
    price: 1499, compareAt: 1799, rating: 4.7, reviews: 22,
    category: "rings", collections: ["women", "beachy-vibes", "daily-wear"],
    description: "A wave in miniature. Designed to be worn three at a time — one on each of your favourite fingers.",
    material: "925 Sterling Silver", weight: "1.6 g",
    variants: RING_SIZES, gallery: 3,
  },
  {
    handle: "emerald-panda-silver-ring",
    title: "Emerald Panda 92.5 Silver Ring",
    price: 3299, compareAt: 3899, rating: 4.9, reviews: 14,
    category: "rings", collections: ["women", "signature-sparkle", "gift-for-her"],
    description: "A deep green emerald-cut stone framed by pavé zirconia. Cocktail-ring drama in a wearable scale.",
    material: "925 Sterling Silver, Emerald-cut CZ", weight: "4.2 g",
    variants: RING_SIZES, gallery: 4,
  },
  {
    handle: "celestial-star-ring",
    title: "Celestial Star Ring",
    price: 1899, rating: 4.6, reviews: 11,
    category: "rings", collections: ["women", "celestial-aura", "new-arrivals"],
    description: "A scattering of tiny stars set along an open band, finished with a single moon at the tip.",
    material: "925 Sterling Silver", weight: "2.1 g",
    variants: RING_SIZES, badge: "NEW", gallery: 3,
  },

  // ── MEN RINGS ──────────────────────────────────────────────
  {
    handle: "oxidised-signet-ring",
    title: "Oxidised Signet Ring",
    price: 3499, compareAt: 3999, rating: 4.8, reviews: 16,
    category: "men-rings", collections: ["men", "gift-for-husband", "gift-for-father"],
    description: "A broad oxidised signet with a hand-brushed face, ready to be engraved with an initial.",
    material: "925 Sterling Silver, Oxidised", weight: "7.8 g",
    variants: RING_SIZES, gallery: 4,
  },
  {
    handle: "matte-band-mens-ring",
    title: "Matte Band Men's Ring",
    price: 2299, rating: 4.7, reviews: 9,
    category: "men-rings", collections: ["men", "daily-wear", "gift-for-brother"],
    description: "A clean 6 mm sterling band in a soft matte finish. No stones, no fuss — just weight and proportion.",
    material: "925 Sterling Silver, Matte", weight: "6.4 g",
    variants: RING_SIZES, gallery: 3,
  },

  // ── BRACELETS ──────────────────────────────────────────────
  {
    handle: "lovers-loop-bracelet",
    title: "Lovers Loop Bracelet",
    price: 3099, compareAt: 3599, rating: 4.9, reviews: 27,
    category: "bracelets", collections: ["women", "bestseller", "amore", "anniversary", "gift-for-wife"],
    description: "Two interlocking loops sit at the centre of a fine cable chain — a quiet symbol, worn close.",
    material: "925 Sterling Silver", weight: "3.8 g",
    badge: "BESTSELLER", gallery: 5,
  },
  {
    handle: "modera-bracelet",
    title: "Modera Bracelet",
    price: 2799, compareAt: 3199, rating: 4.8, reviews: 13,
    category: "bracelets", collections: ["women", "daily-wear", "new-arrivals"],
    description: "An architectural flat-link bracelet with a hidden box clasp. Sits flush against the wrist.",
    material: "925 Sterling Silver", weight: "5.2 g",
    gallery: 4,
  },
  {
    handle: "linea-luxe-bracelet",
    title: "Linea Luxe Bracelet",
    price: 4299, compareAt: 4999, rating: 5.0, reviews: 8,
    category: "bracelets", collections: ["women", "luxe-gold-plated", "signature-sparkle"],
    description: "A tennis bracelet of channel-set zirconia, plated in 18k gold over sterling silver.",
    material: "925 Silver, 18k Gold Plated", weight: "6.1 g",
    gallery: 5,
  },
  {
    handle: "pearl-drop-bracelet",
    title: "Pearl Drop Bracelet",
    price: 2399, rating: 4.6, reviews: 12,
    category: "bracelets", collections: ["women", "pearl-pop", "gift-for-mother"],
    description: "Freshwater pearls spaced along a fine sterling chain, with one larger pearl at the clasp.",
    material: "925 Sterling Silver, Freshwater Pearl", weight: "3.4 g",
    gallery: 4,
  },

  // ── MEN BRACELETS ──────────────────────────────────────────
  {
    handle: "vajra-mens-bracelet",
    title: "Vajra Men's Bracelet",
    price: 5299, compareAt: 5999, rating: 4.9, reviews: 21,
    category: "bracelets-men", collections: ["men", "bestseller", "gift-for-husband"],
    description: "Heavy curb links in solid sterling, oxidised into the recesses so the edges catch the light.",
    material: "925 Sterling Silver, Oxidised", weight: "24.0 g",
    badge: "BESTSELLER", gallery: 5,
  },
  {
    handle: "rudraksh-silver-bracelet",
    title: "Rudraksh Silver Bracelet",
    price: 3899, rating: 4.7, reviews: 15,
    category: "bracelets-men", collections: ["men", "gift-for-father"],
    description: "Natural rudraksh beads capped in sterling silver, strung on a durable elastic core.",
    material: "925 Sterling Silver, Rudraksh", weight: "18.5 g",
    gallery: 4,
  },
  {
    handle: "kada-classic-mens",
    title: "Classic Sterling Kada",
    price: 6499, compareAt: 7299, rating: 4.8, reviews: 10,
    category: "bracelets-men", collections: ["men", "wedding", "gift-for-father"],
    description: "A solid open kada with a brushed outer face and polished inner. Slips on, stays put.",
    material: "925 Sterling Silver", weight: "38.0 g",
    gallery: 4,
  },

  // ── ANKLETS ────────────────────────────────────────────────
  {
    handle: "mystic-evil-eye-anklet",
    title: "Mystic Evil Eye Anklet",
    price: 1699, compareAt: 1999, rating: 4.9, reviews: 34,
    category: "anklets", collections: ["women", "bestseller", "no-bad-vibes", "daily-wear"],
    description: "Blue enamel evil-eye charms alternate with tiny sterling beads on a fine chain.",
    material: "925 Sterling Silver, Enamel", weight: "2.8 g",
    variants: LENGTHS, badge: "BESTSELLER", gallery: 4,
  },
  {
    handle: "whimsical-clover-anklet",
    title: "Whimsical Clover Evil Eye Anklet",
    price: 1899, compareAt: 2199, rating: 4.8, reviews: 19,
    category: "anklets", collections: ["women", "no-bad-vibes", "new-arrivals"],
    description: "Four-leaf clovers and evil eyes strung together — two kinds of luck on one chain.",
    material: "925 Sterling Silver, Enamel", weight: "3.0 g",
    variants: LENGTHS, badge: "NEW", gallery: 4,
  },
  {
    handle: "sparkle-hearts-anklet",
    title: "Sparkle Hearts Anklet",
    price: 1599, rating: 4.7, reviews: 25,
    category: "anklets", collections: ["women", "amore", "gift-for-her"],
    description: "Pavé-set hearts drop from a delicate rolo chain, catching light with every step.",
    material: "925 Sterling Silver, CZ", weight: "2.6 g",
    variants: LENGTHS, gallery: 3,
  },
  {
    handle: "celestial-turquoise-star-anklet",
    title: "Celestial Turquoise Star Anklet",
    price: 1799, compareAt: 2099, rating: 4.8, reviews: 16,
    category: "anklets", collections: ["women", "celestial-aura", "beachy-vibes"],
    description: "Turquoise beads and open sterling stars, spaced along a hand-linked chain.",
    material: "925 Sterling Silver, Turquoise", weight: "3.2 g",
    variants: LENGTHS, gallery: 4,
  },
  {
    handle: "starry-tide-dual-layer-anklet",
    title: "Starry Tide Dual Layer Anklet",
    price: 2199, compareAt: 2499, rating: 4.9, reviews: 12,
    category: "anklets", collections: ["women", "celestial-aura", "new-arrivals"],
    description: "Two chains at different lengths, one plain and one starred, on a single clasp.",
    material: "925 Sterling Silver", weight: "4.1 g",
    variants: LENGTHS, gallery: 4,
  },
  {
    handle: "celestial-bloom-anklet",
    title: "Celestial Bloom Anklet",
    price: 1999, rating: 4.6, reviews: 8,
    category: "anklets", collections: ["women", "floral-bloom", "celestial-aura"],
    description: "Small flowers open along the chain, each with a zirconia at the centre.",
    material: "925 Sterling Silver, CZ", weight: "3.3 g",
    variants: LENGTHS, soldOut: true, gallery: 3,
  },

  // ── NECKCHAINS ─────────────────────────────────────────────
  {
    handle: "classic-box-chain",
    title: "Classic Box Chain",
    price: 2499, compareAt: 2899, rating: 4.8, reviews: 29,
    category: "neck-chains", collections: ["women", "men", "daily-wear", "bestseller"],
    description: "A 1.8 mm box chain that works on its own or as a base for any pendant.",
    material: "925 Sterling Silver", weight: "6.8 g",
    variants: CHAIN_LENGTHS, gallery: 4,
  },
  {
    handle: "rope-twist-chain",
    title: "Rope Twist Chain",
    price: 3199, rating: 4.7, reviews: 11,
    category: "neck-chains", collections: ["men", "gift-for-brother"],
    description: "Tightly twisted sterling rope with a lobster clasp — heavier, and it shows.",
    material: "925 Sterling Silver", weight: "12.4 g",
    variants: CHAIN_LENGTHS, gallery: 3,
  },
  {
    handle: "figaro-link-chain",
    title: "Figaro Link Chain",
    price: 2899, compareAt: 3299, rating: 4.6, reviews: 14,
    category: "neck-chains", collections: ["men", "women", "daily-wear"],
    description: "The classic 3+1 figaro pattern in bright polished sterling.",
    material: "925 Sterling Silver", weight: "9.2 g",
    variants: CHAIN_LENGTHS, gallery: 3,
  },

  // ── EARRINGS ───────────────────────────────────────────────
  {
    handle: "petal-drop-earrings",
    title: "Petal Drop Earrings",
    price: 2299, compareAt: 2699, rating: 4.9, reviews: 23,
    category: "earrings", collections: ["women", "floral-bloom", "wedding", "gift-for-her"],
    description: "Sculpted sterling petals fall from a small stud, moving with you all evening.",
    material: "925 Sterling Silver", weight: "4.0 g pair",
    gallery: 4,
  },
  {
    handle: "everyday-huggie-hoops",
    title: "Everyday Huggie Hoops",
    price: 1399, rating: 4.8, reviews: 41,
    category: "earrings", collections: ["women", "daily-wear", "bestseller"],
    description: "12 mm huggies with a snap closure. The ones you put in and forget about.",
    material: "925 Sterling Silver", weight: "2.2 g pair",
    badge: "BESTSELLER", gallery: 3,
  },
  {
    handle: "pearl-halo-studs",
    title: "Pearl Halo Studs",
    price: 1899, compareAt: 2199, rating: 4.7, reviews: 17,
    category: "earrings", collections: ["women", "pearl-pop", "gift-for-mother", "wedding"],
    description: "A freshwater pearl ringed by micro-pavé zirconia, on a secure screw back.",
    material: "925 Sterling Silver, Pearl, CZ", weight: "2.8 g pair",
    gallery: 4,
  },
  {
    handle: "gold-plated-mini-hoops",
    title: "Gold Plated Mini Hoops",
    price: 1699, rating: 4.6, reviews: 13,
    category: "earrings", collections: ["women", "luxe-gold-plated", "new-arrivals"],
    description: "18k gold plating over sterling, in a 15 mm hoop that suits every ear stack.",
    material: "925 Silver, 18k Gold Plated", weight: "2.4 g pair",
    badge: "NEW", gallery: 3,
  },

  // ── PENDANTS ───────────────────────────────────────────────
  {
    handle: "infinity-heart-pendant-set",
    title: "Infinity Heart Pendant Set",
    price: 2999, compareAt: 3499, rating: 4.9, reviews: 20,
    category: "pendants", collections: ["women", "amore", "anniversary", "gift-for-wife"],
    description: "An infinity loop threaded through an open heart, on an 18-inch cable chain.",
    material: "925 Sterling Silver, CZ", weight: "4.6 g",
    variants: CHAIN_LENGTHS, gallery: 5,
  },
  {
    handle: "evil-eye-pendant-set",
    title: "Evil Eye Pendant Set",
    price: 2199, rating: 4.8, reviews: 26,
    category: "pendants", collections: ["women", "no-bad-vibes", "daily-wear"],
    description: "A hand-enamelled evil eye framed in sterling, with a matching fine chain.",
    material: "925 Sterling Silver, Enamel", weight: "3.9 g",
    variants: CHAIN_LENGTHS, gallery: 4,
  },
  {
    handle: "moon-phase-pendant-set",
    title: "Moon Phase Pendant Set",
    price: 2699, compareAt: 3099, rating: 4.7, reviews: 9,
    category: "pendants", collections: ["women", "celestial-aura", "gift-for-sister"],
    description: "Eight moon phases arc across a bar pendant, each one hand-finished.",
    material: "925 Sterling Silver", weight: "4.2 g",
    variants: CHAIN_LENGTHS, gallery: 4,
  },
  {
    handle: "seashell-pendant-set",
    title: "Seashell Pendant Set",
    price: 2399, rating: 4.5, reviews: 7,
    category: "pendants", collections: ["women", "beachy-vibes", "new-arrivals"],
    description: "A cast sterling shell with the ridges left crisp, on a 16-inch chain.",
    material: "925 Sterling Silver", weight: "3.7 g",
    variants: CHAIN_LENGTHS, badge: "NEW", gallery: 3,
  },

  // ── BROOCHES ───────────────────────────────────────────────
  {
    handle: "peacock-sherwani-brooch",
    title: "Peacock Sherwani Brooch",
    price: 4599, compareAt: 5299, rating: 4.8, reviews: 11,
    category: "brooches", collections: ["men", "wedding", "gift-for-husband"],
    description: "A detailed peacock in oxidised sterling with a green enamel eye. Weddings, sorted.",
    material: "925 Sterling Silver, Enamel", weight: "9.4 g",
    gallery: 4,
  },
  {
    handle: "minimal-bar-brooch",
    title: "Minimal Bar Brooch",
    price: 2899, rating: 4.6, reviews: 6,
    category: "brooches", collections: ["men", "daily-wear"],
    description: "A slim polished bar for blazer lapels, with a locking pin back.",
    material: "925 Sterling Silver", weight: "5.8 g",
    gallery: 3,
  },

  // ── KURTA BUTTONS ──────────────────────────────────────────
  {
    handle: "royal-kurta-button-set",
    title: "Royal Kurta Button Set",
    price: 5899, compareAt: 6599, rating: 4.9, reviews: 18,
    category: "kurta-buttons", collections: ["men", "wedding", "gift-for-father"],
    description: "A set of five sterling buttons with hand-engraved detail and a chain link back.",
    material: "925 Sterling Silver", weight: "16.2 g set",
    gallery: 4,
  },
  {
    handle: "pearl-kurta-button-set",
    title: "Pearl Kurta Button Set",
    price: 4399, rating: 4.7, reviews: 12,
    category: "kurta-buttons", collections: ["men", "wedding", "pearl-pop"],
    description: "Freshwater pearls capped in sterling — five buttons, ready for the sehra bandi.",
    material: "925 Sterling Silver, Pearl", weight: "12.8 g set",
    gallery: 4,
  },

  // ── RAKHI 2026 ─────────────────────────────────────────────
  {
    handle: "infinity-bhai-rakhi",
    title: "Infinity Bhai Rakhi",
    price: 1599, compareAt: 2299, rating: 4.9, reviews: 47,
    category: "bracelets-men", collections: ["rakhi-2026", "men", "bestseller", "gift-for-brother"],
    description: "An infinity link at the centre of an adjustable sterling bracelet — a rakhi he can wear all year.",
    material: "925 Sterling Silver", weight: "5.1 g",
    badge: "BESTSELLER", gallery: 5,
  },
  {
    handle: "eternal-bloom-rakhi",
    title: "Eternal Bloom Rakhi",
    price: 1659, compareAt: 2199, rating: 4.8, reviews: 33,
    category: "bracelets", collections: ["rakhi-2026", "floral-bloom", "gift-for-brother"],
    description: "A silver flower on an adjustable red thread, finished with sterling caps.",
    material: "925 Sterling Silver, Silk Thread", weight: "3.6 g",
    gallery: 4,
  },
  {
    handle: "om-bracelet-rakhi",
    title: "Om Bracelet Rakhi",
    price: 1799, compareAt: 2399, rating: 4.9, reviews: 28,
    category: "bracelets-men", collections: ["rakhi-2026", "men", "gift-for-brother"],
    description: "The Om symbol cast in sterling, set on a woven adjustable band.",
    material: "925 Sterling Silver", weight: "4.8 g",
    gallery: 4,
  },
  {
    handle: "vajra-rakhi-bracelet",
    title: "Vajra Rakhi Bracelet",
    price: 1999, compareAt: 2599, rating: 4.8, reviews: 22,
    category: "bracelets-men", collections: ["rakhi-2026", "men", "new-arrivals"],
    description: "The vajra motif — indestructible, like the bond it stands for.",
    material: "925 Sterling Silver", weight: "6.2 g",
    badge: "NEW", gallery: 4,
  },
  {
    handle: "evil-eye-infinity-rakhi",
    title: "Evil Eye Infinity Rakhi",
    price: 1749, compareAt: 2299, rating: 4.7, reviews: 19,
    category: "bracelets-men", collections: ["rakhi-2026", "no-bad-vibes", "gift-for-brother"],
    description: "Protection and permanence together — an evil eye beside an infinity loop.",
    material: "925 Sterling Silver, Enamel", weight: "4.4 g",
    gallery: 4,
  },
  {
    handle: "kids-silver-rakhi",
    title: "Kids Silver Rakhi",
    price: 1299, rating: 4.6, reviews: 15,
    category: "bracelets", collections: ["rakhi-2026", "gift-for-brother"],
    description: "A small, lightweight sterling rakhi sized for little wrists, on a soft cord.",
    material: "925 Sterling Silver, Cotton Cord", weight: "2.2 g",
    gallery: 3,
  },
];

/* ────────────────────────────────────────────────────────────
   Lookups
   ──────────────────────────────────────────────────────────── */

export const productMap = new Map(products.map((p) => [p.handle, p]));

export function getProduct(handle: string) {
  return productMap.get(handle);
}

const BUDGET_BUCKETS: Record<string, number> = {
  "under-1599": 1599,
  "under-2599": 2599,
  "under-3599": 3599,
  "under-4599": 4599,
  "under-5599": 5599,
  "under-6599": 6599,
};

/** Everything a product belongs to: explicit tags + its category + budget buckets. */
export function productCollections(p: Product): string[] {
  const set = new Set<string>([...p.collections, p.category, "all"]);
  for (const [handle, max] of Object.entries(BUDGET_BUCKETS)) {
    if (p.price <= max) set.add(handle);
  }
  if (set.has("gift-for-wife") || set.has("gift-for-mother") || set.has("gift-for-sister")) {
    set.add("gift-for-her");
  }
  if (set.has("gift-for-husband") || set.has("gift-for-father") || set.has("gift-for-brother")) {
    set.add("gift-for-him");
  }
  if (set.has("gift-for-her") || set.has("gift-for-him")) set.add("gifts");
  return [...set];
}

export function productsInCollection(handle: string): Product[] {
  if (handle === "all") return products;
  return products.filter((p) => productCollections(p).includes(handle));
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.collections.some((c) => c.includes(q)),
  );
}

/** Homepage row — "Top 15 Trending Products". */
export const trendingProducts = [
  "twin-strings-silver-ring",
  "mystic-evil-eye-anklet",
  "lovers-loop-bracelet",
  "eternal-solitaire-ring",
  "infinity-bhai-rakhi",
  "everyday-huggie-hoops",
  "vajra-mens-bracelet",
  "flora-whisper-ring",
  "infinity-heart-pendant-set",
  "celestial-turquoise-star-anklet",
  "linea-luxe-bracelet",
  "petal-drop-earrings",
  "classic-box-chain",
  "sparkle-hearts-anklet",
  "royal-kurta-button-set",
]
  .map((h) => productMap.get(h))
  .filter((p): p is Product => Boolean(p));

/** Cart drawer upsell row. */
export const completeYourLook = [
  "eternal-bloom-rakhi",
  "infinity-bhai-rakhi",
  "flora-whisper-ring",
  "lovers-loop-bracelet",
]
  .map((h) => productMap.get(h))
  .filter((p): p is Product => Boolean(p));

export function relatedProducts(p: Product, limit = 5): Product[] {
  return products
    .filter((x) => x.handle !== p.handle && x.category === p.category)
    .concat(products.filter((x) => x.handle !== p.handle && x.category !== p.category))
    .slice(0, limit);
}
