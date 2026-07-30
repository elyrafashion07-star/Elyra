# Rakkhi — Next.js Store Structure

Reference site: thesilverora.com (Shopify). Yaha wahi structure Next.js 15 (App Router) me map kiya gaya hai.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS v4 |
| Images | `next/image` — **har jagah fixed width/height** (neeche table dekho) |
| Slider | `embla-carousel-react` (hero, product rows) |
| State | `zustand` — cart + wishlist (localStorage persist) |
| Icons | `lucide-react` |
| Data | `/data/*.ts` (static JSON) → baad me API/CMS swap karna easy |

---

## 2. Folder Structure

```
rakkhi/
├── app/
│   ├── layout.tsx                  # AnnouncementBar + Header + Footer + MobileToolbar
│   ├── page.tsx                    # HOMEPAGE (section order §4)
│   ├── globals.css
│   ├── collections/
│   │   ├── page.tsx                # saari collections ki list
│   │   └── [handle]/page.tsx       # /collections/rings, /collections/men ...
│   ├── products/
│   │   └── [handle]/page.tsx       # PDP
│   ├── cart/page.tsx
│   ├── wishlist/page.tsx
│   ├── search/page.tsx
│   ├── account/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── pages/                      # CMS-style static pages
│   │   ├── about-us/page.tsx
│   │   ├── contact-us/page.tsx
│   │   ├── jewelry-care/page.tsx
│   │   ├── certificate-of-authenticity/page.tsx
│   │   ├── track-order/page.tsx
│   │   └── return-and-refund/page.tsx
│   └── policies/
│       ├── privacy-policy/page.tsx
│       ├── shipping-policy/page.tsx
│       ├── terms-of-service/page.tsx
│       └── refund-policy/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── AnnouncementBar.tsx     # phone + email + scrolling offer ticker
│   │   ├── Header.tsx              # logo, mega-menu, search, login, wishlist, cart
│   │   ├── MegaMenu.tsx            # "For her" / "For him" / "Gifting" dropdowns
│   │   ├── MobileNav.tsx           # hamburger drawer
│   │   ├── MobileToolbar.tsx       # bottom bar: Home/Account/Wishlist/Cart/Search
│   │   ├── Footer.tsx
│   │   └── CartDrawer.tsx          # slide-in cart + "Complete Your Look"
│   │
│   ├── home/
│   │   ├── HeroSlider.tsx          # §4.1
│   │   ├── TrustStrip.tsx          # §4.2  925 Silver / Free Shipping / COD / Returns / Certified
│   │   ├── TrendingProducts.tsx    # §4.3  horizontal product slider
│   │   ├── ShopByOccasion.tsx      # §4.4  4 tiles
│   │   ├── ShopByCategory.tsx      # §4.5  10 tiles
│   │   ├── ExploreCollections.tsx  # §4.6  8 tiles
│   │   ├── ShopByBudget.tsx        # §4.7  6 tiles
│   │   ├── WhyChooseUs.tsx         # §4.8  4 USP cards
│   │   ├── ShopByGender.tsx        # §4.9  2 big banners
│   │   ├── GiftingEdit.tsx         # §4.10 6 tiles
│   │   ├── VideoSection.tsx        # §4.11 16:9 embed
│   │   ├── AuthenticityBanner.tsx  # §4.12 image + text split
│   │   └── Newsletter.tsx          # §4.13
│   │
│   ├── product/
│   │   ├── ProductCard.tsx         # image(1:1) + rating + title + MRP/sale + wishlist + Add to cart
│   │   ├── ProductGrid.tsx
│   │   ├── ProductSlider.tsx
│   │   ├── ProductGallery.tsx      # PDP thumbs + main image
│   │   ├── QuickViewModal.tsx
│   │   └── VariantPicker.tsx       # size / plating
│   │
│   ├── collection/
│   │   ├── FilterSidebar.tsx       # price, category, material
│   │   ├── SortDropdown.tsx
│   │   └── CollectionHeader.tsx    # banner + title + description
│   │
│   └── ui/
│       ├── SectionHeading.tsx      # title + subtitle (site pe har section me same)
│       ├── TileCard.tsx            # reusable category/collection tile
│       ├── Badge.tsx               # SALE / SOLD OUT / NEW
│       ├── Button.tsx
│       ├── Rating.tsx
│       └── FixedImage.tsx          # next/image wrapper — width/height compulsory
│
├── data/
│   ├── products.ts
│   ├── collections.ts
│   ├── navigation.ts               # §3 ka tree
│   └── site.ts                     # phone, email, socials, policies text
│
├── lib/
│   ├── store/cart.ts
│   ├── store/wishlist.ts
│   ├── format.ts                   # ₹ formatting (Rs. 1,599.00)
│   └── types.ts
│
└── public/images/                  # §5 folder-wise fixed sizes
```

