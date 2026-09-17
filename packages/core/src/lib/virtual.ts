/* Which rows are rendered, when not all of them are.

   Holding a very large table in the document costs not the computing but the
   nodes: twenty thousand rows are a hundred thousand cells, and the browser
   lays out a box for each. Virtualisation renders only what stands in the
   scroll area, and keeps the scrollbar at the right length with two empty rows
   - one above and one below the window.

   Filler rows and not padding on the body: a table distributes height over its
   rows, and `padding` on `tbody` is not reliably honoured by the table layout
   rules. A row with a cell of the right height always is.

   Everything here is pure arithmetic - the seam at which virtualisation is
   checked without a DOM. What moves the window (scrolling, keyboard) lies
   beside it, in the table's companion in @umriss-ui/table
   (`kern/begleiter.ts`). */

export interface WindowInput {
  /** Rows in total, not only the rendered ones. */
  count: number;
  /** Measured height of one row, in pixels. */
  rowHeight: number;
  /** The container's current scroll position. */
  scrollTop: number;
  /** Visible height of the scroll area. */
  viewportHeight: number;
  /**
   * Rows rendered along above and below the visible area.
   *
   * Without an overscan a blank area appears briefly during fast scrolling,
   * because rendering trails the scrolling by a frame.
   */
  overscan?: number;
}

export interface RowWindow {
  /** First rendered index. */
  from: number;
  /** First index no longer rendered (exclusive). */
  to: number;
  /** Height of the filler row above, in pixels. */
  before: number;
  /** Height of the filler row below, in pixels. */
  after: number;
}

const EMPTY: RowWindow = { from: 0, to: 0, before: 0, after: 0 };

/**
 * The window for the current scroll position.
 *
 * `before + rendered + after` always adds up to the full height of all rows.
 * That is the promise the scrollbar hangs on: it must not jump while scrolling
 * because the rendered set changed.
 */
export function visibleWindow({
  count,
  rowHeight,
  scrollTop,
  viewportHeight,
  overscan = 4,
}: WindowInput): RowWindow {
  /* Before the first measurement the row height is zero. There is then no
     window, and dividing would yield infinity. */
  if (count <= 0 || rowHeight <= 0) return EMPTY;

  const top = Math.max(0, scrollTop);
  const firstVisible = Math.floor(top / rowHeight);
  /* Plus one for the row cut off at the bottom: it is visible, even where it
     does not fit entirely. */
  const fit = Math.ceil(Math.max(0, viewportHeight) / rowHeight) + 1;

  const from = Math.max(0, firstVisible - overscan);
  const to = Math.min(count, firstVisible + fit + overscan);

  return {
    from,
    to,
    before: from * rowHeight,
    after: (count - to) * rowHeight,
  };
}

export interface RowPlacement {
  rowHeight: number;
  scrollTop: number;
  viewportHeight: number;
  /** Height of the sticky header; it covers the upper edge. */
  headerHeight?: number;
}

/**
 * The scroll position at which a row is visible - or null where it already is.
 *
 * This is the arithmetic the keyboard handling hangs on. Without it the focus
 * moves into a row that is not rendered, and the focus ring disappears - a
 * virtualised table that cannot do this is worse than a paged one.
 *
 * The sticky header counts against the upper edge: a row standing exactly at
 * `scrollTop` lies behind it.
 */
export function scrollForRow(
  index: number,
  { rowHeight, scrollTop, viewportHeight, headerHeight = 0 }: RowPlacement,
): number | null {
  if (rowHeight <= 0) return null;

  const top = index * rowHeight;
  const bottom = top + rowHeight;

  if (top < scrollTop + headerHeight) return Math.max(0, top - headerHeight);
  if (bottom > scrollTop + viewportHeight) return Math.max(0, bottom - viewportHeight);
  return null;
}
