/**
 * The rating a newly added product starts with.
 *
 * The admin form does not ask for one — it asks for four things and nothing else
 * — so a new product used to land on 0.0 and show an empty star next to every
 * piece that already carried a 4-point-something. This fills that gap.
 *
 * Written once, at insert, rather than worked out on every read: it is a real
 * column that "Top Rated" sorts on and the admin can query, and a number that
 * changed on each page load would be worse than no number at all.
 */
const MIN = 4;
const MAX = 5;

export function newRating(): number {
  // One decimal, the same precision the column stores and Rating renders.
  return Math.round((MIN + Math.random() * (MAX - MIN)) * 10) / 10;
}