---

## 3. Navigation Tree (header)

```
New Arrivals        → /collections/new-arrivals
BestSeller          → /collections/bestseller
For Her ▾           → /collections/women
    Rings           → /collections/rings
    Neckchains      → /collections/neck-chains
    Earrings        → /collections/earrings
    Anklets         → /collections/anklets
    Bracelets       → /collections/bracelets
    Pendant Sets    → /collections/pendants
For Him ▾           → /collections/men
    Bracelets       → /collections/bracelets-men
    Kurta Buttons   → /collections/kurta-buttons
    Rings           → /collections/men-rings
    Brooches        → /collections/brooches
Gifting ▾           → /collections/gifts
    Birthday        → /collections/birthday
    Anniversary     → /collections/anniversary
    For Her         → /collections/gift-for-her
    For Him         → /collections/gift-for-him
Rakhi Collection    → /collections/rakhi-2026
```

Right side: Search · Login/Register · Wishlist · Cart (count badge)

---

## 4. Homepage Section Order (exact, top → bottom)

| # | Section | Layout |
|---|---|---|
| 4.0 | Announcement bar | Left: 📞 phone + ✉ email · Right: auto-scrolling ticker (Free Shipping / COD / 5% off first order / 7-day returns) |
| 4.1 | **Hero Slider** | Full-width autoplay, 3–5 slides, dots. Desktop + mobile alag image |
| 4.2 | **Trust Strip** | 5 icons ek row me: 925 Sterling Silver · Free Shipping · COD Available · Easy 7-Day Returns · Certified |
| 4.3 | **Top 15 Trending Products** | Heading + subtitle, horizontal slider, 5 cards/row desktop · 2 mobile |
| 4.4 | **Shop by Occasion** | 4 tiles: Birthday Gifts, Anniversary, Wedding, Daily Wear |
| 4.5 | **Shop by Category** | 10 tiles: Rings, Bracelets, Anklets, Neckchains, Earrings, Pendant Sets, Brooches, Men Kurta Buttons, Men Bracelets |
| 4.6 | **Explore Our Collections** | 8 tiles: Luxe (gold plated), Signature Sparkle, No Bad Vibes (evil eye), Celestial Aura, Beachy Vibes, Pearl Pop, Floral Bloom, Amore |
| 4.7 | **Shop by Budget** | 6 tiles: Under 1599 / 2599 / 3599 / 4599 / 5599 / 6599 |
| 4.8 | **Why Choose Us** | 4 cards: Free Shipping · BIS Certified · 24/7 WhatsApp Support · Secure Payments |
| 4.9 | **Shop by Gender** | 2 bade banners side-by-side: Women / Men |
| 4.10 | **The Gifting Edit** | 6 tiles: Gift for Wife / Husband / Sister / Brother / Mother / Father |
| 4.11 | **Video Section** | 16:9 brand video |
| 4.12 | **Certificate of Authenticity** | Image left + text right (split banner) |
| 4.13 | **Newsletter** | "Join Our Mailing List" + email input |
| 4.14 | Footer | 4 columns (§6) |
| — | Floating | WhatsApp chat button (bottom-right), Mobile bottom toolbar |

---

## 5. IMAGE SIZES — sab fixed (yeh sabse important part)

**Rule:** har `<Image>` pe `width` + `height` mandatory. `fill` sirf hero me, aur wahan bhi parent pe fixed aspect box. Isse **CLS zero** rahega.

