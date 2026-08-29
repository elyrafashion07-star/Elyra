/**
 * Shared limits for product photo uploads.
 *
 * Its own module because a `"use server"` file may only export async functions —
 * the admin action and the form both need these constants, and neither can own
 * them.
 */

/**
 * Ceiling for what reaches the server action. Vercel refuses a request body over
 * 4.5 MB outright, so this stays under it — see next.config.ts.
 */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Anything larger is resized in the browser before it is uploaded, so a 6 MB
 * phone photo becomes a ~300 KB one instead of a failed save.
 */
export const RESIZE_ABOVE_BYTES = 700 * 1024;

/** Longest edge, in pixels, a resized photo is fitted into. */
export const RESIZE_MAX_EDGE = 1600;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** For the file picker's `accept` attribute. */
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");
