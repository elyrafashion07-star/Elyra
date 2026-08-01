# Images — Drop-In Guide

Abhi site pe **koi real image nahi hai**. Har image slot ek pre-sized placeholder box hai jisme
uska exact size likha hua dikhta hai (`1000 × 1000` waise hi screen pe print hota hai).

Matlab: aap jo image daloge, **layout bilkul nahi hilega** — box pehle se reserve hai (CLS = 0).

---

## 1. Fixed sizes (yahi export karna hai)

| Slot | Upload size | Ratio | Kaha dikhta hai |
|---|---|---|---|
| `logo` | **480 × 160** | 3:1 | Full logo lockup (spare slot) |
| `logoMark` | **640 × 387** | ~5:3 | Header EF monogram — `public/images/logo/logo-mark.png` |
| `heroDesktop` | **1672 × 836** | 2:1 | Hero slider, ≥640px screen |
| `heroMobile` | **800 × 1000** | 4:5 | Hero slider, mobile |
| `productCard` | **1000 × 1000** | 1:1 | Product cards (grid + sliders) |
| `productMain` | **1200 × 1500** | 4:5 | PDP main image |
| `productThumb` | **200 × 250** | 4:5 | PDP thumbnails |
| `categoryTile` | **600 × 720** | 5:6 | Shop by Category |
| `occasionTile` | **600 × 600** | 1:1 | Shop by Occasion (circle) |
| `collectionTile` | **800 × 800** | 1:1 | Explore Our Collections |
| `budgetTile` | **800 × 800** | 1:1 | Shop by Budget (circle) |
| `giftingTile` | **800 × 800** | 1:1 | The Gifting Edit |
| `genderBanner` | **1000 × 1200** | 5:6 | Shop by Gender |
| `collectionBanner` | **1920 × 500** | ~4:1 | Collection page ka top banner |
| `authenticityBanner` | **1200 × 1500** | 4:5 | Certificate of Authenticity |
| `cartThumb` | **150 × 150** | 1:1 | Cart drawer / search dropdown |
| `uspIcon` | **96 × 96** | 1:1 | USP icons |
| `payBadge` | **120 × 80** | 3:2 | Payment badges |
| `videoPoster` | **1280 × 720** | 16:9 | Video section poster |

Yaad rakhne ke liye sirf **3 ratios**: `1:1`, `4:5`, `5:6`.

Single source of truth → [lib/imageSizes.ts](lib/imageSizes.ts). Wahan number badla, poori site pe apply ho jayega.

Header ka monogram `logo.jpeg` se crop kiya gaya hai (white background hata ke transparent PNG).
Logo file badle to dobara banane ke liye: `python3 scripts/make-logo-mark.py`.

---

## 2. Image kaise daalein

Har image `<FixedImage />` se render hoti hai. Sirf `src` add karna hai:

```tsx
// pehle (placeholder)
<FixedImage slot="productCard" alt="Twin Strings Silver Ring" />

// baad me (real image)
<FixedImage slot="productCard" src="/images/products/twin-strings-1.jpg" alt="Twin Strings Silver Ring" />
```

`width` / `height` aapko likhne ki zaroorat **nahi** — wo `slot` se automatic aa jaate hain.

### Kaha-kaha `src` add karna hai

| Kya | File |
|---|---|
| Hero slides | [data/hero.ts](data/hero.ts) → `desktopSrc` + `mobileSrc`, aur crop ke liye `focus` / `mobileFocus` |
| Category / Collection / Budget / Gifting / Occasion tiles | [components/ui/TileCard.tsx](components/ui/TileCard.tsx) me `src` prop pass hota hai — tile list [data/collections.ts](data/collections.ts) me hai |
| Product images | [components/product/ProductCard.tsx](components/product/ProductCard.tsx) aur [components/product/ProductDetail.tsx](components/product/ProductDetail.tsx) |
| Gender banners | [components/home/ShopByGender.tsx](components/home/ShopByGender.tsx) |
| Authenticity banner | [components/home/AuthenticityBanner.tsx](components/home/AuthenticityBanner.tsx) |
| Video poster | [components/home/VideoSection.tsx](components/home/VideoSection.tsx) |
| Collection page banner | [app/collections/[handle]/page.tsx](app/collections/[handle]/page.tsx) |
| Logo | [components/layout/Logo.tsx](components/layout/Logo.tsx) |

### Product images ko data-driven banane ka tareeka

Sabse saaf tareeka — `Product` type me ek `images: string[]` field add karo:

```ts
// lib/types.ts
export type Product = {
  // …
  images: string[];   // ["/images/products/ring-1.jpg", "/images/products/ring-2.jpg"]
};
```

Phir `ProductCard` me `src={product.images[0]}` aur `ProductDetail` me `src={product.images[active]}`.
`gallery` field (jo abhi thumbnail count decide karta hai) ki jagah `images.length` use ho jayega.

---

## 3. Folder structure

```
public/images/
├── banners/       b1 · b2 · b3 — 1672×941, hero slider (live)
├── hero/          1672×836 (desktop) · 800×1000 (mobile)
├── products/      1000×1000 (card) · 1200×1500 (PDP) · 200×250 (thumb)
├── categories/    600×720
├── collections/   800×800
├── budget/        800×800
├── gifting/       800×800
├── occasion/      600×600
├── gender/        1000×1200
└── banners/       1920×500 · 1200×1500 · 1280×720
```

---

## 4. Export tips

- **Format**: JPG (photos) ya PNG (transparent). Next.js khud AVIF/WebP me convert karega — `next.config.ts` me set hai.
- **Background**: product shots ke liye off-white `#FAF7F2` (site ka bg) use karo, taaki tile ke saath blend ho.
- **Quality**: 80–85 JPG kaafi hai. 1000×1000 shot ~120 KB se neeche rakho.
- **Naming**: `handle` ke hisaab se rakho — `twin-strings-silver-ring-1.jpg` — taaki baad me automate karna aasan ho.
- **Circle tiles** (Occasion, Budget): image square hi export karo, CSS khud circle crop kar deta hai. Subject ko center me rakho.
