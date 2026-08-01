# Shiprocket — setup

## 1. API user banao (ye sabse important step hai)

Shiprocket dashboard → **Settings → API → Configure → Create an API User**.

> Ye **alag user** hota hai. Apne normal dashboard email/password se API login **nahi** hoga —
> 403 milega. Naya API user banao aur uska email + password use karo.

Pickup address bhi add kar lo: **Settings → Company → Pickup Addresses**.
Uska pin code chahiye hoga delivery estimate ke liye.

## 2. `.env.local` me credentials daalo

```
SHIPROCKET_EMAIL=api-user@yourdomain.com
SHIPROCKET_PASSWORD=<api user password>
SHIPROCKET_PICKUP_PINCODE=400001          # pickup address ka pin code

# optional
# SHIPROCKET_PICKUP_LOCATION=Primary      # pickup nickname, default "Primary"
# SHIPROCKET_CHANNEL_ID=
```

## 3. Connection check karo

```bash
npm run ship:check            # default 400001 pe check
npm run ship:check -- 560001  # kisi aur pincode pe
```

Sahi hone par login confirm hoga aur available couriers + ETA + rate print honge.

---

## Abhi kya kaam kar raha hai

| Cheez | Status |
|---|---|
| Pin code delivery check (product page) | ✅ live — credentials daalte hi chalu |
| `GET /api/shipping/serviceability` | ✅ |
| `GET /api/shipping/track?awb=` | ✅ |
| Order push to Shiprocket | ⛔ checkout nahi hai (neeche dekho) |

**Order push kyun nahi:** site pe abhi koi checkout ya order storage nahi hai — cart sirf
browser ke localStorage me hai. Shiprocket ko order tabhi bhej sakte hain jab order
kahin save ho raha ho. `createOrder()` function [`lib/shiprocket/client.ts`](lib/shiprocket/client.ts)
me ready hai — checkout banne ke baad bas usse call karna hoga.

## Security

- Credentials sirf server pe hain. Browser kabhi Shiprocket se direct baat nahi karta —
  sab kuch `/api/shipping/*` route handlers se jaata hai.
- `lib/shiprocket/client.ts` me `import "server-only"` hai, to galti se client component me
  import karne par **build fail** ho jayega. Ye jaan bujh ke hai.
- Token 10 din valid hota hai, memory me cache hota hai, 401 pe apne aap dobara login.

## Files

| File | Kaam |
|---|---|
| [`lib/shiprocket/client.ts`](lib/shiprocket/client.ts) | Auth, serviceability, tracking, order create |
| [`app/api/shipping/serviceability/route.ts`](app/api/shipping/serviceability/route.ts) | Pin code check API |
| [`app/api/shipping/track/route.ts`](app/api/shipping/track/route.ts) | AWB tracking API |
| [`components/product/DeliveryCheck.tsx`](components/product/DeliveryCheck.tsx) | Product page ka delivery box |
| [`scripts/check-shiprocket.ts`](scripts/check-shiprocket.ts) | `npm run ship:check` |
