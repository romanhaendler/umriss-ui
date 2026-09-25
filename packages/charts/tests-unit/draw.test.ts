/* What the series layer puts on the canvas, against a recording context
   (charts-review, bug 8; Q23). A point between two gaps is a lone `moveTo` in a
   line's path and a polygon without width in an area's fill - neither draws a
   pixel, so a reading a gap isolates vanished. Node has no canvas: the context
   and Path2D record what is done to them, and the test counts it. */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { drawOverlayLayer, drawSeriesLayer, type SeriesDrawItem } from "../src/draw";
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
  /** Each stroke with the colour and width it was drawn in. */
  const strokes: { path: RecordingPath; style: unknown; width: unknown }[] = [];
  const target: Record<string, unknown> = {
    fill: (path?: RecordingPath) => {
      if (path !== undefined) filled.push(path);
    },
    stroke: (path?: RecordingPath) => {
      if (path === undefined) return;
      stroked.push(path);
      strokes.push({ path, style: target.strokeStyle, width: target.lineWidth });
    },
  };
  const ctx = new Proxy(
    target,
    {
      // Every other method is a no-op, every property takes what it is given.
      get: (target, key) => (key in target ? target[key as string] : () => undefined),
    },
  );
  return { ctx: ctx as unknown as CanvasRenderingContext2D, filled, stroked, strokes };
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

/* charts-essentials 06: an area's outline takes a dash; the fill and a lone
   point's stroke stay solid. */
describe("An area's dash", () => {
  it("dashes the outline and nothing else", () => {
    const dashes: number[][] = [];
    let current: number[] = [];
    const ctx = new Proxy({} as Record<string, unknown>, {
      get: (_, key) =>
        key === "setLineDash"
          ? (d: number[]) => {
              current = d;
            }
          : key === "stroke"
            ? () => dashes.push(current)
            : () => undefined,
      set: () => true,
    }) as unknown as CanvasRenderingContext2D;
    drawSeriesLayer(ctx, {
      width: 1000,
      height: 100,
      plot: { x: 0, y: 0, width: 1000, height: 100 },
      axes: [],
      theme: FALLBACK_THEME,
      series: [
        {
          x: new Float64Array([0, 10]),
          y: new Float64Array([20, 30]),
          kind: "area",
          length: 2,
          xScale,
          yScale,
          color: "#000",
          alpha: 1,
          y0: null,
          baseline: 0,
          fillOpacity: 0.18,
          strokeWidth: 1.5,
          dash: [4, 2],
        },
      ],
      limitBands: [],
      limitLines: [],
    });
    // The outline, then the (empty) stroke of lone points.
    expect(dashes).toEqual([[4, 2], []]);
  });
});


/* charts-review: at a zoomed edge the nearest reading can lie outside the
   plot, and the overlay layer is not clipped - its marker stood on the axis. */
describe("The hover marker", () => {
  function markers(x: number) {
    const arcs: number[] = [];
    const ctx = new Proxy({} as Record<string, unknown>, {
      get: (_, key) => (key === "arc" ? (ax: number) => arcs.push(ax) : () => undefined),
      set: () => true,
    }) as unknown as CanvasRenderingContext2D;
    drawOverlayLayer(ctx, {
      width: 400,
      height: 200,
      plot: { x: 40, y: 10, width: 300, height: 150 },
      theme: FALLBACK_THEME,
      hover: {
        hit: { xValue: 0, points: [], xPx: x, yPx: 50 },
        marker: [{ x, y: 50, color: "#000" }],
        mouseX: 45,
        mouseY: 50,
      },
      syncPx: null,
    });
    return arcs;
  }

  it("is drawn inside the plot", () => {
    expect(markers(100)).toEqual([100, 100]);
  });

  it("is not drawn outside it", () => {
    expect(markers(30)).toEqual([]);
    expect(markers(345)).toEqual([]);
  });
});

/* charts-alternatives 02 (C3): under encoding by marks a line's markers take
   their shape, and a bar is hatched across its fill - one stroke of lines,
   clipped to the bars, after their one fill. */
