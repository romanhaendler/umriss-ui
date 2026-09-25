/* Encoding without colour (charts-alternatives 02, C3).

   A verdict colour does not reach a colour-blind reader, and a series told
   apart by hue alone is told apart by nothing on a grey printout or under the
   Windows contrast mode. `Chart encoding="marks"` gives each series a second
   carrier beside its colour, chosen by the same palette place the colour is
   chosen by - so series 2 is the second colour AND the second dash, and the
   pairing never shifts between charts:

   - a line and an area outline its dash pattern, a line's markers and a
     scatter's points their shape;
   - a bar, a state and a matrix cell a hatch drawn across their fill.

   The first place is plain - solid, a circle, no hatch - so that the first
   series looks as it does without marks. Pure and free of the DOM: the canvas
   and the legend's chips draw from the same numbers. */

import type { Rect } from "./types";

export type MarkerShape = "circle" | "square" | "triangle" | "diamond" | "triangleDown" | "plus";

/** Lines across a fill: none, rising (/), falling (\), horizontal, vertical,
    crossed (x). */
export type Hatch = "none" | "rising" | "falling" | "horizontal" | "vertical" | "crossed";

/** In the order of the palette places. A dash of length 1 with the round cap
    the lines are drawn with is a dot. */
const DASHES: readonly (readonly number[])[] = [[], [7, 4], [1, 4], [7, 3, 1, 3], [14, 4], [7, 3, 1, 3, 1, 3]];
const MARKERS: readonly MarkerShape[] = ["circle", "square", "triangle", "diamond", "triangleDown", "plus"];
const HATCHES: readonly Hatch[] = ["none", "rising", "falling", "horizontal", "vertical", "crossed"];

export interface SeriesMarks {
  dash: readonly number[];
  marker: MarkerShape;
  hatch: Hatch;
}

/** The marks of a palette place, cycling as the palette's six colours do. */
export function marksFor(slot: number): SeriesMarks {
  const k = place(slot, DASHES.length);
  return { dash: DASHES[k] as number[], marker: MARKERS[k] as MarkerShape, hatch: HATCHES[k] as Hatch };
}

/** The hatch of a state or a matrix bucket by its index - the first plain. */
export function hatchFor(index: number): Hatch {
  return HATCHES[place(index, HATCHES.length)] as Hatch;
}

/** The hatch of each state by its name (charts-alternatives 04): the place
    its name first takes across the chart's bands, in their order. Two bands
    listing one state at different places hatch it alike, and the legend,
    which shows it once, agrees with both. A single band keeps its index. */
export function stateHatches(bands: readonly (readonly { label: string }[])[]): Map<string, Hatch> {
  const out = new Map<string, Hatch>();
  for (const states of bands) for (const { label } of states) if (!out.has(label)) out.set(label, hatchFor(out.size));
  return out;
}

/** An index into a list of `n`, cycling, never negative. */
function place(index: number, n: number): number {
  return ((index % n) + n) % n;
}

/** The line segments of a hatch across `box`, `spacing` pixels apart, as
    x1, y1, x2, y2 in a row. The lines lie on a grid of the plane rather than
    of the box, so that neighbouring boxes - two bars, two cells - continue
    each other's lines; they may run past the box, which the caller clips. */
export function hatchLines(box: Rect, hatch: Hatch, spacing: number): number[] {
  const out: number[] = [];
  if (hatch === "none" || !(spacing > 0) || !(box.width > 0) || !(box.height > 0)) return out;
  const { x, y, width: w, height: h } = box;
  const first = (v: number) => Math.ceil(v / spacing) * spacing;
  if (hatch === "rising" || hatch === "crossed") {
    // u + v = c: through the box from its lower left to its upper right.
    for (let c = first(x + y); c <= x + w + y + h; c += spacing) out.push(c - y - h, y + h, c - y, y);
  }
  if (hatch === "falling" || hatch === "crossed") {
    // u - v = c.
    for (let c = first(x - y - h); c <= x + w - y; c += spacing) out.push(c + y, y, c + y + h, y + h);
  }
  if (hatch === "horizontal") {
    for (let v = first(y); v <= y + h; v += spacing) out.push(x, v, x + w, v);
  }
  if (hatch === "vertical") {
    for (let u = first(x); u <= x + w; u += spacing) out.push(u, y, u, y + h);
  }
  return out;
}

/** What a marker is drawn into: a Path2D on the canvas, a recorder in a test. */
export interface PathSink {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, r: number, start: number, end: number): void;
  closePath(): void;
}

/** A filled marker of radius `r` at (cx, cy), as a closed sub-path - so that a
    series' markers stay one path and one fill (R-2.12). The shapes are sized
    to cover about the circle's area, so that none reads as heavier. */
export function markerPath(path: PathSink, shape: MarkerShape, cx: number, cy: number, r: number): void {
  const polygon = (points: readonly (readonly [number, number])[]) => {
    points.forEach(([px, py], i) => (i === 0 ? path.moveTo(cx + px * r, cy + py * r) : path.lineTo(cx + px * r, cy + py * r)));
    path.closePath();
  };
  switch (shape) {
    case "circle":
      path.moveTo(cx + r, cy);
      path.arc(cx, cy, r, 0, Math.PI * 2);
      return;
    case "square":
      polygon([[-0.89, -0.89], [0.89, -0.89], [0.89, 0.89], [-0.89, 0.89]]);
      return;
    case "triangle":
      polygon([[0, -1.35], [1.17, 0.68], [-1.17, 0.68]]);
      return;
    case "triangleDown":
      polygon([[0, 1.35], [1.17, -0.68], [-1.17, -0.68]]);
      return;
    case "diamond":
      polygon([[0, -1.25], [1.25, 0], [0, 1.25], [-1.25, 0]]);
      return;
    case "plus": {
      const a = 0.42;
      const b = 1.2;
      polygon([[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]]);
      return;
    }
  }
}
