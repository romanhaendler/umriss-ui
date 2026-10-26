/* columnDrag.ts - where a column entry dragged in the ColumnMenu's list would
   land. Pure: the entries' boxes and the pointer's place go in, a place comes
   out, so that it is tested without a browser. */

/** The vertical extent of one entry, in one coordinate system with the pointer. */
export interface Span {
  top: number;
  bottom: number;
}

/** The place the entry `from` takes when dropped with the pointer at `y`: the
    number of the block's other entries whose middle lies above the pointer,
    counted from the block's first place `lo` (its last is `hi`). The block is
    the entry's pin block, so a drop never leaves it, as a move does not. */
export function dropPlace(boxes: readonly Span[], y: number, from: number, lo: number, hi: number): number {
  let place = lo;
  for (let i = lo; i <= hi; i++) {
    if (i !== from && (boxes[i]!.top + boxes[i]!.bottom) / 2 < y) place++;
  }
  return place;
}
