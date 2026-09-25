/* How many middle levels of a breadcrumb fold into its menu - measured, not
   guessed (core-foundations 06). Pure arithmetic over widths the component
   reads off a hidden copy of the full trail.

   The first level and the current page always stand: the first says where
   the trail begins, the last where one is. What folds is the middle, from the
   root side - the levels next to the current page are the ones a reader goes
   back to. When even the fully folded trail does not fit, it folds
   everything in between, and the current page's text truncates. */

/**
 * The number of levels after the first that fold into the menu.
 *
 * @param widths the width of each level, its separator included
 * @param moreWidth the width of the menu's key, its separator included
 * @param gap the gap between two levels
 * @param available the width the trail may take
 */
export function foldedCount(widths: readonly number[], moreWidth: number, gap: number, available: number): number {
  const n = widths.length;
  const sum = (from: number) => widths.slice(from).reduce((total, w) => total + w, 0);
  if (n <= 2 || sum(0) + (n - 1) * gap <= available) return 0;
  for (let folded = 1; folded < n - 2; folded++) {
    const gaps = n - folded; // between the first, the menu's key and the rest
    const width = widths[0]! + moreWidth + sum(1 + folded) + gaps * gap;
    if (width <= available) return folded;
  }
  return n - 2;
}
