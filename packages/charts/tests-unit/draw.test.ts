/* What the series layer puts on the canvas, against a recording context
   (charts-review, bug 8; Q23). A point between two gaps is a lone `moveTo` in a
   line's path and a polygon without width in an area's fill - neither draws a
   pixel, so a reading a gap isolates vanished. Node has no canvas: the context
   and Path2D record what is done to them, and the test counts it. */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { drawSeriesLayer, type SeriesDrawItem } from "../src/draw";
import { LinearScale } from "../src/scale";
import { FALLBACK_THEME } from "../src/theme";

type Op = [name: string, ...args: number[]];

class RecordingPath {
  readonly ops: Op[] = [];
  moveTo(x: number, y: number): void {
    this.ops.push(["moveTo", x, y]);
  }
  lineTo(x: number, y: number): void {
    this.ops.push(["lineTo", x, y]);
  }
  arc(x: number, y: number): void {
    this.ops.push(["arc", x, y]);
  }
  rect(x: number, y: number, w: number, h: number): void {
    this.ops.push(["rect", x, y, w, h]);
  }
  closePath(): void {
    this.ops.push(["closePath"]);
  }
}

function recordingContext() {
  const filled: RecordingPath[] = [];
  const stroked: RecordingPath[] = [];
  const ctx = new Proxy(
    {
      fill: (path?: RecordingPath) => {
        if (path !== undefined) filled.push(path);
      },
      stroke: (path?: RecordingPath) => {
        if (path !== undefined) stroked.push(path);
      },
    } as Record<string, unknown>,
    {
      // Every other method is a no-op, every property takes what it is given.
      get: (target, key) => (key in target ? target[key as string] : () => undefined),
    },
  );
  return { ctx: ctx as unknown as CanvasRenderingContext2D, filled, stroked };
}

const original = (globalThis as { Path2D?: unknown }).Path2D;
beforeEach(() => {
  (globalThis as { Path2D?: unknown }).Path2D = RecordingPath;
});
afterEach(() => {
  (globalThis as { Path2D?: unknown }).Path2D = original;
});

const N = 1000;
const LONE = 500;

/** A thousand points, every one a gap but one. */
function channels() {
  const x = new Float64Array(N);
  const y = new Float64Array(N).fill(Number.NaN);
  for (let i = 0; i < N; i++) x[i] = i;
  y[LONE] = 50;
  return { x, y };
}

const xScale = new LinearScale([0, N - 1], [0, 999]);
const yScale = new LinearScale([0, 100], [100, 0]);

function draw(item: SeriesDrawItem) {
  const recording = recordingContext();
  drawSeriesLayer(recording.ctx, {
    width: 1000,
    height: 100,
    plot: { x: 0, y: 0, width: 1000, height: 100 },
    axes: [],
    theme: FALLBACK_THEME,
    series: [item],
    limitBands: [],
    limitLines: [],
  });
  return recording;
}

const arcs = (paths: readonly RecordingPath[]) =>
  paths.reduce((sum, p) => sum + p.ops.filter(([name]) => name === "arc").length, 0);

function line(markers: "auto" | "always" | "never"): SeriesDrawItem {
  return {
    ...channels(),
    kind: "line",
    length: N,
    xScale,
    yScale,
    color: "#000",
    alpha: 1,
    strokeWidth: 1.5,
    markers,
  };
}

describe("A point between two gaps", () => {
  it("gets a marker on a line of a thousand points", () => {
    expect(arcs(draw(line("auto")).filled)).toBe(1);
  });

  it("gets none with markers=\"never\"", () => {
    expect(arcs(draw(line("never")).filled)).toBe(0);
  });

  it("is a stroke from the baseline to its value on an area", () => {
    const { stroked } = draw({
      ...channels(),
      kind: "area",
      length: N,
      xScale,
      yScale,
      color: "#000",
      alpha: 1,
      y0: null,
      baseline: 0,
      fillOpacity: 0.18,
      strokeWidth: 1.5,
    });
    const px = xScale.toPx(LONE);
    const ops = stroked.flatMap((p) => p.ops);
    const from = ops.findIndex(([name, x, y]) => name === "moveTo" && x === px && y === yScale.toPx(0));
    expect(from).toBeGreaterThanOrEqual(0);
    expect(ops[from + 1]).toEqual(["lineTo", px, yScale.toPx(50)]);
  });
});

/* charts-essentials 03: a step line holds each sample until the next one - a
   horizontal, then the jump. A gap ends the hold at its x and lifts the pen. */
describe("A step line", () => {
  it("holds each value until the next sample, and until a gap's x", () => {
    const x = new Float64Array([0, 10, 20, 30, 40]);
    const y = new Float64Array([10, 50, Number.NaN, 30, 70]);
    const { stroked } = draw({
      x,
      y,
      kind: "line",
      length: 5,
      xScale,
      yScale,
      color: "#000",
      alpha: 1,
      strokeWidth: 1.5,
      markers: "never",
      step: true,
    });
    const px = (v: number) => xScale.toPx(v);
    const py = (v: number) => yScale.toPx(v);
    expect(stroked[0]?.ops).toEqual([
      ["moveTo", px(0), py(10)],
      ["lineTo", px(10), py(10)],
      ["lineTo", px(10), py(50)],
      ["lineTo", px(20), py(50)],
      ["moveTo", px(30), py(30)],
      ["lineTo", px(40), py(30)],
      ["lineTo", px(40), py(70)],
    ]);
  });
});

