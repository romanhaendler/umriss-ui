/** The room a widget takes, in grid cells. */
export interface Span {
  columns: number;
  rows: number;
}

/** Where a widget stands: zero-based column and row, and the room it takes
    (its width clamped to the grid). */
export interface Place extends Span {
  column: number;
  row: number;
}

/** Strict row-major packing, the rule of CSS grid's sparse auto-placement: each
    widget takes the first place at or after the one before it where it fits.
    Free room left behind stays free. */
export function pack(spans: readonly Span[], columns: number): Place[] {
  const taken = new Set<number>();
  const free = (row: number, column: number, w: number, h: number) => {
    for (let r = row; r < row + h; r++) for (let c = column; c < column + w; c++) if (taken.has(r * columns + c)) return false;
    return true;
  };
  let cursor = 0;
  return spans.map((span) => {
    const w = Math.min(span.columns, columns);
    for (let i = cursor; ; i++) {
      const row = Math.floor(i / columns);
      const column = i % columns;
      if (column + w > columns || !free(row, column, w, span.rows)) continue;
      for (let r = row; r < row + span.rows; r++) for (let c = column; c < column + w; c++) taken.add(r * columns + c);
      cursor = i;
      return { column, row, columns: w, rows: span.rows };
    }
  });
}

/** What a drawn grid measures: a column's width, a row's height and the gap. */
export interface Geometry {
  cell: number;
  unit: number;
  gap: number;
}

/** The place (counted from 0) to which moving the widget at `index` puts its
    corner nearest to the point (x, y) it is held at. Every candidate is worked
    out from the order the drag began with, so the answer is a function of the
    point alone and cannot oscillate; a tie goes to the earlier place. */
export function nearestPlace(spans: readonly Span[], columns: number, index: number, x: number, y: number, { cell, unit, gap }: Geometry): number {
  let best = index;
  let least = Infinity;
  for (let i = 0; i < spans.length; i++) {
    const order = [...spans];
    order.splice(i, 0, ...order.splice(index, 1));
    const place = pack(order, columns)[i]!;
    const d = (place.column * (cell + gap) - x) ** 2 + (place.row * (unit + gap) - y) ** 2;
    if (d < least) {
      least = d;
      best = i;
    }
  }
  return best;
}
