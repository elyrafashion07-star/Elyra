/**
 * Shared limits for product photo uploads.
 *
 * Its own module because a `"use server"` file may only export async functions —
 * the admin action and the form both need these constants, and neither can own
 * them.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** For the file picker's `accept` attribute. */
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");
