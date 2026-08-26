/**
 * Packing defaults.
 *
 * The admin form asks for a name, a description, a price and one photo — nothing
 * else. Weight and box size are the same for every piece we sell, so they live
 * here instead of being typed in on every product.
 */

/** Written onto a product when it is created; shown on the product page. */
export const PRODUCT_WEIGHT = "10 g";

/** The box every order ships in. */
export const PARCEL = {
  lengthCm: 10,
  breadthCm: 10,
  heightCm: 10,
  /**
   * Not 0.01. The jewellery weighs 10 g, but Shiprocket bills a 0.5 kg minimum
   * slab and quoting under it just gets the rate rounded up anyway.
   */
  weightKg: 0.5,
};
