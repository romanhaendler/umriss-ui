import { Legend, Tooltip, useChart } from "../../../src";

/* Data from the data scientist's world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A bell-shaped draw from two uniforms (Box-Muller). */
const draw = random(9);
const gauss = () => Math.sqrt(-2 * Math.log(Math.max(draw(), 1e-12))) * Math.cos(2 * Math.PI * draw());

/** Two hundred thousand points in two clusters, counted into a grid of 50 by 50 cells as they come. */
const CELLS = 50;
const SIZE = 10 / CELLS;
const COUNTS = new Uint32Array(CELLS * CELLS);
for (let k = 0; k < 200_000; k++) {
  const [cx, cy, sd] = k % 5 < 3 ? [3, 4, 1.2] : [7, 6.5, 1.6];
  const i = Math.floor((cx + sd * gauss()) / SIZE);
  const j = Math.floor((cy + sd * gauss()) / SIZE);
  if (i >= 0 && i < CELLS && j >= 0 && j < CELLS) COUNTS[j * CELLS + i]! += 1;
}

interface Cell {
  /** The cell's centre: its column and its row. */
  x: number;
  y: number;
  /** The points in the cell. */
  count: number;
}

/** One row per cell with points; a cell without any has no row and is not drawn. */
const CELL_ROWS: readonly Cell[] = Array.from(COUNTS).flatMap((count, k) =>
  count === 0 ? [] : [{ x: ((k % CELLS) + 0.5) * SIZE, y: (Math.floor(k / CELLS) + 0.5) * SIZE, count }],
);

export const title = "Where the points crowd";
export const lead =
  "Count the points into cells and draw the counts as a `Matrix`, a 2D histogram as `bin` is for `Bar` (ADR-0054); a cell without points has no row and is not drawn, so the ground is zero. Point opacity is not offered: a scatter is one path and one fill, so translucency does not add up on it, and a fill per point breaks the million-point budget.";

export default function WherePointsCrowd() {
  const { Chart, XAxis, YAxis, Matrix } = useChart(CELL_ROWS);
  return (
    <Chart height={320} aria-label="Two hundred thousand points counted into cells, the counts as a gradient">
      <XAxis value="x" label="x" />
      <YAxis />
      <Matrix value="y" level="count" name="Points per cell" format={{ decimals: 0 }} />
      <Legend />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
