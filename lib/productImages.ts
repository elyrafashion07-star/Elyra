/**
 * Shared limits for product photo uploads.
 *
 * Its own module because a `"use server"` file may only export async functions —
 * the admin action and the form both need these constants, and neither can own
 * them.
 */

/**
 * How many image slots a product has. The first is the card image.
 *
 * Lowering this truncates: the admin form only renders this many slots, and
 * saveProduct only reads this many, so anything beyond is dropped on the next
 * save rather than lingering invisibly.
 */
export const IMAGE_SLOTS = 3;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** For the file picker's `accept` attribute. */
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");
