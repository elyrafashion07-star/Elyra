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
| Pin code delivery check (product page) | ✅ live |
| Checkout par unserviceable pin code block | ✅ payment se pehle reject |
| Shiprocket me order banana | ✅ admin panel me **Pack** dabane par (payment par auto-push nahi) — `lib/orders/fulfil.ts` |
| AWB / courier / status webhook | ✅ `POST /api/webhooks/courier-updates` |
| `GET /api/shipping/serviceability` | ✅ public, rate-limited |
| `GET /api/shipping/track?awb=` | ✅ sirf admin |

## 4. Webhook setup

Shiprocket → Settings → API → Webhooks:

| Field | Value |
|---|---|
| URL | `https://www.elyrafashion.in/api/webhooks/courier-updates` |
| Auth Token Type | `x-api-key` |
| Token | `SHIPROCKET_WEBHOOK_TOKEN` ki value |

- URL me `shiprocket`, `sr`, `kr` jaise words **nahi** hone chahiye, Shiprocket reject karta hai.
- `www` wala URL do. Bina-www domain redirect karta hai aur Shiprocket redirect follow nahi karta.
- `SHIPROCKET_WEBHOOK_TOKEN` hosting (Vercel) ke env vars me bhi daalo aur redeploy karo.

## 5. AWB kab milta hai

Admin panel me **Pack** dabate hi do kaam hote hain: Shiprocket me order banta hai, aur turant `POST /courier/assign/awb` call hoke courier + AWB assign ho jaata hai (`lib/orders/fulfil.ts` → `requestAwb`). AWB order me save hota hai aur customer ko My Orders me turant Tracking ID dikhti hai — webhook ka intezaar nahi.

- Courier Shiprocket ke **courier priority** rules se chuna jaata hai (Settings → Courier Priority).
- AWB assign hote hi shipping charge Shiprocket **wallet** se katta hai. Wallet me balance kam ho to AWB nahi milega — order phir bhi `packed` ho jaata hai, admin ko reason dikhta hai, aur order page par **Assign AWB** button se dobara try kar sakte ho.
- Pickup abhi bhi Shiprocket panel se schedule karna hai.

Pickup location ka naam `SHIPROCKET_PICKUP_LOCATION` (default `Primary`) se bilkul match hona chahiye, warna har push fail hoga.

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