describe("Marks on the canvas", () => {
  it("draws a line's markers in their shape, still one fill", () => {
    const { filled } = draw({ ...line("always"), marker: "square" } as SeriesDrawItem);
    expect(filled).toHaveLength(1);
    expect(arcs(filled)).toBe(0);
    expect(filled[0]?.ops.filter(([name]) => name === "closePath")).toHaveLength(1);
  });

  it("hatches bars with one stroke after their fill, and not without a hatch", () => {
    const bars = (hatch?: "rising") =>
      draw({
        x: new Float64Array([100, 200]),
        y: new Float64Array([50, 80]),
        kind: "bar",
        length: 2,
        xScale,
        yScale,
        color: "#000",
        alpha: 1,
        y0: null,
        baseline: 0,
        offset: -10,
        width: 20,
        hatch,
      });
    expect(bars().stroked).toHaveLength(0);
    const hatched = bars("rising");
    expect(hatched.filled).toHaveLength(1);
    expect(hatched.stroked).toHaveLength(1);
    expect(hatched.stroked[0]?.ops.length).toBeGreaterThan(0);
  });
});

/* charts-stacking 02: a stacked bar stands on the stack below it - its foot
   channel -, not on the baseline. */
describe("Stacked bars", () => {
  it("draw each bar from its own foot to its top, and leave a gap out", () => {
    const { filled } = draw({
      x: new Float64Array([0, 1]),
      y: new Float64Array([60, Number.NaN]),
      y0: new Float64Array([20, Number.NaN]),
      kind: "bar",
      length: 2,
      xScale,
      yScale,
      color: "#000",
      alpha: 1,
      baseline: 0,
      offset: 0,
      width: 1,
    });
    const rects = filled[0]?.ops.filter(([name]) => name === "rect") ?? [];
    expect(rects).toHaveLength(1);
    // Top at 60 → y 40, foot at 20 → y 80: 40 pixels high.
    expect(rects[0]?.[2]).toBeCloseTo(40);
    expect(rects[0]?.[4]).toBeCloseTo(40);
  });
});

/* charts-stacking 04: between two stacked segments a 1px line in the ground's
   colour, so that neighbouring segments stay apart where their colours are
   alike - or, under forced colours, the same. */
describe("The edge between stacked segments", () => {
  const ground = FALLBACK_THEME.colorBg;
  const bars = (edges: boolean) =>
    draw({
      x: new Float64Array([100, 200]),
      y: new Float64Array([60, 50]),
      y0: new Float64Array([20, 0]),
      kind: "bar",
      length: 2,
      xScale,
      yScale,
      color: "#000",
      alpha: 1,
      baseline: 0,
      offset: -10,
      width: 20,
      edges,
    } as SeriesDrawItem);

  it("runs along a stacked bar's foot, 1px in the ground's colour, and not on the baseline", () => {
    const { strokes } = bars(true);
    expect(strokes).toHaveLength(1);
    expect(strokes[0]?.style).toBe(ground);
    expect(strokes[0]?.width).toBe(1);
    // Only the bar standing on another: its foot at 20 is y 80, from its left
    // edge to its right.
    expect(strokes[0]?.path.ops).toEqual([
      ["moveTo", 90, 80],
      ["lineTo", 110, 80],
    ]);
  });

  it("is not drawn for bars that are not stacked", () => {
    expect(bars(false).strokes).toHaveLength(0);
  });

  it("parts a stacked area from the one below, beneath its outline", () => {
    const area = (edges: boolean) =>
      draw({
        x: new Float64Array([0, 10]),
        y: new Float64Array([50, 60]),
        y0: new Float64Array([20, 30]),
        kind: "area",
        length: 2,
        xScale,
        yScale,
        color: "#000",
        alpha: 1,
        baseline: 0,
        fillOpacity: 0.18,
        strokeWidth: 1.5,
        edges,
      } as SeriesDrawItem);
    const plain = area(false).strokes;
    const { strokes } = area(true);
    expect(strokes).toHaveLength(plain.length + 1);
    // The ground first, a pixel wider than the outline on each side; the
    // outline over it, on the same path.
    expect(strokes[0]?.style).toBe(ground);
    expect(strokes[0]?.width).toBe(3.5);
    expect(strokes[1]?.style).toBe("#000");
    expect(strokes[1]?.path).toBe(strokes[0]?.path);
  });
});
