/* Cell geometry of the matrix (ADR-0002 in two dimensions).

   The file is called after the cell and not after the matrix, because <Matrix>
   is the component: on a file system that does not distinguish upper and lower
   case, an import of `./Matrix` would find a `matrix.ts` lying beside it. The
   same reason gives bars.ts and spans.ts their names; see CONTEXT.md on module
   names.

   A matrix sits on two ordinary numeric axes: x is the column, y the row, and
   the colour comes from the value channel. The edge lengths of a cell therefore
   come out of the grid spacing of both axes and are mapped by the same affine
   scale as every other mark - the same reasoning as in bars.ts, one dimension
   further on.

   Deliberately free of the DOM and of the scene: half a cell out of place does
   not show up on a canvas.

   The gap is NaN in the value channel, not in the position channels - the
   encoding every series kind of this library uses. The cell then lies in the
   grid, but nothing is known about it; whoever tests the channel draws nothing
   and reports nothing. A position that is itself NaN drops out here of its own
   accord, because every comparison with NaN is false. */

/** Smallest positive distance between two DIFFERENT values of a position
    channel, in domain units. 0 where none can be measured: with a single row, a
    single column, and with no data at all.

    Unlike with bars, comparing only the neighbour will not do here: a matrix
    channel runs row by row and jumps back at the end of a row, so it is not
    ascending (R-2.6 holds for the series, not for this grid). Hence a sorted
    copy - it is made once during materialisation, not per frame, and n·log n
    beats the pairwise comparison clearly even on a modest grid. NaN sorts to the
    end and fails the test for a positive distance. */
export function measureSpacing(values: Float64Array, n: number): number {
  if (n < 2) return 0;
  const sorted = values.slice(0, n).sort();
  let smallest = Number.POSITIVE_INFINITY;
  for (let i = 1; i < n; i++) {
    const d = (sorted[i] as number) - (sorted[i - 1] as number);
    if (d > 0 && d < smallest) smallest = d;
  }
  return Number.isFinite(smallest) ? smallest : 0;
}

/** The cell edge actually calculated with: the measured one, and where none can
    be measured, the span of the axis' extent. A single row thereby gets a
    visible cell instead of one of height zero - the same argument by which a
    single data point gets a visible bar in bars.ts. Holds per axis; x and y are
    measured separately. */
export function cellSize(measured: number, domainSpan: number): number {
  return measured > 0 ? measured : domainSpan;
}

/** Index of the cell that contains (targetX, targetY); -1 outside the grid.

    A cell is centred on its midpoint, so it covers [x - width/2, x + width/2)
    by [y - height/2, y + height/2). An edge belongs to the cell that begins
    there - the same boundary rule as in the state band and with the spans, and
    without it an edge would belong to both neighbours.

    Linear, not binary: the position channels are not sorted (see
    measureSpacing), and no binary search can conclude across two dimensions at
    once. One pointer hit per movement is not worth that. In a grid at most one
    cell lies over a point; should two lie on one another against expectation,
    the one registered first wins. */
export function cellIndex(
  x: Float64Array,
  y: Float64Array,
  n: number,
  targetX: number,
  targetY: number,
  width: number,
  height: number,
): number {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  for (let i = 0; i < n; i++) {
    const dx = targetX - (x[i] as number);
    if (!(dx >= -halfWidth && dx < halfWidth)) continue;
    const dy = targetY - (y[i] as number);
    if (!(dy >= -halfHeight && dy < halfHeight)) continue;
    return i;
  }
  return -1;
}
