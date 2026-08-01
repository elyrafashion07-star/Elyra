# Supabase — setup aur data transfer

Ye guide ek baar follow karni hai. Iske baad saara catalogue Supabase me hoga.

---

## 1. Project banao (2 min)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `elyrafashion` · Region: **Mumbai (ap-south-1)** — India ke users ke liye sabse fast
3. Database password strong rakho aur kahin safe save karo (baad me chahiye hoga)

## 2. Keys copy karo

Dashboard → **Project Settings → API**. Teen cheezein chahiye:

| Kya | Kahan milega |
|---|---|
| Project URL | `https://<ref>.supabase.co` |
| `anon` public key | API keys section |
| `service_role` key | API keys section — **secret, kabhi share mat karna** |

Ab project root me `.env.local` banao (`.env.example` copy karke):

```bash
cp .env.example .env.local
```

Aur values bharo:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

> `.env.local` gitignored hai — keys commit nahi hongi.

## 3. Tables banao

Dashboard → **SQL Editor** → **New query** → [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
ka poora content paste karo → **Run**.

Ye 5 tables banata hai, indexes + RLS ke saath. Dobara chalane se kuch tootega nahi (idempotent hai).

## 4. Data transfer karo

```bash
npm run db:seed
```

Pehle bina likhe check karna ho to:

```bash
npm run db:seed -- --dry-run
```

Abhi ke data se ye rows jayengi:

| Table | Rows |
|---|---|
| `collections` | 43 |
| `products` | 42 |
| `product_collections` | 134 |
| `hero_slides` | 3 |
| `info_pages` | 9 |

Script **upsert** karti hai — dobara chalao to duplicate nahi banega, bas changes sync ho jayenge.
`/data/*.ts` abhi bhi source of truth hai; jab bhi wahan kuch badlo, `npm run db:seed` chala dena.

---

## Schema (short version)

```
collections ─┬─< products (category FK)
             └─< product_collections >─ products     (many-to-many)

hero_slides      homepage slider
info_pages       about/contact/policy pages (sections JSONB me)
```

- **Read**: anon key se public read allowed hai (RLS policy `public read *`)
- **Write**: sirf service-role key se — isliye koi write policy nahi banayi

## Files

| File | Kaam |
|---|---|
| [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) | Schema + RLS |
| [`scripts/seed-supabase.ts`](scripts/seed-supabase.ts) | `/data` → Supabase transfer |
| [`lib/supabase/client.ts`](lib/supabase/client.ts) | Read-only client (anon key) |
| [`lib/supabase/admin.ts`](lib/supabase/admin.ts) | Service-role client (server/scripts only) |
| [`lib/supabase/types.ts`](lib/supabase/types.ts) | Row types |

---

## 5. Authentication

### Migration chalao

Dashboard → SQL Editor me [`supabase/migrations/0002_auth_profiles.sql`](supabase/migrations/0002_auth_profiles.sql)
paste karke Run karo. Ye `profiles` table banata hai + ek trigger jo har naye signup pe
naam/phone `auth.users` se `profiles` me copy kar deta hai.

### Email settings (zaroori)

Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3001` (dev) ya `https://elyrafashion.in` (live)
- **Redirect URLs** me ye add karo: `http://localhost:3001/auth/confirm`

Dashboard → **Authentication → Email Templates → Confirm signup** me link ko aisa karo:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

> Testing ke liye email confirmation band karna ho: **Authentication → Providers → Email**
> → "Confirm email" off. Tab signup ke baad seedha login ho jayega.

### Kya bana hai

| Route | Kaam |
|---|---|
| `/account/register` | Naya account — naam, email, phone, password |
| `/account/login` | Sign in |
| `/account` | Protected dashboard — profile, orders, wishlist, sign out |
| `/auth/confirm` | Email confirmation link yahan aata hai |

- `middleware.ts` har request pe session refresh karta hai. Bina login `/account` khola to
  `/account/login?next=/account` pe bhej deta hai; login ke baad wapas wahi le jaata hai.
- Login hone ke baad `/account/login` khologe to seedha `/account` pe redirect ho jayega.

## Aage kya (abhi nahi kiya)

Site abhi bhi `/data/*.ts` se render ho rahi hai — Supabase me data pada hai, par pages
usse read nahi kar rahe. Switch karne ke liye har page ka data source badalna hoga
(products, collections, hero, static pages) aur caching decide karni hogi (ISR ya
static-at-build). Ye alag step hai — bolo to kar denge.
