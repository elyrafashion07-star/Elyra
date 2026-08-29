/**
 * How many products the homepage "Trending" row holds.
 *
 * Its own module so the number lives in exactly one place: lib/catalog.ts cuts
 * the list to it, the homepage heading counts with it, and the admin tick-box
 * explains it. Changing it here changes all three — and lib/catalog.ts is
 * server-only, so a client component could not have imported it from there.
 */
export const TRENDING_LIMIT = 5;
