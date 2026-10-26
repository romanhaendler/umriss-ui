/* The edge values of a matrix' colour bar: where the steps of a gradient meet, written in the matrix' format,
   and which of them the bar's width has room for. */

/** One written value under the bar: `at` is its place along the bar, 0 to 1. */
export interface BarEdge {
  at: number;
  text: string;
}

/** The bar's width in px (`.uc-legend-bar` takes it as its width), and the room a character and the gap between two values take.
    The legend's font is not measured: a value is a few digits wide, and an estimate keeps the entry free of the DOM. */
export const BAR_WIDTH = 160;
const CHAR = 7;
const GAP = 6;

/** The value at each of the `steps + 1` edges of a gradient of `steps` steps over `[min, max]`. */
export function edgeValues(steps: number, min: number, max: number): number[] {
  return Array.from({ length: steps + 1 }, (_, k) => min + (k * (max - min)) / steps);
}

/** The values written under the bar: both ends always, the inner edges at every k-th edge with the smallest k at
    which no two written values touch. */
export function barEdges(steps: number, min: number, max: number, format: (v: number) => string): BarEdge[] {
  const all = edgeValues(steps, min, max).map((v, k) => ({ at: k / steps, text: format(v) }));
  const reach = (k: number): [number, number] => {
    const e = all[k] as BarEdge;
    const w = e.text.length * CHAR;
    const x = e.at * BAR_WIDTH;
    // The ends sit inside the bar; an inner value is centred on its edge.
    return k === 0 ? [0, w] : k === steps ? [BAR_WIDTH - w, BAR_WIDTH] : [x - w / 2, x + w / 2];
  };
  for (let every = 1; every < steps; every++) {
    const kept = all.map((_, k) => k).filter((k) => k % every === 0 || k === steps);
    if (kept.every((k, i) => i === 0 || reach(k)[0] - reach(kept[i - 1] as number)[1] >= GAP)) return kept.map((k) => all[k] as BarEdge);
  }
  return [all[0] as BarEdge, all[steps] as BarEdge];
}
