/**
 * Turns a title into a URL handle: "Twin Strings — Silver Ring (925)" becomes
 * "twin-strings-silver-ring-925".
 *
 * Accents are stripped rather than dropped so "Rosé" stays "rose" instead of
 * collapsing to "ros"; everything else that is not a letter or digit becomes a
 * hyphen, and runs of hyphens are squeezed to one.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