| Kaha use hoga | Upload size (px) | Aspect | Display size | `next/image` props |
|---|---|---|---|---|
| **Logo** | 480 × 160 | 3:1 | 150×50 | `width={150} height={50}` `priority` |
| **Hero slider — desktop** | 1920 × 800 | 12:5 | full-width | `width={1920} height={800}` `priority` |
| **Hero slider — mobile** | 800 × 1000 | 4:5 | full-width | `width={800} height={1000}` |
| **Product card** | 1000 × 1000 | **1:1** | 300×300 | `width={1000} height={1000}` `sizes="(max-width:768px) 50vw, 20vw"` |
| **PDP main image** | 1200 × 1500 | 4:5 | 600×750 | `width={1200} height={1500}` `priority` |
| **PDP thumbnail** | 200 × 250 | 4:5 | 80×100 | `width={200} height={250}` |
| **Category tile** | 600 × 720 | 5:6 | 240×288 | `width={600} height={720}` |
| **Occasion tile** | 600 × 600 | 1:1 | 280×280 | `width={600} height={600}` |
| **Collection tile** | 800 × 800 | 1:1 | 320×320 | `width={800} height={800}` |
| **Budget tile** | 800 × 800 | 1:1 | 260×260 | `width={800} height={800}` |
| **Gifting tile** | 800 × 800 | 1:1 | 260×260 | `width={800} height={800}` |
| **Gender banner** | 1000 × 1200 | 5:6 | half-width | `width={1000} height={1200}` |
| **Collection page banner** | 1920 × 500 | ~4:1 | full-width | `width={1920} height={500}` |
| **Authenticity banner** | 1200 × 1500 | 4:5 | 500×625 | `width={1200} height={1500}` |
| **Cart drawer thumb** | 150 × 150 | 1:1 | 75×75 | `width={150} height={150}` |
| **USP / trust icon** | 96 × 96 | 1:1 | 48×48 | `width={96} height={96}` |
| **Payment / badge icon** | 120 × 80 | 3:2 | 60×40 | `width={120} height={80}` |
| **Video poster** | 1280 × 720 | 16:9 | full-width | `width={1280} height={720}` |

### Shortcut — sirf 3 ratios yaad rakho
- **1:1** → product cards, collection/budget/gifting/occasion tiles
- **4:5** → PDP, authenticity banner, mobile hero
- **5:6** → category tiles, gender banners

### Enforce karne ka tareeka
`components/ui/FixedImage.tsx` ek wrapper banega jisme `width`/`height` required props hain — bina size ke image daalna TypeScript pe hi fail ho jaayega.

```tsx
// har tile ka box fixed rehta hai, image andar crop hoti hai
<div className="relative aspect-square overflow-hidden rounded-lg">
  <Image src={src} alt={alt} width={800} height={800}
         className="h-full w-full object-cover" />
</div>
```

### next.config.ts
```ts
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 768, 1024, 1280, 1920],
  imageSizes: [96, 150, 200, 300, 400, 600, 800],
}
```

---

## 6. Footer (4 columns)

| Column | Content |
|---|---|
| Brand | Logo, 3-line about text, Phone, Email |
| All Category | All Jewellery, Rings, Bracelets, Pendants, Anklets |
| Quick Links | About Us, Privacy Policy, Shipping Policy, Terms of Service, Contact, Return Policy, Certificate of Authenticity, Track My Order, Refund & Exchange, Jewellery Care, WhatsApp Channel |
| Subscribe | Heading + subtext + email input + button + Instagram/WhatsApp icons |

Bottom bar: `© 2026 Rakkhi. All Rights Reserved.` + 5 badges — 100% Authentic Silver · COD Available · Secure Payments · Easy Returns · Pan India Delivery

---

## 7. Build Order (suggested)

1. Next.js + Tailwind setup, `next.config.ts` images config, `FixedImage.tsx`
2. `data/navigation.ts` + `data/site.ts`
3. Layout shell: AnnouncementBar → Header + MegaMenu → Footer → MobileToolbar
4. `ProductCard` + `SectionHeading` + `TileCard` (baaki sab inhi pe bane hain)
5. Homepage sections 4.1 → 4.13 order me
6. Collection page + filters
7. PDP + gallery + variants
8. Cart drawer + wishlist (zustand)
9. Static pages + policies
10. SEO metadata, sitemap, JSON-LD product schema
