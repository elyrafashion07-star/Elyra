/**
 * Shared limits for product photo uploads.
 *
 * Its own module because a `"use server"` file may only export async functions —
 * the admin action and the form both need these constants, and neither can own
 * them.
 */

/**
 * How many photos a product has. The first is the one product cards show.
 *
 * Lowering this truncates: the form only renders this many slots and saveProduct
 * only reads this many, so anything beyond is dropped on the next save rather
 * than lingering invisibly.
 */
export const IMAGE_SLOTS = 3;

/** What one server action request may weigh in total — see next.config.ts. */
const BODY_LIMIT_BYTES = 4.5 * 1024 * 1024;

/** Left over for the text fields and multipart overhead riding along with them. */
const FIELDS_BUDGET_BYTES = 300 * 1024;

/**
 * Ceiling for one photo — a share of the request, not the whole of it.
 *
 * All IMAGE_SLOTS photos are submitted together, so a per-photo cap of "just
 * under the body limit" would let three of them add up to three times the limit.
 * The platform rejects that body before the server action runs, which surfaces
 * as a bare server error with nothing the form can say about it. Dividing the
 * budget means any allowed combination fits, and an oversized photo is refused
 * in the browser where the message can be useful.
 */
export const MAX_IMAGE_BYTES = Math.floor((BODY_LIMIT_BYTES - FIELDS_BUDGET_BYTES) / IMAGE_SLOTS);

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
