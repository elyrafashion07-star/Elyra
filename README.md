# Rakkhi — 925 Sterling Silver Jewellery Store

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 e-commerce front end,
structured after `thesilverora.com`.

**Images abhi placeholder hain** — har box apna exact pixel size screen pe dikhata hai.
Replace karne ka poora guide: [IMAGES.md](IMAGES.md).

```bash
npm run dev      # http://localhost:3000
npm run build    # 106 static pages
npm run start
npm run lint
```

---

## Homepage section order

| # | Section | Component |
|---|---|---|
| 0 | Announcement bar (phone/email + scrolling offers) | [AnnouncementBar](components/layout/AnnouncementBar.tsx) |
| 0 | Header + mega menu | [Header](components/layout/Header.tsx) |
| 1 | Hero slider (autoplay, 3 slides) | [HeroSlider](components/home/HeroSlider.tsx) |
| 2 | Trust strip (5 badges) | [TrustStrip](components/home/TrustStrip.tsx) |
| 3 | Top 15 Trending Products | [TrendingProducts](components/home/TrendingProducts.tsx) |
| 4 | Shop by Occasion (4 circles) | [ShopByOccasion](components/home/ShopByOccasion.tsx) |
| 5 | Shop by Category (10 tiles) | [ShopByCategory](components/home/ShopByCategory.tsx) |
| 6 | Explore Our Collections (8 tiles) | [ExploreCollections](components/home/ExploreCollections.tsx) |
| 7 | Shop by Budget (6 circles) | [ShopByBudget](components/home/ShopByBudget.tsx) |
| 8 | Why Rakkhi (4 USP cards) | [WhyChooseUs](components/home/WhyChooseUs.tsx) |
| 9 | Shop by Gender (2 banners) | [ShopByGender](components/home/ShopByGender.tsx) |
| 10 | The Gifting Edit (6 tiles) | [GiftingEdit](components/home/GiftingEdit.tsx) |
| 11 | Video section | [VideoSection](components/home/VideoSection.tsx) |
| 12 | Certificate of Authenticity | [AuthenticityBanner](components/home/AuthenticityBanner.tsx) |
| 13 | Newsletter | [Newsletter](components/home/Newsletter.tsx) |
| — | Footer · mobile toolbar · WhatsApp float · cart drawer | `components/layout/` |

Order [app/page.tsx](app/page.tsx) me define hai.

---

## Routes

| Route | Kya hai |
|---|---|
| `/` | Homepage |
| `/collections` | Saari collections, group-wise |
| `/collections/[handle]` | 42 collection pages — filter (category + price) aur sort ke saath |
| `/products/[handle]` | 42 PDP — gallery, variants, qty, tabs, related slider, JSON-LD |
| `/cart` | Full cart page |
| `/wishlist` | Saved products |
| `/search?q=` | Search results |
| `/account/login`, `/account/register` | Auth forms (UI only) |
| `/pages/[slug]` | About, Contact, Jewellery Care, Certificate, Track Order |
| `/policies/[slug]` | Privacy, Shipping, Refund, Terms |
| `/sitemap.xml` | Auto-generated |

---

## Data layer

Sab kuch static TypeScript files me hai — baad me API/CMS se replace karna aasan:

| File | Content |
|---|---|
| [data/products.ts](data/products.ts) | 42 products + collection membership + search helpers |
| [data/collections.ts](data/collections.ts) | 42 collections (category / occasion / collection / budget / gender / gifting) |
| [data/navigation.ts](data/navigation.ts) | Header mega-menu + footer link trees |
| [data/site.ts](data/site.ts) | Brand info, announcements, USPs, trust badges |
| [data/hero.ts](data/hero.ts) | Hero slides |
| [data/pages.ts](data/pages.ts) | Static + policy page copy |

Budget collections (`under-1599` … `under-6599`) automatic compute hote hain product price se —
`productCollections()` in [data/products.ts](data/products.ts).

---

## State

`zustand` + localStorage persist:

- [lib/store/cart.ts](lib/store/cart.ts) — lines, qty, note, coupon, drawer open/close
- [lib/store/wishlist.ts](lib/store/wishlist.ts) — saved handles

Dono hydration-safe hain — counts sirf mount ke baad render hote hain.

---

## Image system (important)

Ek hi component: [components/ui/FixedImage.tsx](components/ui/FixedImage.tsx).
Dimensions [lib/imageSizes.ts](lib/imageSizes.ts) se aate hain — `slot` naam se.

```tsx
<FixedImage slot="productCard" src="/images/products/ring-1.jpg" alt="Ring" />
```

- `width`/`height` kabhi hand se nahi likhne — `slot` decide karta hai
- Outer box `aspect-ratio` pehle lock karta hai → **zero layout shift**
- `src` na do to sized placeholder render hota hai, jisme size likha hota hai
- Har rendered box pe `data-image-slot` + `data-image-size` attributes hain — DevTools me verify karne ke liye

Poori size table + replace karne ka tareeka: **[IMAGES.md](IMAGES.md)**

---

## Abhi UI-only kya hai

Yeh sab dikhta hai par backend nahi hai — jab ready ho tab wire karna:

- Checkout button (payment gateway)
- Login / Register forms
- Newsletter subscribe
- Video section ka play button (poster + overlay ready hai)
