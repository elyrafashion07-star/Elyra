/**
 * Shiprocket connection check.
 *
 *   npm run ship:check              # auth + serviceability to a default pincode
 *   npm run ship:check -- 560001    # check a specific pincode
 *
 * Read-only: logs in and queries serviceability. Creates nothing.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true, quiet: true });

const BASE = "https://apiv2.shiprocket.in/v1/external";

const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;
const pickup = process.env.SHIPROCKET_PICKUP_PINCODE;
const target = process.argv[2] ?? "400001";

function mask(v?: string) {
  return v ? `${v.slice(0, 3)}…(${v.length} chars)` : "MISSING";
}

console.log("Environment");
console.log(`  SHIPROCKET_EMAIL            ${email ?? "MISSING"}`);
console.log(`  SHIPROCKET_PASSWORD         ${mask(password)}`);
console.log(`  SHIPROCKET_PICKUP_PINCODE   ${pickup ?? "MISSING"}`);

if (!email || !password) {
  console.error(
    "\n✗ Not configured. Add to .env.local:\n" +
      "    SHIPROCKET_EMAIL=<API user email>\n" +
      "    SHIPROCKET_PASSWORD=<API user password>\n" +
      "    SHIPROCKET_PICKUP_PINCODE=<your pickup pin code>\n\n" +
      "  Create the API user in Shiprocket → Settings → API → Configure.\n" +
      "  It is a separate user from your dashboard login.",
  );
  process.exit(1);
}

async function main() {
  console.log("\nAuthenticating…");
  const authRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const auth = (await authRes.json().catch(() => ({}))) as {
    token?: string;
    message?: string;
    company_id?: number;
    first_name?: string;
  };

  if (!authRes.ok || !auth.token) {
    console.error(`✗ Login failed (${authRes.status}): ${auth.message ?? "no token returned"}`);
    if (authRes.status === 403) {
      console.error("  403 usually means these are dashboard credentials, not an API user.");
    }
    process.exit(1);
  }

  console.log(`✓ Logged in${auth.first_name ? ` as ${auth.first_name}` : ""}${auth.company_id ? ` (company ${auth.company_id})` : ""}`);
  console.log(`  token ${auth.token.slice(0, 12)}…(${auth.token.length} chars)`);

  if (!pickup) {
    console.warn("\n⚠ SHIPROCKET_PICKUP_PINCODE not set — skipping serviceability check.");
    return;
  }

  console.log(`\nServiceability ${pickup} → ${target} (0.5 kg, prepaid)…`);
  const qs = new URLSearchParams({
    pickup_postcode: pickup,
    delivery_postcode: target,
    weight: "0.5",
    cod: "0",
  });
  const srvRes = await fetch(`${BASE}/courier/serviceability/?${qs}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  const srv = (await srvRes.json().catch(() => ({}))) as {
    data?: { available_courier_companies?: { courier_name: string; rate: number; etd: string; estimated_delivery_days: string; cod: number }[] };
    message?: string;
  };

  if (!srvRes.ok) {
    console.error(`✗ Serviceability failed (${srvRes.status}): ${srv.message ?? "unknown error"}`);
    process.exit(1);
  }

  const couriers = srv.data?.available_courier_companies ?? [];
  if (!couriers.length) {
    console.log("  No couriers returned — pin code may be unserviceable, or no plan is active.");
    return;
  }

  console.log(`✓ ${couriers.length} courier(s) available. Fastest five:`);
  couriers
    .slice()
    .sort((a, b) => (Number(a.estimated_delivery_days) || 99) - (Number(b.estimated_delivery_days) || 99))
    .slice(0, 5)
    .forEach((c) =>
      console.log(
        `    ${c.courier_name.padEnd(28)} ${String(c.estimated_delivery_days).padStart(2)} days  ₹${c.rate}  ${Number(c.cod) === 1 ? "COD" : "prepaid"}`,
      ),
    );
}

main().catch((err) => {
  console.error("\n✗ Connection failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
